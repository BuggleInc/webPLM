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
	val streamTimeout : Long = 5000;
	/**
	 * Creates a Verdict message implementation from the given message + parameters.
	 * @param parent the parent tribunal.
	 * @param message the current message.
	 * @param plmActor the actor linked to the client.
	 */
	def build(parent : Tribunal, message: String, plmActor : PLMActor) : Verdict_msg = {
		var msgJson = Json.parse(message)
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
		def action() : Verdict_msg
    def delete()
	}
	
	private class Verdict_dummy(msg : JsValue) extends Verdict_msg {
		def action() : Verdict_msg = {
			Logger.warn("[judge] Wrong message format.");
			Logger.warn(msg.toString);
      this
		}
    def delete() {}
	}
	
	private class Verdict_ack(var parent : Tribunal) extends Verdict_msg {
		def action() : Verdict_msg =  {
      Logger.debug("[judge] Acknowledge")
			parent.setTimeout(ackTimeout)
      this
		}
    def delete() {parent = null}
	}
	
	private class Verdict_launch(var parent : Tribunal) extends Verdict_msg {
		def action() : Verdict_msg = {
      Logger.debug("[judge] Launched")
			parent.setTimeout(launchTimeout)
      this
		}
    def delete() {parent = null}
	}
	
	private class Verdict_stream(var parent : Tribunal, msg : JsValue, var actor : PLMActor) extends Verdict_msg {
		def action() : Verdict_msg = {
      Logger.debug("[judge] Stream")
			actor.sendMessage("operations", (msg \ "content"))
			parent.setTimeout(streamTimeout)
      this
		}
    def delete() {
      parent = null
      actor = null
    }
	}
	private class Verdict_reply(var parent : Tribunal, msg : JsValue, var actor : PLMActor) extends Verdict_msg {
		def action() : Verdict_msg = {
        Logger.debug("[judge] Reply")
        actor.sendMessage("executionResult", msg)
			  parent.endExecution(msg)
        this
		}
    def delete() {
      parent = null
      actor = null
    }
	}
}
