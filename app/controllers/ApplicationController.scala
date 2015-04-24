package controllers

import javax.inject.Inject
import com.mohiva.play.silhouette.api.{ Environment, LogoutEvent, Silhouette }
import com.mohiva.play.silhouette.impl.authenticators.JWTAuthenticator
import models.User
import play.api.libs.json.Json
import scala.concurrent.Future
import actors.ActorsMap
import play.api.Logger

/**
 * The basic application controller.
 *
 * @param env The Silhouette environment.
 */
class ApplicationController @Inject() (implicit val env: Environment[User, JWTAuthenticator])
  extends Silhouette[User, JWTAuthenticator] {

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
