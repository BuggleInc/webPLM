package actors.execution

import com.rabbitmq.client.Connection
import com.rabbitmq.client.ConnectionFactory
import com.rabbitmq.client.ConnectionFactory
import com.rabbitmq.client.Channel
import play.api.Play
import play.api.Play.current
import play.api.Logger
import org.xnap.commons.i18n.I18nFactory
import play.api.i18n.Lang
import org.xnap.commons.i18n.I18n
import models.execution.Tribunal
import com.rabbitmq.client.QueueingConsumer
import models.execution.Verdict
import plm.core.model.lesson.Exercise
import plm.core.lang.ProgrammingLanguage
import java.util.{ Map, HashMap }
import play.api.libs.json.JsObject
import play.api.libs.json.Json
import akka.actor.Props
import org.json.simple.JSONObject
import org.json.simple.parser._
import plm.core.model.lesson.ExecutionProgress
import akka.actor.ActorRef
import akka.pattern.AskTimeoutException

/**
 * @author matthieu
 */

object TribunalActor {
  
  def props(initialLang: Lang) = Props(new TribunalActor(initialLang))
  
  val QUEUE_NAME_REQUEST : String = "worker_in"
  val QUEUE_NAME_REPLY : String = "worker_out"

  val QUEUE_ADDR = Play.configuration.getString("messagequeue.addr").getOrElse("localhost")
  val QUEUE_PORT = Play.configuration.getString("messagequeue.port").getOrElse("5672")
  
  // Connection
  val factory : ConnectionFactory = new ConnectionFactory()
  factory.setHost(QUEUE_ADDR)
  factory.setPort(QUEUE_PORT.toInt)
  var connection : Connection = null
  try {
    connection = factory.newConnection()
  } catch {
    case _ : Exception =>
      Logger.error("[judge] ERROR : no connection with message queue")
  }
}

/**
* Tribunal state
*/
object TribunalState extends scala.Enumeration {
  type TribunalState = Value
  val Off, Waiting, Ack, Launched, Streaming, Replied = Value
}

class TribunalActor(initialLang: Lang)  extends ExecutionActor {
  import ExecutionActor._
  import TribunalActor._
  import TribunalState._
  
  val defaultTimeout : Long = 10000

  var state : TribunalState = Off
  var currentI18n: I18n = I18nFactory.getI18n(getClass(),"org.plm.i18n.Messages", initialLang.toLocale, I18nFactory.FALLBACK);
  var timeout : Long = 0
  var executionStopped: Boolean = false

  val argsOut: Map[String, Object] = new HashMap[String, Object]
  argsOut.put("x-message-ttl", defaultTimeout.asInstanceOf[Object])
  val argsIn: Map[String, Object] = new HashMap[String, Object]
  argsIn.put("x-message-ttl", 5000.asInstanceOf[Object])

  val channelOut : Channel = Tribunal.connection.createChannel
  channelOut.queueDeclare(Tribunal.QUEUE_NAME_REQUEST, false, false, false, argsOut)

  def receive =  {
    case StartExecution(out, exercise, progLang, code) =>
      startExecution(sender, out, exercise, progLang, code)
    case StopExecution =>
      executionStopped = true
    case UpdateLang(lang: Lang) =>
      currentI18n = I18nFactory.getI18n(getClass(),"org.plm.i18n.Messages", lang.toLocale, I18nFactory.FALLBACK);
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }

  def startExecution(plmActor: ActorRef, client: ActorRef, exercise: Exercise, progLang: ProgrammingLanguage, code: String) {
    new Thread(new Runnable() {
      override def run() {
        val replyQueue: String = Tribunal.QUEUE_NAME_REPLY + java.util.UUID.randomUUID.toString
        val channelIn : Channel = Tribunal.connection.createChannel
        channelIn.queueDeclare(replyQueue, false, false, true, argsIn)
        
        val consumer : QueueingConsumer = new QueueingConsumer(channelIn)
        channelIn.basicConsume(replyQueue, true, consumer)

        val parameters: JsObject = Json.obj(
            "exercise" -> exercise.toJSON.toString,
            "code" -> code,
            "language" -> progLang.getLang,
            "localization" -> currentI18n.getLocale.getLanguage,
            "replyQueue" -> replyQueue
        )

        channelOut.basicPublish("", Tribunal.QUEUE_NAME_REQUEST, null, parameters.toString.getBytes("UTF-8"))
        timeout = System.currentTimeMillis + defaultTimeout
        state = Waiting
        while(state != Replied && state != Off) {
          val delivery : QueueingConsumer.Delivery = consumer.nextDelivery(1000)
          if (executionStopped) {
            //signalExecutionStop
            state = Off
          }
          else if (System.currentTimeMillis > timeout) {
            handleTimeout(plmActor, progLang)
            state = Off
          }
          // The delivery will be "null" if nextDelivery timed out.
          else if (delivery != null) {
            handleMessage(plmActor, client, new String(delivery.getBody, "UTF-8"))
          }
        }
        channelIn.close
      }
    }).start();
  }

  def containsOperations(message: String): Boolean = {
    message.startsWith("""{"cmd":"operations"""") 
  }

  def handleMessage(plmActor: ActorRef, client: ActorRef, msg: String) {
    if(containsOperations(msg)) {
      // Handle separately operations to avoid too much parsing
      client ! msg
    }
    else {
      val p: JSONParser = new JSONParser()
      try {
        val json: JSONObject = p.parse(msg).asInstanceOf[JSONObject]
        val msgType: String = json.get("cmd").asInstanceOf[String]
        msgType match {
          case "executionResult" =>
            val jsonResult: JSONObject = json.get("result").asInstanceOf[JSONObject]
            val result: ExecutionProgress = new ExecutionProgress(jsonResult)
            plmActor ! result
          case _ =>
        }
      } catch {
        case e: ParseException => e.printStackTrace
      }
    }
  }

  def handleTimeout(plmActor: ActorRef, progLang: ProgrammingLanguage) {
    val result: ExecutionProgress = new ExecutionProgress(progLang, currentI18n)
    result.setTimeoutError
    plmActor ! result
  }
}