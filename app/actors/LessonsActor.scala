package actors

import akka.actor._
import play.api.Logger
import models.lesson.Lesson

import scala.io.Source
import play.api.libs.json.{JsObject, JsValue, Json}
import utils.LangUtils
import java.io.{File, InputStream}

import play.api.Play
import play.api.Play.current

/**
 * @author matthieu
 */

object LessonsActor {
  def props = Props[LessonsActor]

  case class LessonExists(lessonID: String)
  case class CheckLessonAndExercise(lessonID: String, exerciseID: String)
  case class GetLessonsList()
  case class GetExercisesList(lessonID: String)
  case class GetFirstExerciseID(lessonID: String)

  val lessonsID: Array[String] = Array( // WARNING, keep ChooseLessonDialog.lessons synchronized
    "welcome", "maze", "turmites", "turtleart",
    "sort.basic", "sort.dutchflag", "sort.baseball", "sort.pancake",
    "recursion.cons", "recursion.logo", "recursion.hanoi",
    "bat.string1"
  )

  val lessons: Map[String, Lesson] = initLessons
  val orderedLessons: Array[Lesson] = sortLessons

  def initLessons(): Map[String, Lesson] = {
    var lessons: Map[String, Lesson] = Map()
    lessonsID.foreach { lessonName =>
      loadLesson(lessonName) match {
        case Some(lesson: Lesson) =>
          val descriptions: Map[String, String] = getDescriptions(lessonName)
          lesson.optDescriptions = Some(descriptions)
          lessons += (lessonName -> lesson)
        case None =>
          Logger.error(lessonName + " is missing...")
      }
    }
    lessons
  }

  def sortLessons(): Array[Lesson] = {
    var orderedLessons: Array[Lesson] = Array[Lesson]()
    lessonsID.foreach { lessonID =>
      orderedLessons = orderedLessons :+ lessons.get(lessonID).get
    }
    orderedLessons
  }

  def loadLesson(lessonName: String): Option[Lesson] = {
    Play.resourceAsStream(lessonName.replace(".", "/") + "/main.json") match {
      case Some(is: InputStream) =>
        val lines: String = Source.fromInputStream(is)("UTF-8").mkString
        is.close
        val json: JsValue = Json.parse(lines)
        Some(json.as[Lesson])
      case None =>
        None
    }
  }

  def getDescriptions(lessonName: String): Map[String, String] = {
    var descriptions: Map[String, String] = Map()
    LangUtils.getAvailableLangs().foreach { lang =>

      var path = lessonName.replace(".", "/") + "/short_desc"
      if(lang.code != "en") {
        path += "." + lang.code
      }
      path += ".html"

      Play.resourceAsStream(path) match {
        case Some(is: InputStream) =>
          val description = Source.fromInputStream(is)("UTF-8").getLines().mkString("\n")
          is.close
          descriptions = descriptions ++ Map(lang.code -> description)
        case None =>
          Logger.error(lessonName + "'s " + lang.language + " description is missing...")
      }
    }

    descriptions
  }

}

class LessonsActor extends Actor {
  import LessonsActor._

  def receive =  {
    case LessonExists(lessonID) =>
      sender ! lessonsID.contains(lessonID)
    case CheckLessonAndExercise(lessonID, exerciseID) =>
      sender ! ( lessonsID.contains(lessonID) && getLesson(lessonID).containsExercise(exerciseID) )
    case GetLessonsList =>
      sender ! orderedLessons
    case GetExercisesList(lessonID) =>
      sender ! getLesson(lessonID).lectures
    case GetFirstExerciseID(lessonID) =>
      sender ! getLesson(lessonID).lectures(0).id
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }

  def getLesson(lessonName: String): Lesson = lessons.get(lessonName).get
}
