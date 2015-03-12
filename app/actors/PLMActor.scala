package actors

import akka.actor._
import play.api.libs.json._
import play.api.mvc.RequestHeader

import json._

import models.PLM
import log.RemoteLogWriter
import log.LoggerUtils
import spies._
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.Lesson
import plm.core.model.lesson.Lecture
import plm.core.lang.ProgrammingLanguage
import plm.universe.Entity
import plm.universe.World
import plm.universe.IWorldView
import plm.universe.GridWorld
import plm.universe.GridWorldCell
import plm.universe.bugglequest.BuggleWorld
import plm.universe.bugglequest.AbstractBuggle
import plm.universe.bugglequest.BuggleWorldCell

import play.api.Play.current
import play.api.i18n.Lang

object PLMActor {
  def props(out: ActorRef, preferredLang: Lang) = Props(new PLMActor(out, preferredLang))
}

class PLMActor(out: ActorRef, preferredLang: Lang) extends Actor {
  var availableLangs = Lang.availables
  var isProgressSpyAdded: Boolean = false
  PLM.setLang(preferredLang) // Set the language before Game instanciation
  var resultSpy: ExecutionResultListener = new ExecutionResultListener(this, PLM.game)
  PLM.game.addGameStateListener(resultSpy)
  var registeredSpies: List[ExecutionSpy] = List()
  
  var remoteLogWriter: RemoteLogWriter = new RemoteLogWriter(this, PLM.game)
  
  def receive = {
    case msg: JsValue =>
      LoggerUtils.debug("Received a message")
      LoggerUtils.debug(msg.toString())
      var cmd: Option[String] = (msg \ "cmd").asOpt[String]
      cmd.getOrElse(None) match {
        case "getLessons" =>
          sendMessage("lessons", Json.obj(
            "lessons" -> LessonToJson.lessonsWrite(PLM.lessons)
          ))
        case "setProgrammingLanguage" =>
          var optProgrammingLanguage: Option[String] = (msg \ "args" \ "programmingLanguage").asOpt[String]
          (optProgrammingLanguage.getOrElse(None)) match {
            case programmingLanguage: String =>
              PLM.setProgrammingLanguage(programmingLanguage)
              sendMessage("programmingLanguageSet", Json.obj(
                "code" -> PLM.getStudentCode    
              ))
            case _ =>
              LoggerUtils.debug("getExercise: non-correct JSON")
          }
        case "getExercise" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          var lecture: Lecture = null;
          var executionSpy: ExecutionSpy = new ExecutionSpy(this, "operations")
          var demoExecutionSpy: ExecutionSpy = new ExecutionSpy(this, "demoOperations")
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String) =>
              lecture = PLM.switchExercise(lessonID, exerciseID, executionSpy, demoExecutionSpy)
            case (lessonID:String, _) =>
              lecture = PLM.switchLesson(lessonID, executionSpy, demoExecutionSpy)
            case (_, _) =>
              LoggerUtils.debug("getExercise: non-correct JSON")
          }
          if(lecture != null) {
            sendMessage("exercise", Json.obj(
              "exercise" -> LectureToJson.lectureWrites(lecture, PLM.programmingLanguage, PLM.getStudentCode, PLM.getInitialWorlds, PLM.getSelectedWorldID)
            ))
          }
        case "runExercise" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          var optCode: Option[String] = (msg \ "args" \ "code").asOpt[String]
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None), optCode.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String, code: String) =>
              PLM.runExercise(lessonID, exerciseID, code)
            case (_, _, _) =>
              LoggerUtils.debug("runExercise: non-correctJSON")
          }
        case "runDemo" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String) =>
              PLM.runDemo(lessonID, exerciseID)
            case (_, _) =>
              LoggerUtils.debug("runDemo: non-correctJSON")
          }
        case "stopExecution" =>
          PLM.stopExecution
        case "revertExercise" =>
          var lecture = PLM.revertExercise
          sendMessage("exercise", Json.obj(
              "exercise" -> LectureToJson.lectureWrites(lecture, PLM.programmingLanguage, PLM.getStudentCode, PLM.getInitialWorlds, PLM.getSelectedWorldID)
          ))
        case "getExercises" =>
          var lectures = PLM.game.getCurrentLesson.getRootLectures.toArray(Array[Lecture]())
          sendMessage("exercises", Json.obj(
            "exercises" -> ExerciseToJson.exercisesWrite(lectures) 
          ))
        case "getLangs" =>
          sendMessage("langs", Json.obj(
            "selected" -> LangToJson.langWrite(preferredLang),
            "availables" -> LangToJson.langsWrite(availableLangs)
          ))
        case _ =>
          LoggerUtils.debug("cmd: non-correct JSON")
      }
  }
  
  def createMessage(cmdName: String, mapArgs: JsValue): JsValue = {
    return Json.obj(
      "cmd" -> cmdName,
      "args" -> mapArgs
    )
  }
  
  def sendMessage(cmdName: String, mapArgs: JsValue) {
    out ! createMessage(cmdName, mapArgs)
  }
  
  def registerSpy(spy: ExecutionSpy) {
    registeredSpies = registeredSpies ::: List(spy)
  }
  
  override def postStop() = {
    LoggerUtils.debug("postStop: websocket closed - removing the spies")
    PLM.game.removeGameStateListener(resultSpy)
    registeredSpies.foreach { spy => spy.unregister }
  }
}