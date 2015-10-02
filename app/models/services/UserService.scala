package models.services

import com.mohiva.play.silhouette.api.services.IdentityService
import com.mohiva.play.silhouette.impl.providers.CommonSocialProfile
import models.User
import scala.concurrent.Future
import java.util.UUID
import play.api.i18n.Lang

/**
 * Handles actions to users.
 */
trait UserService extends IdentityService[User] {

  var error: Boolean = false
  
  def setError(bool: Boolean) {
    error = bool
  }
  
  /**
   * Updates a user.
   *
   * @param user The user to save.
   * @return True if the user was successfully updated, false otherwise.
   */
  def update(user: User): Future[Boolean]

  /**
   * Saves the social profile for a user.
   *
   * Create a new user with the given profile.
   *
   * @param profile The social profile to save.
   * @return The user for whom the profile was saved.
   */
  def save(profile: CommonSocialProfile, trackUser: Option[Boolean], preferredLang: Option[Lang]): Future[User]
}
