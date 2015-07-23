package models

import java.util.UUID
import com.mohiva.play.silhouette.api.{ Identity, LoginInfo }
import play.api.libs.json.Json
import play.api.i18n.Lang
import play.api.libs.json.Writes
import play.api.libs.json.JsPath
import play.api.libs.json.Reads
import play.api.libs.json.Format
import play.api.libs.json.JsValue
import play.api.libs.json.JsSuccess
import plm.core.lang.ProgrammingLanguage

/**
 * The user object.
 *
 * @param userID The unique ID of the user.
 * @param loginInfo The linked login info.
 * @param firstName Maybe the first name of the authenticated user.
 * @param lastName Maybe the last name of the authenticated user.
 * @param fullName Maybe the full name of the authenticated user.
 * @param email Maybe the email of the authenticated provider.
 * @param avatarURL Maybe the avatar URL of the authenticated provider.
 */
case class User(
  gitID: String,
  loginInfo: LoginInfo,
  firstName: Option[String],
  lastName: Option[String],
  fullName: Option[String],
  email: Option[String],
  trackUser: Option[Boolean],
  preferredLang: Option[Lang],
  lastProgLang: Option[String],
  avatarURL: Option[String]) extends Identity

/**
 * The companion object.
 */
object User {
  
  implicit val langWrites = new Writes[Lang] {
    def writes(lang: Lang) = Json.obj(
      "code" -> lang.code
    )
  }
  
  implicit val langRead = new Reads[Lang] {
    def reads(json: JsValue) = {
      JsSuccess(Lang((json \ "code").as[String]))
    }
  }

  /**
   * Converts the [User] object to Json and vice versa.
   */
    
  implicit val jsonFormat = Json.format[User]
}
