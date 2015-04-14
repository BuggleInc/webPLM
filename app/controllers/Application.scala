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

import play.api.i18n.Lang

import play.api.Play.current

object Application extends Controller {
  val system = ActorSystem("application")

  def langIsAvailable(code: String): Boolean = {
    Lang.availables.exists { lang => lang.code == code }
  }

  def getCookie(request: RequestHeader, cookieName: String): Cookie = {
     request.cookies.get(cookieName).getOrElse(None) match {
      case cookie: Cookie =>
        return cookie
      case _ =>
        return null
     }
  }
  
  def getCookieLangCode(request: RequestHeader): String = {
    var cookieLang: Cookie = getCookie(request, "lang")
    var cookieLangCode: String = ""
    if(cookieLang != null) {
      cookieLangCode = cookieLang.value
    }
    return cookieLangCode
  }

  def socket = WebSocket.acceptWithActor[JsValue, JsValue] { request => out =>
    var preferredLang: Lang = Lang.preferred(request.acceptLanguages)
    var cookieLangCode: String = getCookieLangCode(request)    
    if(langIsAvailable(cookieLangCode)) {
      preferredLang = Lang(cookieLangCode)
    }
    PLMActor.props(out, preferredLang)
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

  def specRunner() = Action { implicit request =>
    Ok(views.html.specRunner())
  }
}