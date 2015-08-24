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
import plm.core.model.tracking.GitUtils
import plm.universe.World
import scala.collection.mutable.ListBuffer
import scala.collection.immutable.HashMap
import play.api.libs.json._
import play.api.Play
import play.api.Play.current
import play.api.Logger
import play.api.i18n.Lang
import log.PLMLogger
import actors.PLMActor
import java.util.Locale
import java.util.Properties

class PLM(properties: Properties, userUUID: String, plmLogger: PLMLogger, locale: Locale, lastProgLang: Option[String], trackUser: Boolean) {
  
  var _currentExercise: Exercise = _
  var _currentLang: Lang = _
  var gitUtils = new GitUtils()
  var game = new Game(userUUID, plmLogger, locale, lastProgLang.getOrElse("Java"), gitUtils, trackUser, properties)
  var gitGest = new Git(userUUID, gitUtils)
  var tribunal : Tribunal = new Tribunal

  def lessons: Array[Lesson] = game.getLessons.toArray(Array[Lesson]())

  def switchLesson(lessonID: String): Lecture = {
    var key = "lessons." + lessonID;
    game.switchLesson(key, true)

    var lect: Lecture = game.getCurrentLesson.getCurrentExercise
    var exo: Exercise = lect.asInstanceOf[Exercise]
    
    _currentExercise = exo;
    
    return lect
  }
  
  def switchExercise(lessonID: String, exerciseID: String): Lecture = {
    var key = "lessons." + lessonID;
    game.switchLesson(key, true)
    game.switchExercise(exerciseID)

    var lect: Lecture = game.getCurrentLesson.getCurrentExercise
    var exo: Exercise = lect.asInstanceOf[Exercise]
    
    _currentExercise = exo;

    return lect
  }
  
  def revertExercise(): Lecture = {
    game.revertExo
    return _currentExercise
  }

  def getSelectedWorldID(): String = {
    return game.getSelectedWorld.getName
  }
  
  def getInitialWorlds(): Array[World] = {
    if(_currentExercise != null && _currentExercise.getWorlds(WorldKind.INITIAL) != null) _currentExercise.getWorlds(WorldKind.INITIAL).toArray(Array[World]()) else null
  }
  
  def getAPI(): String = {
    var api: String = ""
    if(getInitialWorlds != null) {
      api = getInitialWorlds.head.getAbout
    }
    return api
  }
  
  def runExercise(plmActor : PLMActor, lessonID: String, exerciseID: String, code: String, workspace: String) {
    _currentExercise.getSourceFile(programmingLanguage, 0).setBody(code)
    if(workspace != null){
      _currentExercise.getSourceFile(programmingLanguage, 1).setBody(workspace)
    }
    tribunal.start(plmActor, gitGest, game, lessonID, exerciseID, code)
  }
  
  def stopExecution() {
    tribunal.free()
  }
  
  def programmingLanguage: ProgrammingLanguage = game.getProgrammingLanguage
  
  def setProgrammingLanguage(lang: String) {
    game.setProgrammingLanguage(lang)
  }
  
  def getStudentCode: String = {
    if(_currentExercise != null && _currentExercise.getSourceFile(programmingLanguage, programmingLanguage.getVisualIndex()) != null) _currentExercise.getSourceFile(programmingLanguage, programmingLanguage.getVisualIndex()).getBody else ""
  }
  
  def addProgressSpyListener(progressSpyListener: ProgressSpyListener) {
    game.addProgressSpyListener(progressSpyListener)  
  }
  
  def removeProgressSpyListener(progressSpyListener: ProgressSpyListener) {
    game.removeProgressSpyListener(progressSpyListener)  
  }

  def setLang(lang: Lang) {
  	if(_currentLang != lang) {
  		_currentLang = lang
  		game.setLocale(_currentLang.toLocale)
  	}
  }

  def currentExercise: Exercise = _currentExercise
  
  def getMission(progLang: ProgrammingLanguage): String = {
    if(_currentExercise != null) _currentExercise.getMission(progLang) else ""
  }
  
  def setUserUUID(userUUID: String) {
    _currentExercise = null
    game.setUserUUID(userUUID)
  }
  
  def signalIdle(start: String, end: String, duration: String) {
    game.signalIdle(start, end, duration)
  }
  
  def setTrackUser(trackUser: Boolean) {
    game.setTrackUser(trackUser)
  }
  
  def signalCommonErrorFeedback(commonErrorID: Int, accuracy: Int, help: Int, comment: String) {
    game.signalCommonErrorFeedback(commonErrorID, accuracy, help, comment)
  }
  
  def quit(progLangSpy: ProgLangListener, humanLangSpy: HumanLangListener) {
    game.removeProgLangListener(progLangSpy)
    game.removeHumanLangListener(humanLangSpy)
    game.quit
  }
}
