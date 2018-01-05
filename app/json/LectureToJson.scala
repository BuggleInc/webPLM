package json

import plm.core.model.lesson.Lecture
import play.Logger
import play.api.libs.json.{JsArray, JsValue, Json}
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.{Exercise, Exercises, Lecture}
import plm.utils.HtmlUtils

import scala.collection.JavaConverters._
import scala.concurrent.duration._
import scala.concurrent.{Await, Future}
import scala.language.postfixOps

class LectureToJson(exercises: Exercises) {

  type ExercisePassedChecker = (Exercise, ProgrammingLanguage) => Future[Boolean]

  def lectureWrite(
      lecture: Lecture,
      languageCode: String,
      progLang: ProgrammingLanguage,
      checkedExercisePassed: ExercisePassedChecker): JsValue = {
    val names: Map[String, String] = lecture.optNames.get
    val defaultName: String = names("en")
    val name: String = names.getOrElse(languageCode, defaultName)
    val exercisePassed: Map[String, Boolean] = generateExercisePassed(lecture.id, checkedExercisePassed)

    Json.obj(
      "id" -> lecture.id,
      "name" -> HtmlUtils.filter(name, progLang),
      "dependingLectures" -> lecturesWrite(lecture.dependingLectures, languageCode, progLang, checkedExercisePassed),
      "exercisePassed" -> exercisePassed
    )
  }

  def lecturesWrite(
      lectures: Traversable[Lecture],
      languageCode: String,
      progLang: ProgrammingLanguage,
      checkedExercisePassed: ExercisePassedChecker): JsArray = {
    JsArray(lectures.map(lectureWrite(_, languageCode, progLang, checkedExercisePassed)).toSeq)
  }

  private def generateExercisePassed(
      lectureId: String,
      checkedExercisePassed: ExercisePassedChecker): Map[String, Boolean] = {
    exercises.getExercise(lectureId) match {
      case Some(exercise: Exercise) =>
        val entries = exercise.getProgLanguages.asScala.view map { lang =>
          lang.getLang -> Await.result(checkedExercisePassed(exercise, lang), 5 seconds)
        }
        entries.toMap
      case None =>
        Logger.info(s"Lecture $lectureId not found")
        Map()
    }
  }
}
