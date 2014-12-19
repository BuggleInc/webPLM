package controllers

import play.api._
import play.api.libs.json.JsValue
import play.api.mvc._

import actors._
import plm.core.model.Game

import akka.actor.ActorRef
import akka.actor.ActorSystem
import akka.actor.Props
import akka.pattern.ask

import play.api.libs.concurrent.Execution.Implicits.defaultContext
import scala.concurrent.duration._
import play.api.libs.json._
import akka.util.Timeout

object Application extends Controller {
  
  val system = ActorSystem("application")
  val plmActor: ActorRef = system.actorOf(Props[PLMActor])

  
  def index = Action {
    Logger.info("Yo");
    Ok(views.html.index("Accueil"))
  }

  def indexLessons = Action {
    Ok(views.html.index("Accueil"))
  }
  
  def lesson(lessonID: String) = Action {
    Ok(views.html.index("Accueil"))
  }
  
  def exercise(lessonID: String, exerciseID: String) = Action {
    Ok(views.html.index("Accueil"))
  }
  
  
  def listProgrammingLanguages = Action.async {
    implicit val timeout = Timeout(3 seconds)
    (plmActor ? ListProgrammingLanguages() ).mapTo[JsValue].map {
      message => Ok(message)
    }
  }

  def listLessons = Action.async {
    implicit val timeout = Timeout(3 seconds)
    (plmActor ? ListLessons() ).mapTo[JsValue].map {
      message => Ok(message)
    }
  }
  
  def switchLesson(lessonID: String) = Action.async {
    implicit val timeout = Timeout(3 seconds)
    (plmActor ? SwitchLesson(lessonID) ).mapTo[JsValue].map {
      message => Ok(message)
    }
  }
  
  def switchExercise(lessonID: String, exerciseID: String) = Action.async {
    implicit val timeout = Timeout(3 seconds)
    Logger.info("LessonID: "+lessonID);
    Logger.info("ExerciseID: "+exerciseID);
    (plmActor ? SwitchExercise(lessonID, exerciseID) ).mapTo[JsValue].map {
      message => Ok(message)
    }
  }
  
  /*
  def listExercises(id: String) = Action.async {
    implicit val timeout = Timeout(3 seconds)
    (plmActor ? ListExercises(id) ).mapTo[JsValue].map {
      message => Ok(message)
    }
  }
  * 
  */
}