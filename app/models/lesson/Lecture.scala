package models.lesson

import models.lesson.Lecture.ExercisePassedChecker
import org.slf4j.Logger
import play.api.libs.functional.syntax._
import play.api.libs.json._
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.Exercise
import plm.core.ui.PlmHtmlEditorKit

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.concurrent.{Await, Future}
import scala.language.postfixOps

/**
 * @author matthieu
 */
object Lecture {

  type ExercisePassedChecker = (Exercise, ProgrammingLanguage) => Future[Boolean]

  implicit lazy val lectureReads: Reads[Lecture] = (
    (JsPath \ "id").read[String] and
    (JsPath \ "names").readNullable[Map[String, String]] and
    (JsPath \ "dependingLectures").lazyRead(Reads.seq[Lecture](lectureReads))
  )(Lecture.apply _)

  def arrayToJson(logger: Logger, checkExercisePassed: ExercisePassedChecker, lectures: Array[Lecture], languageCode: String, progLang: ProgrammingLanguage, exercises: Exercises): JsArray = {
    var jsonLectures: JsArray = Json.arr()
    lectures.foreach { lecture: Lecture =>
      jsonLectures = jsonLectures.append(lecture.toJson(logger, checkExercisePassed, languageCode, progLang, exercises))
    }
    jsonLectures
  }
}

case class Lecture(id: String, optNames: Option[Map[String, String]], dependingLectures: Seq[Lecture]) {
  def orderIDs(): Array[String] = {
    var array: Array[String] = Array()
    
    array = array.+:(id)
    
    dependingLectures.foreach { lecture =>
      array = array ++ lecture.orderIDs
    }
    
    array
  }

  def toJson(logger: Logger, checkedExercisePassed: ExercisePassedChecker, languageCode: String, progLang: ProgrammingLanguage, exercises: Exercises): JsObject = {
    val names: Map[String, String] = optNames.get
    val defaultName: String = names.get("en").get
    val name: String = names.getOrElse(languageCode, defaultName)

    val exercisePassed: Map[String, Boolean] = generateExercisePassed(logger, checkedExercisePassed, exercises)

    Json.obj(
      "id" -> id,
      "name" -> PlmHtmlEditorKit.filterHTML(name, false, progLang),
      "dependingLectures" -> Lecture.arrayToJson(logger, checkedExercisePassed, dependingLectures.toArray, languageCode, progLang, exercises),
      "exercisePassed" -> exercisePassed
    )
  }

  def generateExercisePassed(logger: Logger, checkedExercisePassed: ExercisePassedChecker, exercises: Exercises): Map[String, Boolean] = {
    var exercisePassed: Map[String, Boolean] = Map()

    exercises.getExercise(id) match {
      case Some(exercise: Exercise) =>
        exercise.getProgLanguages.toArray(Array[ProgrammingLanguage]()).foreach { supportedProgLang =>
          val future = checkedExercisePassed(exercise, supportedProgLang).map { passed =>
            exercisePassed = exercisePassed + (supportedProgLang.getLang -> passed)
          }
          Await.result(future, 5 seconds)
        }
      case None =>
        logger.info("Did not find following exercise: " + id)
    }
    exercisePassed.toMap
  }
}
