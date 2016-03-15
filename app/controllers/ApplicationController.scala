package controllers

import com.google.inject.Inject
import java.util.UUID
import actors.ActorsMap
import actors.PLMActor
import models.User
import play.api.Logger
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json.{Json, JsValue}
import utils._
import com.mohiva.play.silhouette.api.{ Environment, LogoutEvent, Silhouette }
import com.mohiva.play.silhouette.impl.authenticators.JWTAuthenticator
import com.mohiva.play.silhouette.impl.providers.SocialProviderRegistry
import play.api.i18n.{ Lang, MessagesApi, Messages }
import play.api.mvc._
import play.api.Play.current
import scala.concurrent.Future
import models.execution.{ LocalExecution, ExecutionManager }

/**
 * The basic application controller.
 *
 * @param env The Silhouette environment.
 */
class ApplicationController @Inject() (
    val messagesApi: MessagesApi,
    implicit val env: Environment[User, JWTAuthenticator],
    socialProviderRegistry: SocialProviderRegistry,
    executionManager: ExecutionManager)
  extends Silhouette[User, JWTAuthenticator] {

  def socket(optToken: Option[String]) = WebSocket.tryAcceptWithActor[JsValue, JsValue] { request =>
    var token = optToken.getOrElse("")
    var userAgent: String = request.headers.get("User-Agent").getOrElse("")
    var requestWithToken: RequestHeader = env.authenticatorService.embed(token, request)
    var actorUUID: String = UUID.randomUUID.toString
    implicit val req = Request(requestWithToken, AnyContentAsEmpty)
    SecuredRequestHandler { securedRequest =>
      Future.successful(HandlerResult(Ok, Some(securedRequest.identity)))
    }.map {
      case HandlerResult(r, Some(user)) =>
        Right(PLMActor.propsWithUser(executionManager, userAgent, actorUUID, user) _)
      case HandlerResult(r, None) =>
        var preferredLang: Lang = LangUtils.getPreferredLang(request)
        var newUser: Boolean = false;
        var gitID: String = CookieUtils.getCookieValue(request, "gitID")
        if(gitID.isEmpty) {
          newUser = true;
          gitID = UUID.randomUUID.toString
        }
        Right(PLMActor.props(executionManager, userAgent, actorUUID,  gitID, newUser, Some(preferredLang), None, Some(false)) _)
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
          Logger.error("Actor not found... Weird isn't it?")
          Future.successful(Unauthorized)
    }
  }

  /**
   * Manages the sign out action.
   */
  def signOut = SecuredAction.async { implicit request =>
    env.eventBus.publish(LogoutEvent(request.identity, request, request2Messages))
    env.authenticatorService.discard(request.authenticator, Ok)
  }
}
