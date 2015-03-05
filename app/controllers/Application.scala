package controllers

import play.api._
import play.api.libs.json.JsValue
import play.api.mvc._
import actors._
import log.LoggerUtils
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

import play.api.i18n.Lang

import play.api.Play.current

object Application extends Controller {
  val system = ActorSystem("application")
  
  var preferredLang: Lang = null

  def pathToTranslatedAsset(file: String) = Action { implicit request =>
    preferredLang = Lang.preferred(request.acceptLanguages)
    var actualPath = "/assets/"+preferredLang.code+"/"+file+".html"
    Redirect(actualPath);
  }

  def socket = WebSocket.acceptWithActor[JsValue, JsValue] { request => out =>
    LoggerUtils.debug("New websocket opened")
    PLMActor.props(out)
  }
 
  def index = Action { implicit request =>
    Ok(views.html.index("Accueil"))
  }

  def indexLessons = Action { implicit request =>
    Ok(views.html.index("Accueil"))
  }
  
  def lesson(lessonID: String) = Action { implicit request =>
    Ok(views.html.index("Accueil"))
  }
  
  def exercise(lessonID: String, exerciseID: String) = Action { implicit request =>
    Ok(views.html.index("Accueil"))
  }

  def specRunner() = Action {
    Ok(views.html.specRunner())
  }
}