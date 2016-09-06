package actors.execution

import com.rabbitmq.client.Connection
import com.rabbitmq.client.ConnectionFactory
import com.rabbitmq.client.Channel
import play.api.Play
import play.api.Play.current
import play.api.Logger
import play.api.i18n.Lang
import com.rabbitmq.client.QueueingConsumer
import plm.core.model.lesson.Exercise
import plm.core.lang.ProgrammingLanguage
import java.util.{ Map, HashMap }
import akka.actor.Props
import plm.core.model.lesson.ExecutionProgress
import akka.actor.ActorRef
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import java.util.UUID
import java.util.Locale
import plm.core.model.json.JSONUtils
import com.fasterxml.jackson.databind.JsonNode

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
object TribunalState extends Enumeration {
  type TribunalState = Value
  val Off, Waiting, Ack, Launched, Streaming, Replied = Value
}

class TribunalActor(initialLang: Lang) extends ExecutionActor {
  import ExecutionActor._
  import TribunalActor._
  import TribunalState._
  
  val defaultTimeout : Long = 15000

  var state : TribunalState = Off
  var currentLocale: Locale = initialLang.toLocale
  var timeout : Long = 0
  var executionStopped: Boolean = false

  val argsOut: Map[String, Object] = new HashMap[String, Object]
  argsOut.put("x-message-ttl", defaultTimeout.asInstanceOf[Object])
  val argsIn: Map[String, Object] = new HashMap[String, Object]
  argsIn.put("x-message-ttl", defaultTimeout.asInstanceOf[Object])

  val channelOut : Channel = connection.createChannel
  channelOut.queueDeclare(QUEUE_NAME_REQUEST, false, false, false, argsOut)

  def receive =  {
    case StartExecution(out, exercise, progLang, code) =>
      startExecution(sender, out, exercise, progLang, code)
    case StopExecution =>
      executionStopped = true
    case UpdateLang(lang: Lang) =>
      currentLocale = lang.toLocale
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }

  def startExecution(plmActor: ActorRef, client: ActorRef, exercise: Exercise, progLang: ProgrammingLanguage, code: String) {
    Future {
      val replyQueue: String = QUEUE_NAME_REPLY + UUID.randomUUID.toString
      val channelIn : Channel = connection.createChannel
      channelIn.queueDeclare(replyQueue, false, false, true, argsIn)
 
      val consumer : QueueingConsumer = new QueueingConsumer(channelIn)
      channelIn.basicConsume(replyQueue, true, consumer)

      val parameters: Map[String, Object] = new HashMap[String, Object]
      parameters.put("exercise", JSONUtils.exerciseToJudgeJSON(exercise)) // To remove incorrect entities' type
      parameters.put("code", code)
      parameters.put("language", progLang.getLang)
      parameters.put("localization", currentLocale.getLanguage)
      parameters.put("replyQueue", replyQueue)
      
      val json: String = JSONUtils.mapToJSON(parameters)

      channelOut.basicPublish("", QUEUE_NAME_REQUEST, null, json.getBytes("UTF-8"))
      timeout = System.currentTimeMillis + defaultTimeout
      state = Waiting
      executionStopped = false
      while(state != Replied && state != Off) {
        val delivery : QueueingConsumer.Delivery = consumer.nextDelivery(1000)
        if (executionStopped) {
          handleStopExecution(plmActor, progLang)
          state = Off
        }
        else if (System.currentTimeMillis > timeout) {
          handleTimeout(plmActor, progLang)
          state = Off
        }
        // The delivery will be "null" if nextDelivery timed out.
        else if (delivery != null) {
          state = handleMessage(plmActor, client, progLang, new String(delivery.getBody, "UTF-8"))
        }
      }
      channelIn.close
    }
  }

  def containsOperations(message: String): Boolean = {
    message.startsWith("""{"cmd":"operations"""")
  }

  def handleMessage(plmActor: ActorRef, client: ActorRef, progLang: ProgrammingLanguage, msg: String): TribunalState = {
    var state: TribunalState = Streaming
    if(containsOperations(msg)) {
      // Handle separately operations to avoid too much parsing
      client ! msg
    }
    else {
      val json: JsonNode = JSONUtils.mapper.readTree(msg)
      val msgType: String = json.path("cmd").asText
      msgType match {
        case "executionResult" =>
          val result: ExecutionProgress = JSONUtils.mapper.treeToValue(json.path("args").path("result"), classOf[ExecutionProgress])
          result.language = progLang
          plmActor ! result
          state = Replied
        case _ =>
      }
    }
    state
  }

  def handleTimeout(plmActor: ActorRef, progLang: ProgrammingLanguage) {
    val result: ExecutionProgress = new ExecutionProgress(progLang, currentLocale)
    result.setTimeoutError
    plmActor ! result
  }

  def handleStopExecution(plmActor: ActorRef, progLang: ProgrammingLanguage) {
    val result: ExecutionProgress = new ExecutionProgress(progLang, currentLocale)
    result.setStopError
    plmActor ! result
  }

  override def postStop() = {
    Logger.debug("postStop: websocket closed - tribunalActor stopped")
    channelOut.close
  }
}
