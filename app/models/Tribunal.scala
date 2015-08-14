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
/**
 * The interface between PLM and the judges
 * @author Tanguy Gloaguen
 */
class Tribunal extends Runnable {
	// Config options
	val defaultTimeout : Long = 5000
	val QUEUE_NAME_REQUEST : String = "worker_in"
	val QUEUE_NAME_REPLY : String = "worker_out"

	var QUEUE_ADDR = Play.configuration.getString("messagequeue.addr").getOrElse("localhost")
	var QUEUE_PORT = Play.configuration.getString("messagequeue.port").getOrElse("5672")
	var timeout : Long = 0
	// Game launch data
	var actor : PLMActor = _
	var git : Git = _
	// Launch parameters
	var parameters : JsValue = _

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
	def startTribunal(plmActor:PLMActor, git:Git, language : String, progLanguage : String, lessonID:String, exerciseID:String, code:String) {
		setData(plmActor, git, language, progLanguage, lessonID, exerciseID, code)
		(new Thread(this)).start()
	}
	private def setData(newActor:PLMActor, newGit:Git, language : String, progLanguage : String, lessonID:String, exerciseID:String, code:String) {
		git = newGit
		actor = newActor
		parameters = Json.obj(
				"lesson" -> ("lessons." + lessonID),
				"exercise" -> exerciseID,
				"localization" -> language,
				"language" -> progLanguage,
				"code" -> code
			)
		state = Off
	}

	override def run() {
		// Parameters
		var corrId : String = java.util.UUID.randomUUID().toString();
		// This part handles compilation with workers.
	// Properties
		var props : BasicProperties = new BasicProperties.Builder().correlationId(corrId).expiration(""+defaultTimeout).replyTo(QUEUE_NAME_REPLY).build()
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
				signalExecutionEnd("The server encountered an unexpected error. Try again later")
				return
		}
	// Request channel opening.
		var channelOut : Channel = connection.createChannel()
		channelOut.queueDeclare(QUEUE_NAME_REQUEST, false, false, false, null)
	// Request
		channelOut.basicPublish("", QUEUE_NAME_REQUEST, props,
		parameters.toString.getBytes("UTF-8"))
		channelOut.close()
	// Reply channel opening
		var channelIn : Channel = connection.createChannel()
		channelIn.queueDeclare(QUEUE_NAME_REPLY, false, false, false, null)
	// Reply
		Logger.debug("[judge] waiting as " + corrId)
		replyLoop(channelIn, corrId)
		channelIn.close()
	// Close connection
		connection.close()
	}

	private def replyLoop(channelIn : Channel, corrId : String) {
		var consumer : QueueingConsumer = new QueueingConsumer(channelIn)
		channelIn.basicConsume(QUEUE_NAME_REPLY, false, consumer)
		timeout = System.currentTimeMillis + defaultTimeout
		state = Waiting
		while(state != Replied && state != Off) {
			var delivery : QueueingConsumer.Delivery = consumer.nextDelivery(1000)
			if(System.currentTimeMillis > timeout) {
        if(state == Replied)
          signalExecutionEnd("You interrupted the execution.")
        else
				  signalExecutionEnd("The compiler timed out.")
				state = Off
			}
			// The delivery will be "null" if nextDelivery timed out.
			else if (delivery != null) {
				// Is the message for us ?
				if (delivery.getProperties().getCorrelationId().equals(corrId)) {
					channelIn.basicAck(delivery.getEnvelope().getDeliveryTag(), false)
					Verdict.build(this, new String(delivery.getBody(), "UTF-8"), actor).action().delete()
				}
				else
					channelIn.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true)
			}
		}
	}

	private def signalExecutionEnd(endMessage : String) {
		Logger.debug("[judge] " + endMessage)
		actor.sendMessage("executionResult", Json.obj(
				"outcome" -> "UNKNOWN",
				"msgType" -> "0",
				"msg" -> endMessage)
			)
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
		git.gitEndExecutionPush(msg, (parameters \ "code").asOpt[String].getOrElse(""));
	}

	/**
	* Explicitly asks for PLM to stop waiting for replies.
	*/
	def free() {
    setState("reply");
		timeout = 0;
	}
}
