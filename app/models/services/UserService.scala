package models.services

import com.mohiva.play.silhouette.api.services.{ AuthInfo, IdentityService }
import com.mohiva.play.silhouette.impl.providers.CommonSocialProfile
import models.User
import scala.concurrent.Future
import java.util.UUID
import play.api.i18n.Lang

/**
 * Handles actions to users.
 */
trait UserService extends IdentityService[User] {

  /**
   * Saves a user.
   *
   * @param user The user to save.
   * @return The saved user.
   */
  def save(user: User): Future[User]

  /**
   * Saves the social profile for a user.
   *
   * If a user exists for this profile then update the user, otherwise create a new user with the given profile.
   *
   * @param profile The social profile to save.
   * @return The user for whom the profile was saved.
   */
  def save[A <: AuthInfo](profile: CommonSocialProfile, gitID: UUID, trackUser: Option[Boolean], preferredLang: Option[Lang]): Future[User]
}
