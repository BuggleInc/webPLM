package utils.di

import com.mohiva.play.silhouette.api.LoginInfo
import com.mohiva.play.silhouette.api.util.HTTPLayer
import com.mohiva.play.silhouette.impl.exceptions.ProfileRetrievalException
import com.mohiva.play.silhouette.impl.providers._
import PLMAccountsProvider._
import play.api.http.HeaderNames
import play.api.libs.json.{ JsObject, JsValue }
import play.api.Logger

import scala.concurrent.Future

trait BasePLMAccountsProvider extends OAuth2Provider {

  /**
   * The content type to parse a profile from.
   */
  type Content = JsValue

  /**
   * Gets the provider ID.
   *
   * @return The provider ID.
   */
  val id = ID

  /**
   * Defines the URLs that are needed to retrieve the profile data.
   */
  protected val urls = Map("api" -> API)

  /**
   * A list with headers to send to the API.
   *
   * Without defining the accept header, the response will take the following form:
   * access_token=e72e16c7e42f292c6912e7710c838347ae178b4a&scope=user%2Cgist&token_type=bearer
   *
   * @see https://developer.github.com/v3/oauth/#response
   */
  override protected val headers = Seq(HeaderNames.ACCEPT -> "application/json")

  /**
   * Builds the social profile.
   *
   * @param authInfo The auth info received from the provider.
   * @return On success the build social profile, otherwise a failure.
   */
  override protected def buildProfile(authInfo: OAuth2Info): Future[Profile] = {
    httpLayer.url(urls("api").format(authInfo.accessToken)).get().flatMap { response =>
      val json = response.json
      (json \ "error").asOpt[JsObject] match {
        case Some(error) =>
          val errorCode: Int = (error \ "code").as[Int]
          val errorMsg: String = (error \ "message").as[String]

          throw new ProfileRetrievalException(SpecifiedProfileError.format(id, errorCode, errorMsg))
        case _ => profileParser.parse(json)
      }
    }
  }
}

/**
 * The profile parser for the common social profile.
 */
class PLMAccountsParser extends SocialProfileParser[JsValue, CommonSocialProfile] {

  /**
   * Parses the social profile.
   *
   * @param json The content returned from the provider.
   * @return The social profile from given result.
   */
  def parse(json: JsValue) = Future.successful {
    val userID = (json \ "_id").as[String]
    val fullName = (json \ "displayName").asOpt[String]
    val firstName = (json \ "firstName").asOpt[String]
    val lastName = (json \ "lastName").asOpt[String]
    val avatarUrl = Some("")
    val email = (json \ "email").asOpt[String].filter(!_.isEmpty)
    
    CommonSocialProfile(
      loginInfo = LoginInfo(ID, userID),
      fullName = fullName,
      firstName = firstName,
      lastName = lastName,
      avatarURL = avatarUrl,
      email = email)
  }
}

/**
 * The PLMAccounts OAuth2 Provider.
 *
 * @param httpLayer The HTTP layer implementation.
 * @param stateProvider The state provider implementation.
 * @param settings The provider settings.
 */
class PLMAccountsProvider(
  protected val httpLayer: HTTPLayer,
  protected val stateProvider: OAuth2StateProvider,
  val settings: OAuth2Settings)
  extends BasePLMAccountsProvider with CommonSocialProfileBuilder {

  /**
   * The type of this class.
   */
  type Self = PLMAccountsProvider

  /**
   * The profile parser implementation.
   */
  val profileParser = new PLMAccountsParser

  /**
   * Gets a provider initialized with a new settings object.
   *
   * @param f A function which gets the settings passed and returns different settings.
   * @return An instance of the provider initialized with new settings.
   */
  def withSettings(f: (Settings) => Settings) = new PLMAccountsProvider(httpLayer, stateProvider, f(settings))
}

/**
 * The companion object.
 */
object PLMAccountsProvider {

  /**
   * The error messages.
   */
  val SpecifiedProfileError = "[Silhouette][%s] Error retrieving profile information. Error message: %s, doc URL: %s"

  /**
   * The Custom constants.
   */
  val ID = "plmAccounts"
  val API = "http://plm.telecomnancy.univ-lorraine.fr:9000/oauth/users/%s"
}
