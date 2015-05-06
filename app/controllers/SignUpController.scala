package controllers

import java.util.UUID
import javax.inject.Inject
import com.mohiva.play.silhouette.api._
import com.mohiva.play.silhouette.api.services.AuthInfoService
import com.mohiva.play.silhouette.api.util.PasswordHasher
import com.mohiva.play.silhouette.impl.authenticators.JWTAuthenticator
import com.mohiva.play.silhouette.impl.providers.CredentialsProvider
import forms.SignUpForm
import models.User
import models.services.UserService
import play.api.i18n.Messages
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json.Json
import play.api.mvc.Action
import utils.CookieUtils
import scala.concurrent.Future
import actors.ActorsMap
import play.api.Logger
import utils.LangUtils
import play.api.i18n.Lang

/**
 * The sign up controller.
 *
 * @param env The Silhouette environment.
 * @param userService The user service implementation.
 * @param authInfoService The auth info service implementation.
 * @param passwordHasher The password hasher implementation.
 */
class SignUpController @Inject() (
  implicit val env: Environment[User, JWTAuthenticator],
  val userService: UserService,
  val authInfoService: AuthInfoService,
  val passwordHasher: PasswordHasher)
  extends Silhouette[User, JWTAuthenticator] {

  /**
   * Registers a new user.
   *
   * @return The result to display.
   */
  def signUp = Action.async(parse.json) { implicit request =>
    var actorUUID: String = CookieUtils.getCookieValue(request, "actorUUID")
    var gitID: String = CookieUtils.getCookieValue(request, "gitID")
    if(actorUUID.isEmpty) {
      Unauthorized(Json.obj("message" -> Messages("could.not.authenticate")))
    }
    var preferredLang: Lang = LangUtils.getPreferredLang(request)
    if(gitID.isEmpty) {
      gitID = UUID.randomUUID.toString
    }
    request.body.validate[SignUpForm.Data].map { data =>
      val loginInfo = LoginInfo(CredentialsProvider.ID, data.email)
      userService.retrieve(loginInfo).flatMap {
        case Some(user) =>
          Future.successful(BadRequest(Json.obj("message" -> Messages("user.exists"))))
        case None =>
          val authInfo = passwordHasher.hash(data.password)
          val user = User(
            userID = UUID.randomUUID(),
            gitID = UUID.fromString(gitID),
            loginInfo = loginInfo,
            firstName = Some(data.firstName),
            lastName = Some(data.lastName),
            fullName = Some(data.firstName + " " + data.lastName),
            email = Some(data.email),
            preferredLang = Some(preferredLang),
            avatarURL = None
          )
          for {
            user <- userService.save(user)
            authInfo <- authInfoService.save(loginInfo, authInfo)
            authenticator <- env.authenticatorService.create(loginInfo)
            token <- env.authenticatorService.init(authenticator)
          } yield {
            ActorsMap.get(actorUUID) match {
              case Some(actor) =>
                actor ! Json.obj(
                  "cmd" -> "signUp",
                  "user" -> user
                )
              case _ =>
                Logger.debug("Actor not found... Weird isn't it?")
            }
            env.eventBus.publish(SignUpEvent(user, request, request2lang))
            env.eventBus.publish(LoginEvent(user, request, request2lang))
            Ok(Json.obj("token" -> token))
          }
      }
    }.recoverTotal {
      case error =>
        Future.successful(Unauthorized(Json.obj("message" -> Messages("invalid.data"))))
    }
  }
}
