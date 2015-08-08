package models.action

import actors.PLMActor
import play.api.libs.json._
import play.api.Logger
import json.LectureToJson

private[action] abstract class ControlAction(actor : PLMActor, msg : JsValue) extends Action(actor, msg) {
}

private[action] class RunExerciseAction(actor : PLMActor, msg : JsValue) extends ControlAction(actor, msg) {
	override def run() {
		var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
		var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
		var optCode: Option[String] = (msg \ "args" \ "code").asOpt[String]
		var optWorkspace: Option[String] = (msg \ "args" \ "workspace").asOpt[String]
		(optLessonID.getOrElse(None), optExerciseID.getOrElse(None), optCode.getOrElse(None), optWorkspace.getOrElse(None)) match {
			case (lessonID: String, exerciseID: String, code: String, workspace: String) =>
				actor.plm.runExercise(actor, lessonID, exerciseID, code, workspace)
			case (lessonID:String, exerciseID: String, code: String, _) =>
				actor.plm.runExercise(actor, lessonID, exerciseID, code, null)
			case (_, _, _, _) =>
				Logger.debug("runExercise: non-correctJSON")
		}
	}
}

/**
 * @deprecated You should not use the "runDemo" action anymore. You can already acces the generated demo file at : /assets/json/demos/<<exercise>>.json
 */
@Deprecated
private[action] class RunDemoAction(actor : PLMActor, msg : JsValue) extends ControlAction(actor, msg) {
	override def run() {
		Logger.warn("You should not use the runDemo action anymore. You can access the generated demo file at : /assets/json/demos/<<exercise>>.json");
		var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
		var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
		(optLessonID.getOrElse(None), optExerciseID.getOrElse(None)) match {
			case (lessonID:String, exerciseID: String) =>
				actor.plm.runDemo(lessonID, exerciseID)
			case (_, _) =>
				Logger.debug("runDemo: non-correctJSON")
		}
	}
}

private[action] class StopExecutionAction(actor : PLMActor, msg : JsValue) extends ControlAction(actor, msg) {
	override def run() {
          actor.plm.stopExecution
	}
}

private[action] class RevertExerciseAction(actor : PLMActor, msg : JsValue) extends ControlAction(actor, msg) {
	override def run() {
		var lecture = actor.plm.revertExercise
		actor.sendMessage("exercise", Json.obj(
			"exercise" -> LectureToJson.lectureWrites(
				actor.plm,
				lecture,
				actor.plm.programmingLanguage,
				actor.plm.getStudentCode,
				actor.plm.getInitialWorlds,
				actor.plm.getSelectedWorldID)
			))
	}
}
