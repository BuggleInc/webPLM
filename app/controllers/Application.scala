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

import play.api.data._
import play.api.data.Forms._
import play.api.data.format.Formats._

import play.api.Play.current

object Application extends Controller {
  val logger: Logger = Logger(this.getClass)
  val system = ActorSystem("application")
  
  def socket = WebSocket.acceptWithActor[JsValue, JsValue] { request => out =>
    logger.debug("New websocket opened")
    PLMActor.props(out)
  }
  
  def index = Action {
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
  /*
  
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
  
  def runExercise(lessonID: String, exerciseID: String) = Action.async { implicit request => 
    val code = exerciseForm.bindFromRequest.get
    implicit val timeout = Timeout(3 seconds)
    (plmActor ? RunExercise(lessonID, exerciseID, code) ).mapTo[JsValue].map {
      message => Ok(message)
    }
  }
  
  def listExercises(id: String) = Action.async {
    implicit val timeout = Timeout(3 seconds)
    (plmActor ? ListExercises(id) ).mapTo[JsValue].map {
      message => Ok(message)
    }
  }
  * 
  */
}