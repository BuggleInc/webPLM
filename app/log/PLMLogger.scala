package log

import plm.core.model.LogHandler

import actors.PLMActor
import play.api.libs.json._
import play.api.Logger

class PLMLogger(plmActor: PLMActor) extends LogHandler {
  
  val INFO = LogHandler.INFO
  val DEBUG = LogHandler.DEBUG
  val ERROR = LogHandler.ERROR
  
  override def log(logType: Int, message: String) {
    logType match {
      case INFO =>
        Logger.info(message)
      case DEBUG =>
        Logger.debug(message)
      case ERROR =>
        Logger.error(message)
        
    }
  }
  override def send(logType: Int, msg: String) {
    var mapArgs = Json.obj(
      "msg" -> msg
    )
    plmActor.sendMessage("log", mapArgs)
  }
}