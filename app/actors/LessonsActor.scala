package actors

import akka.actor._
import play.api.Logger
import models.lesson.Lesson
import scala.io.Source
import play.api.libs.json.{ JsObject, Json, JsValue }
import utils.LangUtils
import java.io.File


/**
 * @author matthieu
 */

object LessonsActor {
  def props = Props[LessonsActor]

  val rootDirectory: String = if(play.Play.isProd) { "lessons" } else { "dist/lessons" }

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
      val lesson: Lesson = loadLesson(lessonName)

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

  def loadLesson(lessonName: String): Lesson = {
    val path: String = getLessonPath(lessonName, "main.json")
    val lines: String = Source.fromFile(path).mkString
    val json: JsValue = Json.parse(lines)

    json.as[Lesson]
  }

  def getLessonPath(lessonName: String, filePath: String): String = {
    (List(rootDirectory) ++ lessonName.split("\\.").toList ++ List(filePath)).mkString("/")
  }

  def getDescriptionPath(lessonName: String, langCode: String): String = {
    var path =  getLessonPath(lessonName, "short_desc")
    if(langCode != "en") {
      path += "." + langCode
    }
    path + ".html"
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
