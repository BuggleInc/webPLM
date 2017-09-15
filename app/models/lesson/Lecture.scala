package models.lesson

import actors.SessionActor
import akka.actor._
import akka.pattern.ask
import akka.util.Timeout
import play.api.Logger
import play.api.i18n.Lang
import play.api.libs.functional.syntax._
import play.api.libs.json._
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.Exercise
import plm.core.ui.PlmHtmlEditorKit

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.language.postfixOps

/**
 * @author matthieu
 */
object Lecture {

  implicit lazy val lectureReads: Reads[Lecture] = (
    (JsPath \ "id").read[String] and
    (JsPath \ "names").readNullable[Map[String, String]] and
    (JsPath \ "dependingLectures").lazyRead(Reads.seq[Lecture](lectureReads))
  )(Lecture.apply _)

  def arrayToJson(sessionActor: ActorRef, lectures: Array[Lecture], lang: Lang, progLang: ProgrammingLanguage, exercises: Exercises): JsArray = {
    var jsonLectures: JsArray = Json.arr()
    lectures.foreach { lecture: Lecture =>
      jsonLectures = jsonLectures.append(lecture.toJson(sessionActor, lang, progLang, exercises))
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

  def toJson(sessionActor: ActorRef, lang: Lang, progLang: ProgrammingLanguage, exercises: Exercises): JsObject = {
    val names: Map[String, String] = optNames.get
    val defaultName: String = names.get("en").get
    val name: String = names.getOrElse(lang.code, defaultName)

    val exercisePassed: Map[String, Boolean] = generateExercisePassed(sessionActor, exercises)

    Json.obj(
      "id" -> id,
      "name" -> PlmHtmlEditorKit.filterHTML(name, false, progLang),
      "dependingLectures" -> Lecture.arrayToJson(sessionActor, dependingLectures.toArray, lang, progLang, exercises),
      "exercisePassed" -> exercisePassed
    )
  }

  def generateExercisePassed(sessionActor: ActorRef, exercises: Exercises): Map[String, Boolean] = {
    implicit val timeout = Timeout(5 seconds)

    var exercisePassed: Map[String, Boolean] = Map()

    exercises.getExercise(id) match {
      case Some(exercise: Exercise) =>
        exercise.getProgLanguages.toArray(Array[ProgrammingLanguage]()).foreach { supportedProgLang =>
          val future = (sessionActor ? SessionActor.IsExercisePassed(exercise, supportedProgLang)).mapTo[Boolean].map { passed =>
            exercisePassed = exercisePassed + (supportedProgLang.getLang -> passed)
          }
          Await.result(future, 5 seconds)
        }
      case None =>
        Logger.info("Did not find following exercise: " + id)
    }
    exercisePassed.toMap
  }
}
