package controllers

import actors._
import akka.actor.ActorRef
import akka.actor.ActorSystem
import akka.actor.Props
import akka.pattern.ask
import play.api._
import play.api.Play.current
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.i18n.Lang
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.libs.json.JsValue
import play.api.mvc._
import java.util.UUID
import utils.CookieUtils

object Application extends Controller {
  val system = ActorSystem("application")

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

  def specRunner() = Action { implicit request =>
    Ok(views.html.specRunner())
  }
  
  def getGitHubAccessToken() = Action {
    Ok(Json.obj("accessToken" -> Play.configuration.getString("plm.github.oauth").get))
  }
}