package models

import play.api.Logger
import actors.PLMActor
import play.api.libs.json._

/**
 * The Judge result generator & analyzer.
 * @author Tanguy Gloaguen
 */
object Verdict {
	val ackTimeout : Long = 10000;
	val launchTimeout : Long = 10000;
	val streamTimeout : Long = 10000;
  
  val streamRx = """\{\s*"type"\s*:\s*"stream"\s*,\s*"content":\s*(.+?)\s*}""".r
	/**
	 * Creates a Verdict message implementation from the given message + parameters.
	 * @param parent the parent tribunal.
	 * @param message the current message.
	 * @param plmActor the actor linked to the client.
	 */
	def build(parent : Tribunal, message: String, plmActor : PLMActor) : Verdict_msg = {
		message match {
      case streamRx(content) =>
        parent.setState("stream")
        return new Verdict_stream(parent, content, plmActor)
      case _ => 
        var JsMessage = Json.parse(message)
        var typeStr = (JsMessage \ "type").asOpt[String].getOrElse(None)
        typeStr match {
    			case "ack" =>
    				parent.setState("ack")
    				return new Verdict_ack(parent)
    			case "launch" =>
    				parent.setState("launch")
    				return new Verdict_launch(parent)
    			case "result" => 
    				parent.setState("reply")
    				return new Verdict_reply(parent, JsMessage, plmActor)
          case _ =>
            return new Verdict_dummy(message);
        }
		}
	}
	
	trait Verdict_msg {
		/**
		 * Executes the given Verdict's action.
		 */
		def action()
	}
	
	private class Verdict_dummy(msg : String) extends Verdict_msg {
		def action() {
			Logger.warn("[judge] Wrong message format.");
			Logger.warn(msg);
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
	
	private class Verdict_stream(parent : Tribunal, msg : String, actor : PLMActor) extends Verdict_msg {
		def action() {
      Logger.debug("[judge] Stream")
      var msgComp = ("""{"cmd":"operations","args":"""+msg+"}")
      actor.tell(msgComp)
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
