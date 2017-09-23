package actors.execution

import java.util.Locale

import akka.actor.{ActorRef, Props}
import play.api.Logger
import play.api.i18n.Lang
import plm.core.model.lesson.ExecutionProgress.outcomeKind
import plm.core.model.lesson.Exercise.WorldKind
import plm.core.model.lesson.{ExecutionProgress, ExerciseRunner}
import spies.OperationSpy

import scala.collection.JavaConverters._
import scala.compat.java8.FutureConverters._
import scala.concurrent.ExecutionContext.Implicits._
import scala.concurrent.Future

/**
 * @author matthieu
 */

object LocalExecutionActor {
  def props(initialLang: Lang) = Props(new LocalExecutionActor(initialLang))
}

class LocalExecutionActor(initialLang: Lang) extends ExecutionActor {
  import ExecutionActor._

  var currentLocale: Locale = initialLang.toLocale
  val exerciseRunner: ExerciseRunner = new ExerciseRunner(currentLocale)
  var executionStopped: Boolean = false

  def receive: PartialFunction[Any, Unit] =  {
    case StartExecution(out, exercise, progLang, code) =>
      val plmActor: ActorRef = sender
      executionStopped = false
      val spies = exercise.getWorlds(WorldKind.CURRENT).asScala.map(world => new OperationSpy(out, world))
      val future: Future[ExecutionProgress] = exerciseRunner.run(exercise, progLang, code).toScala

      future onSuccess {
        case executionResult: ExecutionProgress =>
          for (spy <- spies) {
            spy.stop()
            if(!executionStopped && executionResult.outcome != outcomeKind.TIMEOUT) {
              spy.flush()
            }
          }
          plmActor ! executionResult
        case _ =>
      }
    case StopExecution =>
      executionStopped = true
      exerciseRunner.stopExecution()
    case UpdateLang(lang: Lang) =>
      currentLocale = lang.toLocale
      exerciseRunner.setI18n(currentLocale)
    case _ =>
      Logger.error("LocalExecutionActor: not supported message")
  }
}
