package models

import com.rabbitmq.client.ConnectionFactory
import com.rabbitmq.client.Connection
import com.rabbitmq.client.Channel
import com.rabbitmq.client.QueueingConsumer
import com.rabbitmq.client.AMQP.BasicProperties
import plm.core.model.Game
import play.api.Logger
import actors.PLMActor
import play.api.libs.json._
import play.api.Play
import play.api.Play.current

object Tribunal {
  val QUEUE_NAME_REQUEST : String = "worker_in"
  val QUEUE_NAME_REPLY : String = "worker_out"

  var QUEUE_ADDR = Play.configuration.getString("messagequeue.addr").getOrElse("localhost")
  var QUEUE_PORT = Play.configuration.getString("messagequeue.port").getOrElse("5672")
  
  // Connection
  var factory : ConnectionFactory = new ConnectionFactory()
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
 * The interface between PLM and the judges
 * @author Tanguy Gloaguen
 */
class Tribunal extends Runnable {
	// Config options
	val defaultTimeout : Long = 10000
	var timeout : Long = 0
  var stopExecution: Boolean = false
	// Game launch data
	var actor : PLMActor = _
	var git : Git = _
	// Launch parameters
	var parameters : JsObject = _

	/**
	* Tribunal state
	*/
	object TribunalState extends scala.Enumeration {
		type TribunalState = Value
		val Off, Waiting, Ack, Launched, Streaming, Replied = Value
	}
	import TribunalState._
	var state : TribunalState = Off

	/**
	* Start a tribunal
	* @param newActor the PLMActor handling communications with the client
	* @param newGit the Git interface linked to the urrent user.
	* @param game the current game instance
	* @param lessonID the loaded lesson
	* @param exerciseID the loaded exercise
	* @param code the code to execute
	*/
	def startTribunal(plmActor:PLMActor, git:Git, game:Game, lessonID:String, exerciseID:String, code:String) {
		setData(plmActor, git, game, lessonID, exerciseID, code)
		(new Thread(this)).start
	}
  
	private def setData(newActor:PLMActor, newGit:Git, game:Game, lessonID:String, exerciseID:String, code:String) {
		git = newGit
		actor = newActor
		parameters = Json.obj(
				"lesson" -> ("lessons." + lessonID),
				"exercise" -> exerciseID,
				"localization" -> game.getLocale.getLanguage,
				"language" -> game.getProgrammingLanguage.getLang,
				"code" -> code
			)
		state = Off
    stopExecution = false
	}

	override def run() {
		// Parameters
    var replyQueue: String = Tribunal.QUEUE_NAME_REPLY + java.util.UUID.randomUUID.toString
    var finalParameters: JsObject = parameters.++(Json.obj("replyQueue" -> replyQueue))
		// This part handles compilation with workers.
		// Request channel opening.
		var channelOut : Channel = Tribunal.connection.createChannel()
		channelOut.queueDeclare(Tribunal.QUEUE_NAME_REQUEST, false, false, false, null)
		// Request
		channelOut.basicPublish("", Tribunal.QUEUE_NAME_REQUEST, null, finalParameters.toString.getBytes("UTF-8"))
		channelOut.close()
		// Reply channel opening
		var channelIn : Channel = Tribunal.connection.createChannel()
		channelIn.queueDeclare(replyQueue, false, false, true, null)
		// Reply
		Logger.debug("[judge] waiting as " + replyQueue)
    replyLoop(channelIn, replyQueue)
		channelIn.close()
	}

	private def replyLoop(channelIn : Channel, replyQueue: String) {
		var consumer : QueueingConsumer = new QueueingConsumer(channelIn)
		channelIn.basicConsume(replyQueue, false, consumer)
		timeout = System.currentTimeMillis + defaultTimeout
		state = Waiting
		while(state != Replied && state != Off) {
			var delivery : QueueingConsumer.Delivery = consumer.nextDelivery(1000)
			if (stopExecution) {
        signalExecutionStop
        state = Off
      }
      else if (System.currentTimeMillis > timeout) {
				signalExecutionTimeout
				state = Off
			}
			// The delivery will be "null" if nextDelivery timed out.
			else if (delivery != null) {
				Verdict.build(this, new String(delivery.getBody(), "UTF-8"), actor).action()
			}
		}
	}

  private def signalExecutionStop() {
    var message: String = "The execution has been stopped."
    Logger.debug("[judge] " + message)
    actor.sendMessage("executionResult", Json.obj(
        "outcome" -> "stop",
        "msgType" -> 0,
        "msg" -> message
        )
      )
    var code: String = (parameters \ "code").asOpt[String].getOrElse("")
    var error: String = ""
    var outcome: String = "stop"
    git.commitExecutionResult(code, error, outcome, None, None)    
  }
  
  
	private def signalExecutionTimeout() {
    var message: String = "The compiler timed out."
		Logger.debug("[judge] " + message)
		actor.sendMessage("executionResult", Json.obj(
				"outcome" -> "timeout",
				"msgType" -> 0,
				"msg" -> message
        )
      )
    var code: String = (parameters \ "code").asOpt[String].getOrElse("")
    var error: String = ""
    var outcome: String = "timeout"
    git.commitExecutionResult(code, error, outcome, None, None)
	}

	/**
	* Used by verdicts to set the timeout.
	* @param next time allowed until the next message.
	*/
	def setTimeout(next : Long) {
		timeout = System.currentTimeMillis + next
	}

	/**
	* Set the tribunal state.
	* @param stateName The state name, which should be the message's type.
	*/
	def setState(stateName : String) {
		stateName match {
			case "ack" => state = Ack
			case "launch" => state = Launched
			case "stream" => state = Streaming
			case "reply" => state = Replied
			case _ => state = Off
		}
	}

	/**
	* Used by verdicts to signal the end of the judge's work.
	* @param msg the Judge's JSON message.
	*/
	def endExecution(msg : JsValue) {
    var code: String = (parameters \ "code").asOpt[String].getOrElse("")
    var error: String = (msg \ "msg").asOpt[String].getOrElse("")
    var outcome: String = (msg \ "outcome").asOpt[String].getOrElse("")
    var optTotalTests: Option[String] = (msg \ "totaltests").asOpt[String]
    var optPassedTests: Option[String] = (msg \ "passedtests").asOpt[String]
    git.commitExecutionResult(code, error, outcome, optTotalTests, optPassedTests)
	}

	/**
	* Explicitly asks for PLM to stop waiting for replies.
	*/
	def free() {
		stopExecution = true
	}
}
