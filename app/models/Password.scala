package models

import com.mohiva.play.silhouette.api.LoginInfo
import play.api.libs.json.Json
import com.mohiva.play.silhouette.api.util.PasswordInfo
import play.api.libs.json.Writes
import play.api.libs.json.JsPath
import play.api.libs.json.Reads
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._

case class Password (
  loginInfo: LoginInfo,
  passwordInfo: PasswordInfo
)

/**
 * The companion object.
 */
object Password {

  implicit val passwordInfoWrite: Writes[PasswordInfo] = Writes {
    (passwordInfo: PasswordInfo) => 
      Json.obj(
        "hasher" -> passwordInfo.hasher,
        "password" -> passwordInfo.password,
        "salt" -> passwordInfo.salt
      )
  }

  implicit val passwordInfoReads: Reads[PasswordInfo] = (
    (JsPath \ "hasher").read[String] and
    (JsPath \ "password").read[String] and
    (JsPath \ "salt").read[Option[String]]
  )(PasswordInfo.apply _)
  
  /**
   * Converts the [User] object to Json and vice versa.
   */
  implicit val jsonFormat = Json.format[Password]
}
