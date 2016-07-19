package models.lesson

import actors.{ExercisesActor, SessionActor}
import akka.actor._
import akka.pattern.ask
import akka.util.Timeout

import scala.concurrent.duration._
import scala.language.postfixOps
import play.api.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.i18n.Lang
import plm.core.ui.PlmHtmlEditorKit
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.Exercise

import scala.collection.concurrent.TrieMap
import scala.concurrent.{Await, Future}

/**
 * @author matthieu
 */
object Lecture {

  implicit lazy val lectureReads: Reads[Lecture] = (
    (JsPath \ "id").read[String] and
    (JsPath \ "names").readNullable[Map[String, String]] and
    (JsPath \ "dependingLectures").lazyRead(Reads.seq[Lecture](lectureReads))
  )(Lecture.apply _)

  def arrayToJson(sessionActor: ActorRef, lectures: Array[Lecture], lang: Lang, progLang: ProgrammingLanguage): JsArray = {
    var jsonLectures: JsArray = Json.arr()
    lectures.foreach { lecture: Lecture =>
      jsonLectures = jsonLectures.append(lecture.toJson(sessionActor, lang, progLang))
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

  def toJson(sessionActor: ActorRef, lang: Lang, progLang: ProgrammingLanguage): JsObject = {
    val names: Map[String, String] = optNames.get
    val defaultName: String = names.get("en").get
    val name: String = names.getOrElse(lang.code, defaultName)

    val exercisePassed: Map[String, Boolean] = generateExercisePassed(sessionActor)

    Json.obj(
      "id" -> id,
      "name" -> PlmHtmlEditorKit.filterHTML(name, false, progLang),
      "dependingLectures" -> Lecture.arrayToJson(sessionActor, dependingLectures.toArray, lang, progLang),
      "exercisePassed" -> exercisePassed
    )
  }

  def generateExercisePassed(sessionActor: ActorRef): Map[String, Boolean] = {
    implicit val timeout = Timeout(5 seconds)

    var exercisePassed: Map[String, Boolean] = Map()

    ExercisesActor.getExercise(id) match {
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
