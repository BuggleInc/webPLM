package models.daos

import com.mohiva.play.silhouette.api.LoginInfo
import com.mohiva.play.silhouette.api.util.PasswordInfo
import com.mohiva.play.silhouette.impl.daos.DelegableAuthInfoDAO
import scala.collection.mutable
import scala.concurrent.Future
import play.api.mvc.Controller
import reactivemongo.api._
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import models.Password
import play.api.Logger
import scala.concurrent.ExecutionContext.Implicits.global
import com.mohiva.play.silhouette.api.util.PasswordInfo
import play.api.libs.json.Json

class PasswordInfoDAOMongo extends DelegableAuthInfoDAO[PasswordInfo] {
  def save(loginInfo: LoginInfo, authInfo: PasswordInfo): Future[PasswordInfo] = PasswordInfoDAOMongo.save(loginInfo, authInfo)
  def find(loginInfo: LoginInfo): Future[Option[PasswordInfo]] = PasswordInfoDAOMongo.find(loginInfo)
}

/**
 * The companion object.
 */
object PasswordInfoDAOMongo extends Controller with MongoController {
  
  /**
   * The data store for the password info.
   */
  def data: JSONCollection = db.collection[JSONCollection]("passwords")
  
  /**
   * Saves the password info.
   *
   * @param loginInfo The login info for which the auth info should be saved.
   * @param authInfo The password info to save.
   * @return The saved password info.
   */
  def save(loginInfo: LoginInfo, authInfo: PasswordInfo): Future[PasswordInfo] = {
    val password = new Password(loginInfo, authInfo)
    find(loginInfo).flatMap {
      case Some(passwordSaved) =>
        data.update(Json.obj("loginInfo" -> loginInfo), password)
      case None =>
        data.insert(password)
    }
    Future.successful(authInfo)
  }

  /**
   * Finds the password info which is linked with the specified login info.
   *
   * @param loginInfo The linked login info.
   * @return The retrieved password info or None if no password info could be retrieved for the given login info.
   */
  def find(loginInfo: LoginInfo): Future[Option[PasswordInfo]] = {
    val cursor: Cursor[Password] = data.find(Json.obj("loginInfo" -> loginInfo)).cursor[Password]
    val futurePasswordsList: Future[List[Password]] = cursor.collect[List]()

    // everything's ok! Let's reply with the user
    
    futurePasswordsList.map { passwords =>
      if(passwords.size > 0)
        Some(passwords(0).passwordInfo)
      else
        None
    }
  }
}