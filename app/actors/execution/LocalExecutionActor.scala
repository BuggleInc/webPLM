package actors.execution

import java.util.Locale
import spies.OperationSpy
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.ExecutionProgress
import akka.actor.Props
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.ExerciseRunner
import log.PLMLogger
import play.api.Logger
import akka.actor.Actor
import play.api.i18n.Lang
import akka.actor.ActorRef
import plm.core.model.lesson.Exercise.WorldKind
import plm.universe.World
import java.util.concurrent.CompletableFuture
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits._
import plm.core.model.lesson.ExecutionProgress.outcomeKind
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
  exerciseRunner.setMaxNumberOfTries(3)
  var executionStopped: Boolean = false

  var registeredSpies: Array[OperationSpy] = Array()

  def receive =  {
    case StartExecution(out, exercise, progLang, code) =>
      val plmActor: ActorRef = sender
      executionStopped = false
      addOperationSpies(out, exercise, progLang)
      val f: CompletableFuture[ExecutionProgress] = exerciseRunner.run(exercise, progLang, code)

      val future: Future[ExecutionProgress] = Future { f.get }

      future onSuccess {
        case executionResult: ExecutionProgress =>
          registeredSpies.foreach { spy =>
            spy.stop
            if(!executionStopped && executionResult.outcome != outcomeKind.TIMEOUT) {
              spy.flush
            }
          }
          registeredSpies = Array()
          plmActor ! executionResult
        case _ =>
      }
    case StopExecution =>
      executionStopped = true
      exerciseRunner.stopExecution
    case UpdateLang(lang: Lang) =>
      currentLocale = lang.toLocale
      exerciseRunner.setI18n(currentLocale)
    case _ =>
      Logger.error("LocalExecutionActor: not supported message")
  }

  def addOperationSpies(out: ActorRef, exercise: Exercise, progLang: ProgrammingLanguage) {
    exercise.getWorlds(WorldKind.CURRENT).toArray(Array[World]()).foreach { world =>
      val worldSpy: OperationSpy = new OperationSpy(out, world, progLang)
      registeredSpies = registeredSpies.+:(worldSpy)
    }
  }
}
