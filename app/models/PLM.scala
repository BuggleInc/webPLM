package models

import spies.ExecutionSpy

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
import play.Logger

object PLM {
  
  var _game : Game = Game.getInstance()
  var _lessons : List[Lesson] = game.getLessons.toArray(Array[Lesson]()).toList
  var _programmingLanguages: List[ProgrammingLanguage] = Game.getProgrammingLanguages.toList
  var _currentExercise : Exercise = _
  
  var currentExecutionSpies: Map[World, ExecutionSpy] = Map()
  
  def game : Game = _game
  def lessons: List[Lesson] = _lessons
  
  def programmingLanguages: List[String] = {
    var programmingLanguages : ListBuffer[String] = new ListBuffer[String]()
    _programmingLanguages.foreach { x => println("lang: ", x.getLang); programmingLanguages += x.getLang };
    return programmingLanguages.toList
  }
  
  def switchLesson(lessonID: String, spy: ExecutionSpy): Lecture = {
    var key = "lessons." + lessonID;
    game.switchLesson(key, true)
    var lect: Lecture = game.getCurrentLesson.getCurrentExercise
    var exo: Exercise = lect.asInstanceOf[Exercise]
    
    addExecutionSpy(exo, spy)
    _currentExercise = exo;
    
    return lect
  }
  
  def switchExercise(lessonID: String, exerciseID: String, spy: ExecutionSpy): Lecture = {
    var key = "lessons." + lessonID;
    game.switchLesson(key, true)
    var lect: Lecture = game.getCurrentLesson.getCurrentExercise
    var exo: Exercise = lect.asInstanceOf[Exercise]
    
    addExecutionSpy(exo, spy)
    _currentExercise = exo;
    
    return lect
  }
  
  def addExecutionSpy(exo: Exercise, spy: ExecutionSpy) {
    // Adding the executionSpy to the current worlds
    exo.getWorlds(WorldKind.CURRENT).toArray(Array[World]()).toList.foreach { world => 
      var executionSpy: ExecutionSpy = spy.clone()
      executionSpy.setWorld(world)
    }
  }
  
  def removeExecutionSpies() {
    currentExecutionSpies.foreach((e: (World, ExecutionSpy)) => 
      e._1.removeWorldUpdatesListener(e._2)
    )
    currentExecutionSpies.empty
  }
  
  def getInitialWorlds(): List[World] = {
    var exo: Exercise = game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise]
    exo.getWorlds(WorldKind.INITIAL).toArray(Array[World]()).toList
  }
  
  
  def runExercise(lessonID: String, exerciseID: String, code: String) {
    var exo: Exercise = _game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise]
    
    Logger.debug("Code:\n"+code)
    
    exo.getSourceFile(programmingLanguage, 0).setBody(code)
    _game.startExerciseExecution()

  }
  
  def stopExecution() {
    _game.stopExerciseExecution()
  }
  
  def programmingLanguage: ProgrammingLanguage = Game.getProgrammingLanguage
  
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