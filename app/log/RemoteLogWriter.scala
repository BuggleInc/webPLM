package log

import actors.PLMActor
import play.api.libs.json._
import java.util.Locale
import java.util.regex.Matcher
import java.util.regex.Pattern
import javax.tools.Diagnostic
import javax.tools.DiagnosticCollector
import javax.tools.JavaFileObject
import plm.core.model.Game
import plm.core.model.LogWriter;

class RemoteLogWriter(plmActor: PLMActor, game: Game) extends LogWriter {
  
  game.setOutputWriter(this)
  game.setCaptureOutput(true)
  
  override def log(msg: String) {
    var mapArgs = Json.obj(
      "msg" -> msg
    )
    plmActor.sendMessage("log", mapArgs)
  }

  override def log(diagnostics: DiagnosticCollector[JavaFileObject]) {
    var res: String = ""
    var warnedJava6: Boolean = false;
    var isJava6Pattern = Pattern.compile("major version 51 is newer than 50, the highest major version supported by this compiler");
        
    diagnostics.getDiagnostics.toArray(Array[Diagnostic[JavaFileObject]]()).foreach { diagnostic => 
      var source: String = if(diagnostic.getSource == null) "(null)" else diagnostic.getSource.getName
      var msg: String = diagnostic.getMessage(game.getLocale)
      
      var isJava6Matcher: Matcher = isJava6Pattern.matcher(msg)
      if (isJava6Matcher.find) {
        if(!warnedJava6 && game.isDebugEnabled) {
          res += "You are using a PLM jarfile that was compiled for Java 6, but you have a Java 7 runtime. This is believed to work.\n"
          warnedJava6 = true
        } else {
          res += source+":"+diagnostic.getLineNumber()+":"+ msg+"\n"
        }
      }
    }
    var mapArgs = Json.obj(
      "msg" -> res
    )
    plmActor.sendMessage("log", mapArgs)
  }

  /**
   * Add an exception into the text area
   * 
   * @param e
   *            what to log
   */
  def log(e: Exception) {
    var res: String = e.toString() + "\n"
    e.getStackTrace.foreach { s =>
      if (s.getClassName.contains("bugglequest.BugglePanel"))
        return
      res += "  in " + s.getClassName + "." + s.getMethodName + " at " + s.getFileName + ":"
          + s.getLineNumber + "\n"
    }
    var t: Throwable = e.getCause
    if (t != null) {
      println("Caused by:\n  " + t.toString() + "\n");
      e.getStackTrace.foreach { s =>
        if (s.getClassName().contains("bugglequest.BugglePanel"))
          return
        res += "    in " + s.getClassName() + "." + s.getMethodName() + " at " + s.getFileName() + ":"
            + s.getLineNumber() + "\n"
      }

    }
    var mapArgs = Json.obj(
      "msg" -> res
    )
    plmActor.sendMessage("log", mapArgs)
  }
}