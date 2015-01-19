package log

import play.Logger
import plm.core.model.Game

object LoggerUtils {
  val GAME = Game.getInstance
  
  def trace(s: String) {
    GAME.setCaptureOutput(false)
    Logger.trace(s)
    GAME.setCaptureOutput(true)
  }
  
  def debug(s: String) {
    GAME.setCaptureOutput(false)
    Logger.debug(s)
    GAME.setCaptureOutput(true)
  }
  
  def warn(s: String) {
    GAME.setCaptureOutput(false)
    Logger.warn(s)
    GAME.setCaptureOutput(true)
  }
  
  def error(s: String) {
    GAME.setCaptureOutput(false)
    Logger.error(s)
    GAME.setCaptureOutput(true)
  }
}