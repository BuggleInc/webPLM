package actors.execution

import akka.actor.Actor
import akka.actor.ActorRef
import play.api.i18n.Lang
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.Exercise
import log.PLMLogger

/**
 * @author matthieu
 */

object ExecutionActor {
  case class StartExecution(out: ActorRef, exercise: Exercise, progLang: ProgrammingLanguage, code: String)
  case class StopExecution()
  case class UpdateLang(lang: Lang)
}

abstract class ExecutionActor extends Actor {
  val logger: PLMLogger = new PLMLogger
}