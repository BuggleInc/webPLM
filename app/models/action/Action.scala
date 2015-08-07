package models.action

import actors.PLMActor
import play.api.libs.json._
import play.api.Logger

trait IAction {
	def run() 
}

private[action] abstract class Action(actor : PLMActor, msg : JsValue) extends IAction {
}

private[action] class UnhandledAction(actor : PLMActor, msg : JsValue) extends Action(actor, msg) {
	override def run() {
          Logger.debug("cmd: non-correct JSON")
	}
}

object Action {
	/**
	 * 
	 */
	def apply(cmd : String, actor : PLMActor, msg : JsValue) : IAction = {
			return cmd match {
			// LoginAction
				case "signIn" | "signUp" => new SignInAction(actor, msg)
				case "signOut" => new SignOutAction(actor, msg)
			// GetAction
				case "getLessons" => new GetLessonsAction(actor, msg)
				case "getExercises" => new GetExercisesAction(actor, msg)
				case "getLangs" => new GetLangsAction(actor, msg)
				case "getExercise" => new GetExerciseAction(actor, msg)
			// SetAction
				case "setProgrammingLanguage" => new SetProgrammingLanguageAction(actor, msg)
				case "setLang" => new SetLangAction(actor, msg)
				case "setTrackUser" => new SetTrackUserAction(actor, msg)
			// ControlAction
				case "runExercise" => new RunExerciseAction(actor, msg)
				case "runDemo" => new RunDemoAction(actor, msg)
				case "stopExecution" => new StopExecutionAction(actor, msg)
				case "revertExercise" => new RevertExerciseAction(actor, msg)
			// UpdateAction
				case "updateUser" => new UpdateUserAction(actor, msg)
				case "userIdle" => new UserIdleAction(actor, msg)
				case "userBack" => new UserBackAction(actor, msg)
			// Default
				case _ => new UnhandledAction(actor, msg)
			}
	}
}
