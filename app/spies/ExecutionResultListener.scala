package spies

import plm.core.model.Game
import plm.core.model.Game.GameState
import plm.core.GameStateListener

import play.api.libs.json._
import play.api.Logger

import plm.core.model.lesson.Exercise
import plm.core.model.tracking.ProgressSpyListener
import plm.core.model.lesson.ExecutionProgress
import plm.core.model.lesson.ExecutionProgress._
import actors.PLMActor

class ExecutionResultListener(plmActor: PLMActor, game: Game) extends GameStateListener {
  val logger: Logger = Logger(this.getClass)
  
  def stateChanged(gameState: GameState) {
    gameState match {
      case GameState.DEMO_ENDED =>
        logger.debug("Demo Executed - Now sending the signal")
        plmActor.sendMessage("demoEnded", Json.obj())
      case GameState.EXECUTION_ENDED =>
        logger.debug("Executed - Now sending the exercise's result")
        var exo: Exercise = game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise]
        var msgType: Int = 0;
        if(exo.lastResult.outcome == ExecutionProgress.outcomeKind.PASS) {
          msgType = 1;
        }
        var msg: String = exo.lastResult.getMsg();
        
        var mapArgs: JsValue = Json.obj(
          "msgType" -> msgType,
          "msg" -> msg
        )
        
        plmActor.sendMessage("executionResult", mapArgs)
      case _ =>
        
    }
  }
}