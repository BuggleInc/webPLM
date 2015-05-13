package models.daos

import play.api.mvc.Controller

import com.mohiva.play.silhouette.api.LoginInfo
import models.User

import scala.concurrent.Future

// Reactive Mongo imports
import reactivemongo.api._

// Reactive Mongo plugin, including the JSON-specialized collection
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import play.api.libs.json._

import scala.concurrent.ExecutionContext.Implicits.global

import java.util.UUID

class UserDAOMongoImpl extends UserDAO {
  def find(loginInfo: LoginInfo) = UserDAOMongoImpl.find(loginInfo)
  def find(userID: UUID) = UserDAOMongoImpl.find(userID)
  def save(user: User) = UserDAOMongoImpl.save(user)
}

/**
 * The companion object.
 */
object UserDAOMongoImpl extends Controller with MongoController {

  /**
   * The list of users.
   */
  def users: JSONCollection = db.collection[JSONCollection]("users")
  
  /**
   * Finds a user by its login info.
   *
   * @param loginInfo The login info of the user to find.
   * @return The found user or None if no user for the given login info could be found.
   */
  def find(loginInfo: LoginInfo) = {
    val cursor: Cursor[User] = users.
      // find all people with loginInfo `loginInfo`
      find(Json.obj(
            "loginInfo" -> loginInfo
          )).
      // perform the query and get a cursor of JsObject
      cursor[User]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[User]] = cursor.collect[List]()

    // everything's ok! Let's reply with the user
    
    futureUsersList.map { persons =>
      if(persons.size > 0)
        Some(persons(0))
      else
        None
    }
  }

  /**
   * Finds a user by its user ID.
   *
   * @param userID The ID of the user to find.
   * @return The found user or None if no user for the given ID could be found.
   */
  def find(userID: UUID) = {
    val cursor: Cursor[User] = users.
      find(Json.obj("userID" -> userID)).
      // sort them by creation date
      // perform the query and get a cursor of JsObject
      cursor[User]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[User]] = cursor.collect[List]()

    // everything's ok! Let's reply with the array
    futureUsersList.map { persons =>
     if(persons.size > 0)
        Some(persons(0))
      else
        None
    }
  }

  /**
   * Saves a user.
   *
   * @param user The user to save.
   * @return The saved user.
   */
  def save(user: User) = {
    find(user.userID).flatMap {
      case Some(userSaved) =>
        users.update(Json.obj("userID" -> user.userID), user)
      case None =>
        users.insert(user)
    }
    Future.successful(user)
  }
}