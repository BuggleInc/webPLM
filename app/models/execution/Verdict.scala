package models.execution

import play.api.Logger
import actors.PLMActor
import play.api.libs.json._
import play.api.libs.json.JsValue.jsValueToJsLookup
import play.api.libs.json.Json.toJsFieldJsValueWrapper

/**
 * The Judge result generator & analyzer.
 * @author Tanguy Gloaguen
 */
object Verdict {
	val ackTimeout : Long = 10000;
	val launchTimeout : Long = 10000;
	val streamTimeout : Long = 10000;
  
  val streamRx = """{"type":"stream","content":"""
	/**
	 * Creates a Verdict message implementation from the given message + parameters.
	 * @param parent the parent tribunal.
	 * @param message the current message.
	 * @param plmActor the actor linked to the client.
	 */
	def handleMessage(parent : Tribunal, message: String, plmActor : PLMActor) {
    if(message.startsWith(streamRx)) {
        parent.setState("stream")
        stream(parent, message.substring(streamRx.length, message.length - 1), plmActor)
    }
    else {
        var jsMessage = Json.parse(message)
        var typeStr = (jsMessage \ "type").asOpt[String].getOrElse(None)
        typeStr match {
    			case "ack" =>
    				parent.setState("ack")
    				ack(parent)
    			case "launch" =>
    				parent.setState("launch")
    				launch(parent)
    			case "result" => 
    				parent.setState("reply")
    				reply(parent, jsMessage, plmActor)
          case _ =>
            dummy(message);
        }
		}
	}
	
	def dummy(msg : String) {
		Logger.warn("[judge] Wrong message format.");
		Logger.warn(msg);
	}
	
	def ack(parent : Tribunal) {
    Logger.debug("[judge] Acknowledge")
		parent.setTimeout(ackTimeout)
	}
	
	def launch(parent : Tribunal) {
    Logger.debug("[judge] Launched")
		parent.setTimeout(launchTimeout)
	}
	
	def stream(parent : Tribunal, msg : String, actor : PLMActor) {
    Logger.debug("[judge] Stream")
    actor.sendMessage("operations", Json.obj("buffer" -> msg))
		parent.setTimeout(streamTimeout)
	}
  
	def reply(parent : Tribunal, msg : JsValue, actor : PLMActor) {
    Logger.debug("[judge] Reply")
    var args: JsObject = Json.obj(
      "msgType" -> (msg \ "msgType").get,
      "msg" -> (msg \ "msg").get,
      "commonErrorID" -> (msg \ "commonErrorID").get,
      "commonErrorText" -> (msg \ "commonErrorText").get
    )
    actor.sendMessage("executionResult", args)
	  parent.endExecution(msg)
	}
}
