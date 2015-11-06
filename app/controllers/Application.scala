package controllers

import com.google.inject.Inject

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

class Application @Inject() (configuration: Configuration) extends Controller {
  val system = ActorSystem("application")
  val githubClientID: String = configuration.getString("silhouette.github.clientID").get
  val plmAccountsClientID: String = configuration.getString("silhouette.plmaccounts.clientID").get
  def index = Action { implicit request =>
    Ok(views.html.index(githubClientID, plmAccountsClientID))
  }

  def indexLessons = Action { implicit request =>
    Ok(views.html.index(githubClientID, plmAccountsClientID))
  }
  
  def lesson(lessonID: String) = Action { implicit request =>
    Ok(views.html.index(githubClientID, plmAccountsClientID))
  }
  
  def exercise(lessonID: String, exerciseID: String) = Action { implicit request =>
    Ok(views.html.index(githubClientID, plmAccountsClientID))
  }

  def specRunner() = Action { implicit request =>
    Ok(views.html.specRunner())
  }
}