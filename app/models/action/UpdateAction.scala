package models.action

import actors.PLMActor
import play.api.libs.json._
import play.api.Logger
import models.daos.UserDAORestImpl
import codes.reactive.scalatime.Instant
import codes.reactive.scalatime.Duration

private[action] abstract class UpdateAction(actor : PLMActor, msg : JsValue) extends Action(actor, msg) {
}

private[action] class UpdateUserAction(actor : PLMActor, msg : JsValue) extends UpdateAction(actor, msg) {
	override def run() {
          var optFirstName: Option[String] = (msg \ "args" \ "firstName").asOpt[String]
          var optLastName: Option[String] = (msg \ "args" \ "lastName").asOpt[String]
          var optTrackUser: Option[Boolean] = (msg \ "args" \ "trackUser").asOpt[Boolean]
          (optFirstName.getOrElse(None), optLastName.getOrElse(None)) match {
            case (firstName:String, lastName: String) =>
              actor.currentUser = actor.currentUser.copy(
                  firstName = optFirstName,
                  lastName = optLastName,
                  trackUser = optTrackUser
              )
              UserDAORestImpl.update(actor.currentUser)
              actor.sendMessage("userUpdated", Json.obj())
             (optTrackUser.getOrElse(None)) match {
                case trackUser: Boolean =>
                  actor.plm.setTrackUser(actor.currentTrackUser)
                case _ =>
                  Logger.debug("setTrackUser: non-correct JSON")
              }
            case _ =>
              Logger.debug("updateUser: non-correct JSON")
          }
	}
}

private[action] class UserIdleAction(actor : PLMActor, msg : JsValue) extends UpdateAction(actor, msg) {
	override def run() {
		actor.userIdle = true
		actor.idleStart = Instant.apply
		Logger.debug("start idling at: "+ actor.idleStart)
	}
}

private[action] class UserBackAction(actor : PLMActor, msg : JsValue) extends UpdateAction(actor, msg) {
	override def run() {
		actor.userIdle = false
		actor.idleEnd = Instant.apply
		if(actor.idleStart != null) {
			var duration = Duration.between(actor.idleStart, actor.idleEnd)
			Logger.debug("end idling at: "+ actor.idleEnd)
			Logger.debug("duration: " + duration)
			// FIXME : next line sometimes disconnects the user.
			actor.plm.signalIdle(actor.idleStart.toString, actor.idleEnd.toString, duration.toString)
		}
		else
			Logger.error("receive 'userBack' but not previous 'userIdle'")
		actor.idleStart = null
		actor.idleEnd = null
	}
}
