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
  def index = Action { implicit request =>
    Ok(views.html.index())
  }

  def indexLessons = Action { implicit request =>
    Ok(views.html.index())
  }
  
  def lesson(lessonID: String) = Action { implicit request =>
    Ok(views.html.index())
  }
  
  def exercise(lessonID: String, exerciseID: String) = Action { implicit request =>
    Ok(views.html.index())
  }

  def specRunner() = Action { implicit request =>
    Ok(views.html.specRunner())
  }

  def oauthSettings() = Action { implicit request =>
    Ok(Json.obj(
      "facebook" -> Json.obj(
        "clientId" -> configuration.getString("silhouette.facebook.clientID").get
      ),
      "github" -> Json.obj(
        "clientId" -> configuration.getString("silhouette.github.clientID").get
      ),
      "google" -> Json.obj(
        "clientId" -> configuration.getString("silhouette.google.clientID").get
      ),
      "plmAccounts" -> Json.obj(
        "clientId" -> configuration.getString("silhouette.plmaccounts.clientID").get,
        "authorizationEndpoint" -> configuration.getString("silhouette.plmaccounts.authorizationEndpoint").get
      )
    ))
  }
}