package models.execution

import actors.PLMActor
import models.Git
import plm.core.model.Game
import plm.core.model.lesson.Exercise
import plm.core.lang.ProgrammingLanguage
import spies.ExecutionSpy
import plm.core.model.lesson.Exercise.WorldKind
import plm.universe.World
import plm.core.GameStateListener
import plm.core.model.lesson.ExecutionProgress
import plm.core.model.Game.GameState
import play.api.Logger
import play.api.libs.json.JsValue
import play.api.libs.json.Json

/**
 * @author matthieu
 */
class LocalExecution extends GameStateListener with ExecutionManager {
  var executionSpy: ExecutionSpy = _

  var registeredSpies: List[ExecutionSpy] = List()

  override def setPLMActor(plmActor: PLMActor) {
    this.plmActor = plmActor
    executionSpy = new ExecutionSpy(plmActor, "operations")
  }

  override def setGame(game: Game) {
    this.game = game
    game.addGameStateListener(this)
  }

  def startExecution(git: Git, lessonID: String, exerciseID: String, code: String, workspace: String) {
    var programmingLanguage: ProgrammingLanguage = game.getProgrammingLanguage
    var currentExercise: Exercise = game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise]

    setSourceFile(currentExercise, programmingLanguage, code, workspace)
    addExecutionSpy(currentExercise)
    game.startExerciseExecution
  }

  def stopExecution() {
    game.stopExerciseExecution
  }

  def setSourceFile(exercise: Exercise, programmingLanguage: ProgrammingLanguage, code: String, workspace: String) {
    exercise.getSourceFile(programmingLanguage, 0).setBody(code)
    if(workspace != null){
      exercise.getSourceFile(programmingLanguage, 1).setBody(workspace)
    }
  }

  def addExecutionSpy(exo: Exercise) {
    // Adding the executionSpy to the current worlds
    exo.getWorlds(WorldKind.CURRENT).toArray(Array[World]()).foreach { world =>
      var worldSpy: ExecutionSpy = executionSpy.clone()
      registeredSpies = registeredSpies ::: List(worldSpy)
      worldSpy.setWorld(world)
    }
  }

  def removeExecutionSpy() {
    registeredSpies.foreach { spy => spy.unregister }
  }

  def stateChanged(gameState: GameState) {
    gameState match {
      case GameState.EXECUTION_ENDED =>
        Logger.info("Executed - Now sending the exercise's result")
        var exo: Exercise = game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise]
        var msgType: Int = 0;
        var commonErrorID: Int = exo.lastResult.commonErrorID;
        var commonErrorText: String = exo.lastResult.commonErrorText;
        if(exo.lastResult.outcome == ExecutionProgress.outcomeKind.PASS) {
          msgType = 1;
        }
        var msg: String = exo.lastResult.getMsg(game.i18n);

        var mapArgs: JsValue = Json.obj(
          "msgType" -> msgType,
          "msg" -> msg,
          "commonErrorID" -> commonErrorID,
          "commonErrorText" -> commonErrorText
        )

        registeredSpies.foreach { spy => spy.sendOperations }
        plmActor.sendMessage("executionResult", mapArgs)
        removeExecutionSpy
      case _ =>
    }
  }
}
