package controllers

import plm.core.model.Game
import java.util.Locale
import java.util.Map
import log.PLMLogger
import plm.core.model.lesson.Lesson
import java.io.PrintWriter
import java.io.File
import play.api.mvc._
import play.api.Logger


/**
 * @author matthieu
 */
class JSONGeneratorController extends Controller {
  
  def lessonsToJSONFiles() = Action { implicit request =>
    val game: Game = new Game("dummy", new PLMLogger, Locale.getDefault, "java", false)
    val lessons: Map[String, Lesson] = game.getMapLessons
    
    Game.lessonsName.foreach { lessonName =>
      val directoryName: String = lessonName.replaceAll("\\.", "/")
      val lesson: Lesson = lessons.get(lessonName)
      lesson.loadLesson()
      
      val dir: File = new File(directoryName)
      if(!dir.exists) {
        dir.mkdirs()
      }
      
      val file: File = new File(directoryName + "/main.json")
      val writer = new PrintWriter(file)
      writer.write(lesson.toJSON().toString())
      writer.close()
    }
    Ok("Lessons' JSON generated")
  }
}