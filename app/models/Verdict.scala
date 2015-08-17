package models

import play.api.Logger
import actors.PLMActor
import play.api.libs.json._

/**
 * The Judge result generator & analyzer.
 * @author Tanguy Gloaguen
 */
object Verdict {
	val ackTimeout : Long = 5000;
	val launchTimeout : Long = 5000;
	val streamTimeout : Long = 1050;
	/**
	 * Creates a Verdict message implementation from the given message + parameters.
	 * @param parent the parent tribunal.
	 * @param message the current message.
	 * @param plmActor the actor linked to the client.
	 */
	def build(parent : Tribunal, message: String, plmActor : PLMActor) : Verdict_msg = {
		def msgJson = Json.parse(message)
		(msgJson \ "type").asOpt[String].getOrElse(None) match {
			case "ack" =>
				parent.setState("ack")
				return new Verdict_ack(parent)
			case "launch" =>
				parent.setState("launch")
				return new Verdict_launch(parent)
			case "stream" =>
				parent.setState("stream")
				return new Verdict_stream(parent, msgJson, plmActor)
			case "result" => 
				parent.setState("reply")
				return new Verdict_reply(parent, msgJson, plmActor)
			case _ =>
				return new Verdict_dummy(msgJson);
		}
	}
	
	trait Verdict_msg {
		/**
		 * Executes the given Verdict's action.
		 */
		def action()
	}
	
	private class Verdict_dummy(msg : JsValue) extends Verdict_msg {
		def action() {
			Logger.warn("[judge] Wrong message format.");
			Logger.warn(msg.toString);
		}
	}
	
	private class Verdict_ack(parent : Tribunal) extends Verdict_msg {
		def action() {
            Logger.debug("[judge] Acknowledge")
			parent.setTimeout(ackTimeout)
		}
	}
	
	private class Verdict_launch(parent : Tribunal) extends Verdict_msg {
		def action() {
            Logger.debug("[judge] Launched")
			parent.setTimeout(launchTimeout)
		}
	}
	
	private class Verdict_stream(parent : Tribunal, msg : JsValue, actor : PLMActor) extends Verdict_msg {
		def action() {
            Logger.debug("[judge] Stream")
			actor.sendMessage("operations", (msg \ "content"))
			parent.setTimeout(streamTimeout)
		}
	}
	private class Verdict_reply(parent : Tribunal, msg : JsValue, actor : PLMActor) extends Verdict_msg {
		def action() {
              Logger.debug("[judge] Reply")
              actor.sendMessage("executionResult", msg)
			  parent.endExecution(msg)
		}
	}
}
