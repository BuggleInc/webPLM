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

  def startExecution(exercise: Exercise, progLang: ProgrammingLanguage, code: String) {
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
            //signalExecutionTimeout
            state = Off
          }
          // The delivery will be "null" if nextDelivery timed out.
          else if (delivery != null) {
            //Verdict.handleMessage(self, new String(delivery.getBody(), "UTF-8"), plmActor)
          }
        }
        channelIn.close
      }
    }).start();
  }

  def receive =  {
    case StartExecution(out, exercise, progLang, code) =>
      startExecution(exercise, progLang, code)
      //sender ! executionResult
    case StopExecution() =>
      // TODO: Implement me
    case UpdateLang(lang: Lang) =>
      currentI18n = I18nFactory.getI18n(getClass(),"org.plm.i18n.Messages", lang.toLocale, I18nFactory.FALLBACK);
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }
}