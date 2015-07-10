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
    var json = Json.obj(
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
    
    user.preferredLang.getOrElse(None) match {
      case lang: Lang =>
        json = json.+("preferredLang" -> Json.obj( "code" -> lang.code))
      case _ =>
        // Do nothing
    }
    Logger.debug("On envoie: "+json.toString)
    json
  }
  
  def userRead(json: JsValue): User = {
    Logger.debug("Dans userRead: " + json.toString)
    
    
    var preferredLang: Option[Lang] = None
    if(json.as[JsObject].keys.contains("preferredLang")) {
       var optCode = (json \ "preferredLang" \ "code").asOpt[String]
        optCode.getOrElse(None) match {
          case code: String =>
            preferredLang = Some(Lang(code))
        }
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
      lastProgLang = None,
      trackUser = None
    )
  }
}