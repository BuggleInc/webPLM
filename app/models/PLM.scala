package models

import plm.core.model.Game
import plm.core.model.lesson.Lesson
import plm.core.model.lesson.Lecture
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.Exercise.StudentOrCorrection
import plm.core.model.lesson.ExecutionProgress
import plm.core.model.lesson.ExecutionProgress._
import plm.core.lang.ProgrammingLanguage
import scala.collection.mutable.ListBuffer
import play.api.libs.json._
import plm.core.model.session.SourceFile
import play.Logger

object PLM {
  
  var _game : Game = Game.getInstance()
  var _lessons : List[Lesson] = game.getLessons.toArray(Array[Lesson]()).toList
  var _programmingLanguages: List[ProgrammingLanguage] = Game.getProgrammingLanguages.toList
  
  def game : Game = _game
  def lessons: List[Lesson] = _lessons
  
  def programmingLanguages: List[String] = {
    var programmingLanguages : ListBuffer[String] = new ListBuffer[String]()
    _programmingLanguages.foreach { x => println("lang: ", x.getLang); programmingLanguages += x.getLang };
    return programmingLanguages.toList
  }
  
  def switchLesson(lessonName: String): Lecture = {
    var key = "lessons." + lessonName;
    game.switchLesson(key, true)
    return game.getCurrentLesson.getCurrentExercise
  }
  
  def switchExercise(lessonID: String, exerciseID: String): Lecture = {
    var key = "lessons." + lessonID;
    game.switchLesson(key, true)
    return game.getCurrentLesson.getCurrentExercise
  }
  
  def runExercise(lessonID: String, exerciseID: String, code: String): ExecutionResult = {
    var exo: Exercise = _game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise]
    
    Logger.debug("Code: "+code)
    
    exo.getSourceFile(programmingLanguage, 0).setBody(code)
    _game.startExerciseExecution()
    
    
    var msgType: Int = 0
    if(exo.lastResult.outcome == ExecutionProgress.outcomeKind.PASS) {
      msgType = 1;
    }
    var msg = exo.lastResult.getMsg
    
    return new ExecutionResult(msgType, msg)
  }
  
  def programmingLanguage: ProgrammingLanguage = Game.getProgrammingLanguage
  
  def getStudentCode: String = {
    return _game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise].getSourceFile(programmingLanguage, 0).getBody;
  }
  
}