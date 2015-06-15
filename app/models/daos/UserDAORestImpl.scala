package models.daos

import com.mohiva.play.silhouette.api.LoginInfo
import models.User
import scala.concurrent.Future
import play.api.libs.json._
import play.api.i18n.Lang
import play.api.Play.current
import play.api.libs.ws._
import play.api.libs.ws.ning.NingAsyncHttpClientConfigBuilder
import scala.concurrent.Future
import java.util.UUID
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.Logger
import json.UserToJson

/**
 * @author matthieu
 */

class UserDAORestImpl extends UserDAO {
  def find(loginInfo: LoginInfo) = UserDAORestImpl.find(loginInfo)
  def save(user: User) = UserDAORestImpl.save(user)
  def update(user: User) = UserDAORestImpl.update(user)
}

object UserDAORestImpl {

  /**
   * Finds a user by its login info.
   *
   * @param loginInfo The login info of the user to find.
   * @return The found user or None if no user for the given login info could be found.
   */
  def find(loginInfo: LoginInfo) = {
    var resourceURI = "http://localhost:3001/profiles/"+loginInfo.providerID+"/"+loginInfo.providerKey
    WS.url(resourceURI).get().map {
      response =>
        Logger.debug("On a eu une réponse!")
        Logger.debug("Response status: " + response.status)
        Logger.debug("Response: "+response.json.toString)
        if(response.status == 200) {
          Logger.debug("On passe pas ici")
          Some(UserToJson.userRead(response.json \ "profile"))
        }
        else {
          None
        }
    }
  }

  /**
   * Saves a user.
   *
   * @param user The user to save.
   * @return The saved user.
   */
  def save(user: User) = {
    val data: JsValue = UserToJson.userWrite(user)
    Logger.debug("Dans save: " + data.toString)
    WS.url("http://localhost:3001/profiles").post(data).map {
      response =>
        if(response.status == 200) {
          Logger.debug("On a bien reçu une rep: "+ response.json.toString)
          Some(UserToJson.userRead(response.json \ "profile"))
        }
        else {
          None
        }
        
    }
  }
  
  /**
   * Updates a user.
   *
   * @param user The user to update.
   * @return The updated user.
   */
  def update(user: User) = {
    val data = UserToJson.userWrite(user)
    var resourceURI = "http://localhost:3001/profiles/"+user.loginInfo.providerID+"/"+user.loginInfo.providerKey
    WS.url(resourceURI).put(data).map {
      response => 
        if(response.status == 200) {
          true
        }
        else {
          false
        }
        //(response.json \ "profile")).asOpt[User]
    }
  }
  
}