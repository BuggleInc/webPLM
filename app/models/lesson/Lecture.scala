package models.lesson

import com.google.gson.{JsonArray, JsonElement, JsonObject, JsonPrimitive}
import json.GsonUtil.{getOptionalGsonMember, gsonObjectToMap, iterableToGsonArray, mapToGsonObject}
import models.lesson.Lecture.ExercisePassedChecker
import org.slf4j.Logger
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.Exercise
import plm.core.ui.PlmHtmlEditorKit

import scala.collection.JavaConverters._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.concurrent.{Await, Future}
import scala.language.postfixOps

/**
 * @author matthieu
 */
object Lecture {

  type ExercisePassedChecker = (Exercise, ProgrammingLanguage) => Future[Boolean]

  private def namesFromJson(json: JsonElement) =
    gsonObjectToMap(json.getAsJsonObject).mapValues(_.getAsString)

  def fromJson(json: JsonElement): Lecture = {
    val root = json.getAsJsonObject
    val names = root.get("names")
    new Lecture(
      root.get("id").getAsString,
      getOptionalGsonMember(root, "names").map(namesFromJson),
      root.get("dependingLectures").getAsJsonArray.asScala.map(fromJson).toSeq
    )
  }

  def arrayToJson(logger: Logger, checkExercisePassed: ExercisePassedChecker, lectures: Array[Lecture], languageCode: String, progLang: ProgrammingLanguage, exercises: Exercises): JsonArray = {
    iterableToGsonArray(lectures.map(_.toJson(logger, checkExercisePassed, languageCode, progLang, exercises)))
  }
}

case class Lecture(id: String, optNames: Option[Map[String, String]], dependingLectures: Seq[Lecture]) {
  val orderedIDs: Array[String] = (id +: dependingLectures.view.flatMap(_.orderedIDs)).toArray

  def toJson(logger: Logger, checkedExercisePassed: ExercisePassedChecker, languageCode: String, progLang: ProgrammingLanguage, exercises: Exercises): JsonObject = {
    val names: Map[String, String] = optNames.get
    val defaultName: String = names("en")
    val name: String = names.getOrElse(languageCode, defaultName)
    val exercisePassed: Map[String, Boolean] = generateExercisePassed(logger, checkedExercisePassed, exercises)

    val json = new JsonObject()
    json.addProperty("id", id)
    json.addProperty("name", PlmHtmlEditorKit.filterHTML(name, false, progLang))
    json.add("dependingLectures", Lecture.arrayToJson(logger, checkedExercisePassed, dependingLectures.toArray, languageCode, progLang, exercises))
    json.add("exercisePassed", mapToGsonObject(exercisePassed.mapValues(new JsonPrimitive(_))))
    json
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
    exercisePassed
  }
}
