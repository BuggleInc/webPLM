package log

import com.google.inject.Singleton
import play.api.Logger
import plm.core.log.LogHandler
import plm.core.log.{ Logger => LoggerSingleton }

@Singleton
class PLMLogger extends LogHandler {

  LoggerSingleton.setLogger(this)

  val INFO: Int = LogHandler.INFO
  val DEBUG: Int = LogHandler.DEBUG
  val ERROR: Int = LogHandler.ERROR

  override def log(logType: Int, message: String) {
    if(logType == INFO) {
      Logger.info(message)
    }
    else if(logType == DEBUG) {
      Logger.debug(message)
    }
    else {
      Logger.error(message)
    }
  }
}