package spies

import play.api.libs.json._
import play.Logger

import plm.core.model.Game
import plm.core.model.lesson.Exercise
import plm.core.model.tracking.ProgressSpyListener
import plm.core.model.lesson.ExecutionProgress
import plm.core.model.lesson.ExecutionProgress._

import actors.PLMActor

class ExecutionResultSpy(plmActor: PLMActor) extends ProgressSpyListener {
  
  def executed(exo: Exercise) {
    Logger.debug("Executed - Now sending the exercise's result")
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
  }
  
  def switched(exo: Exercise) {
    // Do not care
  }
  
  def reverted(exo: Exercise) {
    // Do not care
  }
  
  def heartbeat() {
    // Do not care
  }
  
  def join(): String = {
    // Do not care
    return null;
  }
  
  def leave() {
    // Do not care
  }
  
  def callForHelp(studentInput: String) {
    // Do not care
  }
  
  def cancelCallForHelp() {
    // Do not care
  }
  
  def readTip(id: String, mission: String) {
    // Do not care
  }
}