package models.lesson

import java.io.InputStream

import org.slf4j.Logger
import play.api.libs.json.Json

import scala.io.Source

/**
 * @author matthieu
 */

class Lessons(logger: Logger, availableLanguageCodes: Iterable[String]) {
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

  val lessonsList: Array[Lesson] = lessonIds.map(lessons(_))

  def lessonExists(lessonId: String): Boolean =
    lessonIds.contains(lessonId)

  def exerciseExists(lessonId: String, exerciseId: String): Boolean =
    lessonExists(lessonId) && lessons(lessonId).containsExercise(exerciseId)

  def exercisesList(lessonId: String): Array[Lecture] =
    lessons(lessonId).lectures

  def firstExerciseId(lessonId: String): String =
    lessons(lessonId).lectures(0).id

  private def initLessons(): Map[String, Lesson] = {
    val entries = for {
      lessonId <- lessonIds.view
      lesson <- loadLesson(lessonId)
    } yield {
      lesson.optDescriptions = Some(loadDescriptions(lessonId))
      lessonId -> lesson
    }
    entries.toMap
  }

  private def loadLesson(lessonName: String): Option[Lesson] = {
    val path = lessonName.replace(".", "/") + "/main.json"
    withResource(path) {
      case Some(is: InputStream) =>
        Some(Json.parse(is).as[Lesson])
      case None =>
        logger.error(s"Lesson $lessonName is missing.")
        None
    }
  }

  private def loadDescriptions(lessonName: String): Map[String, String] = {
    val entries = for {
      languageCode <- availableLanguageCodes.view
      description <- loadDescription(lessonName, languageCode)
    } yield languageCode -> description
    entries.toMap
  }

  private def loadDescription(lessonName: String, languageCode: String): Option[String] = {
    val prefix = lessonName.replace(".", "/")
    val suffix = if (languageCode != "en") "." + languageCode else ""
    val path = s"$prefix/short_desc$suffix.html"
    withResource(path) {
      case Some(is: InputStream) =>
        Some(Source.fromInputStream(is)("UTF-8").mkString)
      case None =>
        logger.warn(s"$languageCode description for lesson $lessonName is missing.")
        None
    }
  }

  private def withResource[O](fileName: String)(action: Option[InputStream] => O): O = {
    val maybeInputStream = Option(getClass.getClassLoader.getResourceAsStream(fileName))
    try {
      action(maybeInputStream)
    } finally {
      maybeInputStream.foreach(_.close())
    }
  }
}
