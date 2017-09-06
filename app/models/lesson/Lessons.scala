package models.lesson

import java.io.InputStream

import play.api.Play.current
import play.api.libs.json.{JsValue, Json}
import play.api.{Logger, Play}
import utils.LangUtils

import scala.io.Source

/**
 * @author matthieu
 */

object Lessons {
  // WARNING, keep ChooseLessonDialog.lessons synchronized
  private val lessonIds: Array[String] =
    Array(
      "welcome",
      "sort.basic",
      "sort.dutchflag",
      "maze",
      // "turmites",
      "turtleart",
      "sort.baseball",
      "sort.pancake",
      "recursion.cons",
      "recursion.logo",
      "recursion.hanoi"
      // "bat.string1"
    )

  private val lessons: Map[String, Lesson] = initLessons()

  val lessonsList: Array[Lesson] = sortLessons()

  def lessonExists(lessonId: String): Boolean =
    lessonIds.contains(lessonId)

  def exerciseExists(lessonId: String, exerciseId: String): Boolean =
    lessonExists(lessonId) && lessons(lessonId).containsExercise(exerciseId)

  def exercisesList(lessonId: String): Array[Lecture] =
    lessons(lessonId).lectures

  def firstExerciseId(lessonId: String): String =
    lessons(lessonId).lectures(0).id

  private def initLessons(): Map[String, Lesson] = {
    var lessons: Map[String, Lesson] = Map()
    lessonIds.foreach { lessonName =>
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

  private def sortLessons(): Array[Lesson] = {
    var orderedLessons: Array[Lesson] = Array[Lesson]()
    lessonIds.foreach { lessonID =>
      orderedLessons = orderedLessons :+ lessons(lessonID)
    }
    orderedLessons
  }

  private def loadLesson(lessonName: String): Option[Lesson] = {
    Play.resourceAsStream(lessonName.replace(".", "/") + "/main.json") match {
      case Some(is: InputStream) =>
        val lines: String = Source.fromInputStream(is)("UTF-8").mkString
        is.close()
        val json: JsValue = Json.parse(lines)
        Some(json.as[Lesson])
      case None =>
        None
    }
  }

  private def getDescriptions(lessonName: String): Map[String, String] = {
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
          is.close()
          descriptions = descriptions ++ Map(lang.code -> description)
        case None =>
          Logger.warn(lessonName + "'s " + lang.language + " description is missing...")
      }
    }

    descriptions
  }
}
