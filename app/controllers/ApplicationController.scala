package controllers

import java.util.UUID

import scala.concurrent.Future

import actors.ActorsMap
import actors.PLMActor
import javax.inject.Inject
import models.User
import play.api.Logger
import play.api.Play.current
import play.api.i18n.Lang
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json.JsValue
import play.api.libs.json.Json
import play.api.mvc.AnyContentAsEmpty
import play.api.mvc.Request
import play.api.mvc.RequestHeader
import play.api.mvc.WebSocket
import utils.LangUtils
import utils.CookieUtils

import com.mohiva.play.silhouette.api.Environment
import com.mohiva.play.silhouette.api.LogoutEvent
import com.mohiva.play.silhouette.api.Silhouette
import com.mohiva.play.silhouette.impl.authenticators.JWTAuthenticator

/**
 * The basic application controller.
 *
 * @param env The Silhouette environment.
 */
class ApplicationController @Inject() (implicit val env: Environment[User, JWTAuthenticator])
  extends Silhouette[User, JWTAuthenticator] {

  def socket(optToken: Option[String]) = WebSocket.tryAcceptWithActor[JsValue, JsValue] { request =>
    var token = optToken.getOrElse("")
    var requestWithToken: RequestHeader = env.authenticatorService.embed(token, request)
    var actorUUID: String = UUID.randomUUID.toString
    implicit val req = Request(requestWithToken, AnyContentAsEmpty)
    SecuredRequestHandler { securedRequest =>
      Future.successful(HandlerResult(Ok, Some(securedRequest.identity)))
    }.map {
      case HandlerResult(r, Some(user)) => 
        Right(PLMActor.propsWithUser(actorUUID,  user) _)
      case HandlerResult(r, None) =>
        var preferredLang: Lang = LangUtils.getPreferredLang(request)
        var newUser: Boolean = false;
        var gitID: String = CookieUtils.getCookieValue(request, "gitID")
        if(gitID.isEmpty) {
          newUser = true;
          gitID = UUID.randomUUID.toString
        }
        Right(PLMActor.props(actorUUID,  gitID, newUser, Some(preferredLang), None) _)
    }
  }
  
  /**
   * Returns the user.
   *
   * @return The result to display.
   */
  def user(actorUUID: String) = SecuredAction.async { implicit request =>
    ActorsMap.get(actorUUID) match {
        case Some(actor) =>
          actor ! Json.obj(
            "cmd" -> "signIn",
            "user" -> request.identity
          )
          Future.successful(Ok)
        case _ =>
          Logger.debug("Actor not found... Weird isn't it?")
          Future.successful(Unauthorized)  
    }
  }

  /**
   * Manages the sign out action.
   */
  def signOut = SecuredAction.async { implicit request =>
    env.eventBus.publish(LogoutEvent(request.identity, request, request2lang))
    request.authenticator.discard(Future.successful(Ok))
  }
}
