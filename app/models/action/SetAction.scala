package models.action

import actors.PLMActor
import play.api.libs.json._
import play.api.Logger
import play.api.i18n.Lang
import models.daos.UserDAORestImpl

private[action] abstract class SetAction(actor : PLMActor, msg : JsValue) extends Action(actor, msg) {
}

private[action] class SetProgrammingLanguageAction(actor : PLMActor, msg : JsValue) extends SetAction(actor, msg) {
	override def run() {
		var optProgrammingLanguage: Option[String] = (msg \ "args" \ "programmingLanguage").asOpt[String]
		(optProgrammingLanguage.getOrElse(None)) match {
			case programmingLanguage: String =>
				actor.plm.setProgrammingLanguage(programmingLanguage)
				if(actor.currentUser != null) {
					actor.currentUser = actor.currentUser.copy(
							lastProgLang = Some(programmingLanguage)
						)
					UserDAORestImpl.update(actor.currentUser)
				}
            case _ =>
              Logger.debug("setProgrammingLanguage: non-correct JSON")
          }
	}
}

private[action] class SetLangAction(actor : PLMActor, msg : JsValue) extends SetAction(actor, msg) {
	override def run() {
          var optLang: Option[String] =  (msg \ "args" \ "lang").asOpt[String]
          (optLang.getOrElse(None)) match {
            case lang: String =>
				actor.currentPreferredLang = Lang(lang)
				actor.plm.setLang(actor.currentPreferredLang)
				if(actor.currentUser != null) {
					actor.currentUser = actor.currentUser.copy(
							preferredLang = Some(actor.currentPreferredLang)
						)
					UserDAORestImpl.update(actor.currentUser)
				}
            case _ =>
              Logger.debug("setLang: non-correct JSON")
          }
	}
}

private[action] class SetTrackUserAction(actor : PLMActor, msg : JsValue) extends SetAction(actor, msg) {
	override def run() {
		var optTrackUser: Option[Boolean] = (msg \ "args" \ "trackUser").asOpt[Boolean]
		(optTrackUser.getOrElse(None)) match {
			case trackUser: Boolean =>
				actor.currentTrackUser = trackUser
				if(actor.currentUser != null) {
					actor.currentUser = actor.currentUser.copy(
							trackUser = Some(trackUser)
						)
					UserDAORestImpl.update(actor.currentUser)
				}
				actor.plm.setTrackUser(actor.currentTrackUser)
			case _ =>
				Logger.debug("setTrackUser: non-correct JSON")
		}
	}
}
