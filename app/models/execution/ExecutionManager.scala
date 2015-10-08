package models.execution

import actors.PLMActor
import plm.core.model.Game
import models.Git

/**
 * @author matthieu
 */
trait ExecutionManager {
  def startExecution(plmActor: PLMActor, git: Git, game: Game, lessonID: String, exerciseID: String, code: String, workspace: String)
  def stopExecution()
}