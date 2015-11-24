package actors

import akka.actor._
import play.api.Logger
import plm.core.model.lesson.Exercise
import org.xnap.commons.i18n.I18nFactory
import java.util.Locale
import plm.core.model.lesson.ExerciseRunner
import org.xnap.commons.i18n.I18n
import log.PLMLogger
import plm.core.model.Game
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.Exercise.WorldKind
import json.world.WorldToJson
import spies.OperationSpy
import plm.universe.World
import plm.core.GameStateListener
import plm.core.model.Game.GameState
import play.api.libs.json.Json
import plm.core.model.lesson.ExecutionProgress

/**
 * @author matthieu
 */
object ExecutionActor {
  def props = Props[ExecutionActor]

  val logger: PLMLogger = new PLMLogger
  val i18n: I18n = I18nFactory.getI18n(getClass(),"org.plm.i18n.Messages", new Locale("en"), I18nFactory.FALLBACK);
  
  val exerciseRunner: ExerciseRunner = new ExerciseRunner(logger, i18n)
  
  case class StartExecution(out: ActorRef, exercise: Exercise, progLang: ProgrammingLanguage, code: String)
  case class StopExecution()
}

class ExecutionActor extends Actor {
  import ExecutionActor._

  var registeredSpies: Array[OperationSpy] = Array()
  
  def receive =  {
    case StartExecution(out, exercise, progLang, code) =>
      addOperationSpies(out, exercise)
      val executionResult: ExecutionProgress = exerciseRunner.run(exercise, progLang, code)
      registeredSpies.foreach { spy => 
        spy.sendOperations
        spy.unregister
      }
      registeredSpies = Array()
      sender ! executionResult
    case StopExecution() =>
      // TODO: Implement me
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }
  
  def addOperationSpies(out: ActorRef, exercise: Exercise) {
    exercise.getWorlds(WorldKind.CURRENT).toArray(Array[World]()).foreach { world =>
      val worldSpy: OperationSpy = new OperationSpy(out, world)
      registeredSpies = registeredSpies.+:(worldSpy)
    }
  }
}