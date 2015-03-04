package models

import spies._

import plm.core.model.Game
import plm.core.model.lesson.Lesson
import plm.core.model.lesson.Lecture
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.Exercise.WorldKind
import plm.core.model.lesson.Exercise.StudentOrCorrection
import plm.core.model.lesson.ExecutionProgress
import plm.core.model.lesson.ExecutionProgress._
import plm.core.lang.ProgrammingLanguage
import plm.core.model.session.SourceFile
import plm.core.model.tracking.ProgressSpyListener
import plm.universe.World

import scala.collection.mutable.ListBuffer
import scala.collection.immutable.HashMap
import play.api.libs.json._
import log.LoggerUtils

object PLM {
  
  var _game : Game = Game.getInstance()
  var _lessons : Array[Lesson] = game.getLessons.toArray(Array[Lesson]())
  var _programmingLanguages: List[ProgrammingLanguage] = Game.getProgrammingLanguages.toList
  var _currentExercise : Exercise = _
    
  def game : Game = _game
  def lessons: Array[Lesson] = _lessons
  
  def programmingLanguages: List[ProgrammingLanguage] = {
    return _programmingLanguages
  }
  
  def switchLesson(lessonID: String, executionSpy: ExecutionSpy, demoExecutionSpy: ExecutionSpy): Lecture = {
    var key = "lessons." + lessonID;
    game.switchLesson(key, true)

    var lect: Lecture = game.getCurrentLesson.getCurrentExercise
    var exo: Exercise = lect.asInstanceOf[Exercise]
    
    addExecutionSpy(exo, executionSpy, WorldKind.CURRENT)
    addExecutionSpy(exo, demoExecutionSpy, WorldKind.ANSWER)
    _currentExercise = exo;
    
    exo.getWorlds(WorldKind.INITIAL).toArray(Array[World]()).foreach { initialWorld: World => 
      initialWorld.setDelay(5)
    }
    
    return lect
  }
  
  def switchExercise(lessonID: String, exerciseID: String, executionSpy: ExecutionSpy, demoExecutionSpy: ExecutionSpy): Lecture = {
    var key = "lessons." + lessonID;
    game.switchLesson(key, true)
    game.switchExercise(exerciseID)

    var lect: Lecture = game.getCurrentLesson.getCurrentExercise
    var exo: Exercise = lect.asInstanceOf[Exercise]
    
    addExecutionSpy(exo, executionSpy, WorldKind.CURRENT)
    addExecutionSpy(exo, demoExecutionSpy, WorldKind.ANSWER)
    _currentExercise = exo;
    
    exo.getWorlds(WorldKind.INITIAL).toArray(Array[World]()).foreach { initialWorld: World => 
      initialWorld.setDelay(5)
    }
    
    return lect
  }
  
  def revertExercise(): Lecture = {
    game.revertExo
    return game.getCurrentLesson.getCurrentExercise
  }

  def getSelectedWorldID(): String = {
    return game.getSelectedWorld.getName
  }
  
  def addExecutionSpy(exo: Exercise, spy: ExecutionSpy, kind: WorldKind) {
    // Adding the executionSpy to the current worlds
    exo.getWorlds(kind).toArray(Array[World]()).foreach { world =>
      var worldSpy: ExecutionSpy = spy.clone()
      worldSpy.setWorld(world)
    }
  }
  
  def getInitialWorlds(): Array[World] = {
    var exo: Exercise = game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise]
    exo.getWorlds(WorldKind.INITIAL).toArray(Array[World]())
  }
  
  
  def runExercise(lessonID: String, exerciseID: String, code: String) {
    var exo: Exercise = _game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise]
    
    LoggerUtils.debug("Code:\n"+code)
    
    exo.getSourceFile(programmingLanguage, 0).setBody(code)
    _game.startExerciseExecution()
  }
  
  def runDemo(lessonID: String, exerciseID: String) {
    var exo: Exercise = _game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise]
        
    _game.startExerciseDemoExecution()
  }
  
  def stopExecution() {
    _game.stopExerciseExecution()
  }
  
  def programmingLanguage: ProgrammingLanguage = Game.getProgrammingLanguage
  
  def setProgrammingLanguage(lang: String) {
    _game.setProgrammingLanguage(lang)
  }
  
  def getStudentCode: String = {
    return _game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise].getSourceFile(programmingLanguage, 0).getBody;
  }
  
  def addProgressSpyListener(progressSpyListener: ProgressSpyListener) {
    _game.addProgressSpyListener(progressSpyListener)  
  }
  
  def removeProgressSpyListener(progressSpyListener: ProgressSpyListener) {
    _game.removeProgressSpyListener(progressSpyListener)  
  }
}