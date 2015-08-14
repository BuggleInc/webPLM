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
import plm.core.utils.FileUtils
import scala.collection.mutable.ListBuffer
import scala.collection.immutable.HashMap
import play.api.Logger
import play.api.i18n.Lang
import log.PLMLogger
import actors.PLMActor
import java.util.Locale
import java.io.File
import java.io.IOException

import plm.core.ui.PlmHtmlEditorKit

class PLM(userUUID: String, plmLogger: PLMLogger, locale: Locale, lastProgLang: Option[String], trackUser: Boolean) {
  
  var _currentExercise: Exercise = _
  var _currentExerciseName: String = _
  var _currentLessonName: String = _
  var _currentLang: Lang = Lang(locale.toString)
  var _currentProgLangName = lastProgLang.getOrElse("Java")
  var gitUtils = new GitUtils()
  var game = new Game(userUUID, plmLogger, locale, _currentProgLangName, gitUtils, trackUser)
  var gitGest = new Git(userUUID, gitUtils)
  var tribunal : Tribunal = new Tribunal
  
  def lessons: Seq[models.data.Lesson] = models.data.Lesson.getLessonsList()

  def switchLesson(lessonID: String): Lecture = {
    var key = "lessons." + lessonID;
    _currentLessonName = key
    game.switchLesson(key, true)

    var lect: Lecture = game.getCurrentLesson.getCurrentExercise
    var exo: Exercise = lect.asInstanceOf[Exercise]
    _currentExercise = exo;
    _currentExerciseName = _currentExercise.getId
    
    exo.getWorlds(WorldKind.INITIAL).toArray(Array[World]()).foreach { initialWorld: World => 
      initialWorld.setDelay(0)
    }
    
    return lect
  }
  
  def switchExercise(lessonID: String, exerciseID: String): Lecture = {
    var key = "lessons." + lessonID;
    game.switchLesson(key, true)
    game.switchExercise(exerciseID)

    var lect: Lecture = game.getCurrentLesson.getCurrentExercise
    var exo: Exercise = lect.asInstanceOf[Exercise]
    
    _currentExercise = exo;
    _currentExerciseName = _currentExercise.getId

    exo.getWorlds(WorldKind.INITIAL).toArray(Array[World]()).foreach { initialWorld: World => 
      initialWorld.setDelay(0)
    }
    
    return lect
  }
  
  def revertExercise(): Lecture = {
    game.revertExo
    return _currentExercise
  }
  
  def getInitialWorlds(): Array[World] = {
    if(_currentExercise != null && _currentExercise.getWorlds(WorldKind.INITIAL) != null) _currentExercise.getWorlds(WorldKind.INITIAL).toArray(Array[World]()) else null
  }
  
  def getAPI(): String = {
    var filename: String = _currentExercise.getWorlds(WorldKind.CURRENT).firstElement.getClass.getCanonicalName.replace('.', File.separatorChar);
    var api: String = ""
    var api_nonformatted : String = null
    if (api_nonformatted == null) {
      var sb : StringBuffer = null
      try {
        sb = FileUtils.readContentAsText(filename, game.getLocale(), "html", true)
      } catch {
        case ex : IOException => api_nonformatted = "File "+filename+".html not found."
        return api_nonformatted
      }
      /* read it */
      api_nonformatted = sb.toString();
    }
    api = PlmHtmlEditorKit.filterHTML(api_nonformatted, game.isDebugEnabled(), game.getProgrammingLanguage());
    return api
  }
  
  def runExercise(plmActor : PLMActor, lessonID: String, exerciseID: String, code: String, workspace: String) {
    tribunal.startTribunal(plmActor, gitGest, _currentLang.toLocale.toString, _currentProgLangName, lessonID, exerciseID, code)
  }
  
  def stopExecution() {
    tribunal.free()
  }
  
  def programmingLanguage: ProgrammingLanguage = game.getProgrammingLanguage
  
  def setProgrammingLanguage(lang: String) {
	_currentProgLangName = lang
    game.setProgrammingLanguage(_currentProgLangName)
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
  	var missionLoader = new DataLoader
  	missionLoader.loadHTMLMission(
  			_currentExerciseName,
  			_currentLang.toLocale,
  			game.i18n)
  	if(_currentExercise != null) PlmHtmlEditorKit.filterHTML(missionLoader.mission, game.isDebugEnabled(), progLang) else ""
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
}
