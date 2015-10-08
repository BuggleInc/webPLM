package models.execution

import actors.PLMActor
import models.Git
import plm.core.model.Game
import plm.core.model.lesson.Exercise
import plm.core.lang.ProgrammingLanguage


/**
 * @author matthieu
 */
class LocalExecution extends ExecutionManager {
  var game: Game = null
  
  def startExecution(plmActor: PLMActor, git: Git, game: Game, lessonID: String, exerciseID: String, code: String, workspace: String) {
    this.game = game
    var programmingLanguage: ProgrammingLanguage = game.getProgrammingLanguage
    var currentExercise: Exercise = game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise]
    currentExercise.getSourceFile(programmingLanguage, 0).setBody(code)
    if(workspace != null){
      currentExercise.getSourceFile(programmingLanguage, 1).setBody(workspace)
    }
    game.startExerciseExecution
  }
  
  def stopExecution() {
    game.stopExerciseExecution
  }
}