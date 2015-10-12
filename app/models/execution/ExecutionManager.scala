package models.execution

import actors.PLMActor
import plm.core.model.Game
import models.Git

/**
 * @author matthieu
 */
trait ExecutionManager {
  var plmActor: PLMActor = null
  var game: Game = null
  
  def setPLMActor(plmActor: PLMActor) = { this.plmActor = plmActor }
  def setGame(game: Game) = { this.game = game }
  def startExecution(git: Git, lessonID: String, exerciseID: String, code: String, workspace: String)
  def stopExecution()
}