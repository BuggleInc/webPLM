package models.action

import actors.PLMActor
import play.api.libs.json._
import play.api.Logger
import models.User
import play.api.i18n.Lang

private[action] abstract class LoginAction(actor : PLMActor, msg : JsValue) extends Action(actor, msg) {
}

private[action] class SignInAction(actor : PLMActor, msg : JsValue) extends LoginAction(actor, msg) {
	override def run() {
		actor.setCurrentUser((msg \ "user").asOpt[User].get)
		actor.registeredSpies.foreach { spy => spy.unregister }
		actor.plm.setUserUUID(actor.currentGitID)
		actor.currentTrackUser = actor.currentUser.trackUser.getOrElse(false)
		actor.plm.setTrackUser(actor.currentTrackUser)
		actor.currentUser.preferredLang.getOrElse(None) match {
			case newLang: Lang =>
				actor.currentPreferredLang = newLang
				actor.plm.setLang(actor.currentPreferredLang)
			case _ =>
				actor.savePreferredLang()
		}
		actor.plm.setProgrammingLanguage(actor.currentUser.lastProgLang.getOrElse("Java"))
	}
}

private[action] class SignOutAction(actor : PLMActor, msg : JsValue) extends LoginAction(actor, msg) {
	override def run() {
		actor.clearCurrentUser()
		actor.registeredSpies.foreach { spy => spy.unregister }
		actor.plm.setUserUUID(actor.currentGitID)
		actor.currentTrackUser = false
		actor.plm.setTrackUser(actor.currentTrackUser)
	}
}
