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
    user.lastProgLang match {
    case Some(lastProgLang: String) =>
      json = json.+("lastProgLang" -> Json.toJson(lastProgLang))
    case _ =>
    }
    user.preferredLang match {
    case Some(lang: Lang) =>
      json = json.+("preferredLang" -> Json.obj( "code" -> lang.code))
    case _ =>
    }
    user.trackUser match {
    case Some(trackUser: Boolean) =>
      json = json.+("trackUser" -> Json.toJson(trackUser))
    case _ =>
    }
    json
  }

  def userRead(json: JsValue): User = {
    Logger.debug("Dans userRead: " + json.toString)
    var preferredLang: Option[Lang] = None
    val optCode = (json \ "preferredLang" \ "code").asOpt[String]
    optCode match {
    case Some(code: String) =>
      preferredLang = Some(Lang(code))
    case _ =>
    }

    Logger.debug("preferredLang: "+ preferredLang.toString)

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
