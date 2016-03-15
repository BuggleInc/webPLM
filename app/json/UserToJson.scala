package json

import play.api.libs.json.JsValue
import play.api.libs.json.JsObject
import models.User
import play.api.libs.json.Json
import play.api.i18n.Lang
import com.mohiva.play.silhouette.api.LoginInfo
import play.api.Logger
import play.api.libs.json.JsObject


object UserToJson {
  def userWrite(user: User): JsValue = {
    var json: JsObject = Json.obj(
      "firstName" -> user.firstName,
      "lastName" -> user.lastName,
      "fullName" -> user.fullName,
      "avatarURL" -> user.avatarURL,
      "email" -> user.email,
      "loginInfo" -> Json.obj(
        "providerID" -> user.loginInfo.providerID,
        "providerKey" -> user.loginInfo.providerKey
      )
    )
    user.lastProgLang.getOrElse(None) match {
      case lastProgLang: String =>
        json = json.+("lastProgLang" -> Json.toJson(lastProgLang))
      case _ =>
        // Do nothing
    }
    user.preferredLang.getOrElse(None) match {
      case lang: Lang =>
        json = json.+("preferredLang" -> Json.obj( "code" -> lang.code))
      case _ =>
        // Do nothing
    }
	user.trackUser.getOrElse(None) match {
      case trackUser: Boolean =>
        json = json.+("trackUser" -> Json.toJson(trackUser))
      case _ =>
        // Do nothing
    }
    json
  }

  def userRead(json: JsValue): User = {
    var preferredLang: Option[Lang] = None
    if(json.as[JsObject].keys.contains("preferredLang")) {
       var optCode = (json \ "preferredLang" \ "code").asOpt[String]
        optCode.getOrElse(None) match {
          case code: String =>
            preferredLang = Some(Lang(code))
        }
    }

    new User(
      gitID = (json \ "gitID").as[String],
      email = (json \ "email").asOpt[String],
      firstName = (json \ "firstName").asOpt[String],
      lastName = (json \ "lastName").asOpt[String],
      fullName = (json \ "fullName").asOpt[String],
      loginInfo = new LoginInfo(
          providerID =   (json \ "loginInfo" \ "providerID").as[String],
          providerKey =   (json \ "loginInfo" \ "providerKey").as[String]
        ),
      preferredLang = preferredLang,
      avatarURL = (json \ "avatarURL").asOpt[String],
      lastProgLang = (json \ "lastProgLang").asOpt[String],
      trackUser = (json \ "trackUser").asOpt[Boolean]
    )
  }
}
