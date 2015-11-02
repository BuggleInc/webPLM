package actors

import akka.actor._
import play.api.Logger
import models.lesson.{ Exercise, Lesson}
import scala.io.Source
import play.api.libs.json.{ JsObject, Json, JsValue }
import utils.LangUtils
import java.io.File


/**
 * @author matthieu
 */

object LessonsActor {
  def props = Props[LessonsActor]

  case class GetLessonsList()
  case class GetExercisesList(lessonName: String)

  val lessonsName: Array[String] = Array( // WARNING, keep ChooseLessonDialog.lessons synchronized
    "welcome", "maze", "turmites", "turtleart",
    "sort/basic", "sort/dutchflag", "sort/baseball", "sort/pancake", 
    "recursion/cons", "recursion/logo", "recursion/hanoi",
    "bat/string1"
  )

  var lessons: Map[String, Lesson] = Map()
  var orderedLessons: Array[Lesson] = Array[Lesson]()
  
  initLessons

  def initLessons() {
    lessonsName.foreach { lessonName =>
      var lesson: Lesson = loadLesson(lessonName)
      
      var descriptions: Map[String, String] = Map()
      LangUtils.getAvailableLangs().foreach { lang =>
        val path: String = getDescriptionPath(lessonName, lang.code)
        if(new File(path).exists) {
          val description: String = Source.fromFile(path).mkString
          descriptions = descriptions ++ Map(lang.code -> description)
        }
      }
      lesson.optDescriptions = Some(descriptions)
      lessons += (lessonName -> lesson)
      orderedLessons = orderedLessons :+ lesson
    }
  }

  def loadLesson(lessonName: String): Lesson = {
    val path: String = getLessonPath(lessonName, "main.json")
    val lines: String = Source.fromFile(path).mkString
    val json: JsValue = Json.parse(lines)

    json.as[Lesson]
  }
  
  def getLessonPath(lessonName: String, filePath: String): String = {
    return "lessons/" + lessonName + "/" + filePath
  }
  
  def getDescriptionPath(lessonName: String, langCode: String): String = {
    var path =  getLessonPath(lessonName, "short_desc")
    if(langCode != "en") {
      path += "." + langCode
    }
    return path + ".html"
  }
}

class LessonsActor extends Actor {
  import LessonsActor._
  
  def receive =  {
    case GetLessonsList =>
      sender ! orderedLessons
    case GetExercisesList(lessonName) =>
      sender ! getLesson(lessonName).lectures
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }

  def getLesson(lessonName: String): Lesson = lessons.get(lessonName).get
}