package actors

import akka.actor._
import play.api.libs.json._
import play.api.mvc.RequestHeader
import json._
import models.GitHubIssueManager
import models.{ PLM, User }
import models.execution.ExecutionManager
import models.User
import log.PLMLogger
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
import play.api.Logger
import java.util.UUID
import models.daos.UserDAORestImpl
import codes.reactive.scalatime._
import Scalatime._
import java.util.Properties
import play.api.Play
import play.api.Play.current

object PLMActor {
  def props(executionManager: ExecutionManager, userAgent: String, actorUUID: String, gitID: String, newUser: Boolean, preferredLang: Option[Lang], lastProgLang: Option[String], trackUser: Option[Boolean])(out: ActorRef) = Props(new PLMActor(executionManager, userAgent, actorUUID, gitID, newUser, preferredLang, lastProgLang, trackUser, out))
  def propsWithUser(executionManager: ExecutionManager, userAgent: String, actorUUID: String, user: User)(out: ActorRef) = Props(new PLMActor(executionManager, userAgent, actorUUID, user, out))
}

class PLMActor (
    executionManager: ExecutionManager, 
    userAgent: String, 
    actorUUID: String, 
    gitID: String, 
    newUser: Boolean, 
    preferredLang: Option[Lang], 
    lastProgLang: Option[String], 
    trackUser: Option[Boolean], 
    out: ActorRef)
  extends Actor {
  
  def this(executionManager: ExecutionManager, userAgent: String, actorUUID: String, user: User, out: ActorRef) {
    this(executionManager, userAgent, actorUUID, user.gitID.toString, false, user.preferredLang, user.lastProgLang, user.trackUser, out)
    setCurrentUser(user)
  }
  
  var gitHubIssueManager: GitHubIssueManager = new GitHubIssueManager
  
  var availableLangs: Seq[Lang] = Lang.availables
  var plmLogger: PLMLogger = new PLMLogger(this)
  
  var progLangSpy: ProgLangListener  = null
  var humanLangSpy: HumanLangListener = null
  
  var currentUser: User = null
  
  var currentPreferredLang: Lang = preferredLang.getOrElse(Lang("en"))
  
  var currentGitID: String = null
  setCurrentGitID(gitID, newUser)
  
  var currentTrackUser: Boolean = trackUser.getOrElse(false)
  
  var properties: Properties = new Properties
  properties.setProperty("webplm.version", Play.configuration.getString("application.version").get)
  properties.setProperty("webplm.user-agent", userAgent)
  
  var plm: PLM = new PLM(executionManager, properties, currentGitID, plmLogger, currentPreferredLang.toLocale, lastProgLang, currentTrackUser)
  
  var userIdle: Boolean = false;
  var idleStart: Instant = null
  var idleEnd: Instant = null
  
  initExecutionManager
  initSpies
  registerActor
  
  def receive = {
    case msg: JsValue =>
      Logger.debug("Message received:")
      Logger.debug(msg.toString)
      var cmd: Option[String] = (msg \ "cmd").asOpt[String]
      cmd.getOrElse(None) match {
        case "signIn" | "signUp" =>
          setCurrentUser((msg \ "user").asOpt[User].get)
          plm.setUserUUID(currentGitID)
          currentTrackUser = currentUser.trackUser.getOrElse(false)
          plm.setTrackUser(currentTrackUser)
          currentUser.preferredLang.getOrElse(None) match {
            case newLang: Lang =>
              currentPreferredLang = newLang
              plm.setLang(currentPreferredLang)
            case _ =>
              savePreferredLang()
          }
          plm.setProgrammingLanguage(currentUser.lastProgLang.getOrElse("Java"))
        case "signOut" =>
          clearCurrentUser()
          plm.setUserUUID(currentGitID)
          currentTrackUser = false
          plm.setTrackUser(currentTrackUser)
        case "getLessons" =>
          sendMessage("lessons", Json.obj(
            "lessons" -> LessonToJson.lessonsWrite(plm.lessons)
          ))
        case "setProgrammingLanguage" =>
          var optProgrammingLanguage: Option[String] = (msg \ "args" \ "programmingLanguage").asOpt[String]
          (optProgrammingLanguage.getOrElse(None)) match {
            case programmingLanguage: String =>
              plm.setProgrammingLanguage(programmingLanguage)
              saveLastProgLang(programmingLanguage)
            case _ =>
              logNonValidJSON("setProgrammingLanguage: non-correct JSON", msg)
          }
        case "setLang" =>
          var optLang: Option[String] =  (msg \ "args" \ "lang").asOpt[String]
          (optLang.getOrElse(None)) match {
            case lang: String =>
              currentPreferredLang = Lang(lang)
              plm.setLang(currentPreferredLang)
              savePreferredLang()
            case _ =>
              logNonValidJSON("setLang: non-correct JSON", msg)
          }
        case "getExercise" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          var lecture: Lecture = null;
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String) =>
              lecture = plm.switchExercise(lessonID, exerciseID)
            case (lessonID:String, _) =>
              lecture = plm.switchLesson(lessonID)
            case (_, _) =>
              logNonValidJSON("getExercise: non-correct JSON", msg)
          }
          if(lecture != null) {
            sendMessage("exercise", Json.obj(
              "exercise" -> LectureToJson.lectureWrites(lecture, plm.programmingLanguage, plm.getStudentCode, plm.getInitialWorlds, plm.getAnswerWorlds, plm.getSelectedWorldID)
            ))
          }
        case "runExercise" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          var optCode: Option[String] = (msg \ "args" \ "code").asOpt[String]
          var optWorkspace: Option[String] = (msg \ "args" \ "workspace").asOpt[String]
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None), optCode.getOrElse(None), optWorkspace.getOrElse(None)) match {
        	  case (lessonID: String, exerciseID: String, code: String, workspace: String) =>
        		  plm.runExercise(lessonID, exerciseID, code, workspace)
            case (lessonID:String, exerciseID: String, code: String, _) =>
              plm.runExercise(lessonID, exerciseID, code, null)
            case (_, _, _, _) =>
              logNonValidJSON("runExercise: non-correctJSON", msg)
          }
        case "stopExecution" =>
          plm.stopExecution
        case "revertExercise" =>
          var lecture = plm.revertExercise
          sendMessage("exercise", Json.obj(
              "exercise" -> LectureToJson.lectureWrites(lecture, plm.programmingLanguage, plm.getStudentCode, plm.getInitialWorlds, plm.getAnswerWorlds, plm.getSelectedWorldID)
          ))
        case "getExercises" =>
          if(plm.currentExercise != null) {
            var lectures = plm.game.getCurrentLesson.getRootLectures.toArray(Array[Lecture]())
            sendMessage("exercises", Json.obj(
              "exercises" -> ExerciseToJson.exercisesWrite(lectures) 
            ))
          }
        case "getLastCommit" =>
          getCommitId(msg, "commitId")
        case "loadContent" => 
          getCommitId(msg, "loadContent")
        case "getLangs" =>
          sendMessage("langs", Json.obj(
            "selected" -> LangToJson.langWrite(currentPreferredLang),
            "availables" -> LangToJson.langsWrite(availableLangs)
          ))
        case "updateUser" =>
          var optFirstName: Option[String] = (msg \ "args" \ "firstName").asOpt[String]
          var optLastName: Option[String] = (msg \ "args" \ "lastName").asOpt[String]
          var optTrackUser: Option[Boolean] = (msg \ "args" \ "trackUser").asOpt[Boolean]
          (optFirstName.getOrElse(None), optFirstName.getOrElse(None)) match {
            case (firstName:String, lastName: String) =>
              currentUser = currentUser.copy(
                  firstName = optFirstName,
                  lastName = optLastName,
                  trackUser = optTrackUser
              )
              UserDAORestImpl.update(currentUser)
              sendMessage("userUpdated", Json.obj())
             (optTrackUser.getOrElse(None)) match {
                case trackUser: Boolean =>
                  plm.setTrackUser(currentTrackUser)
                case _ =>
                  logNonValidJSON("setTrackUser: non-correct JSON", msg)
              }
            case _ =>
              logNonValidJSON("updateUser: non-correct JSON", msg)
          }
        case "userIdle" =>
          setUserIdle
        case "userBack" =>
          clearUserIdle
        case "setTrackUser" =>
          var optTrackUser: Option[Boolean] = (msg \ "args" \ "trackUser").asOpt[Boolean]
          (optTrackUser.getOrElse(None)) match {
            case trackUser: Boolean =>
              currentTrackUser = trackUser
              saveTrackUser(currentTrackUser)
              plm.setTrackUser(currentTrackUser)              
            case _ =>
              logNonValidJSON("setTrackUser: non-correct JSON", msg)
          }
        case "submitBugReport" =>
          var optTitle: Option[String] = (msg \ "args" \ "title").asOpt[String]
          var optBody: Option[String] = (msg \ "args" \ "body").asOpt[String]
          (optTitle.getOrElse(None), optBody.getOrElse(None)) match {
            case (title: String, body: String) =>
              gitHubIssueManager.isCorrect(title, body).getOrElse(None) match {
                case errorMsg: String =>
                  sendMessage("incorrectIssue", Json.obj("msg" -> errorMsg))
                case None =>
                  gitHubIssueManager.postIssue(title, body).getOrElse(None) match {
                    case issueUrl: String =>
                      sendMessage("issueCreated", Json.obj("url" -> issueUrl))
                    case None =>
                      Logger.error("Error while uploading issue...")
                      sendMessage("issueErrored", Json.obj())
                  }
              }
            case (_, _) =>
              logNonValidJSON("submitBugReport: non-correct JSON", msg)
          }
        case "commonErrorFeedback" =>
          var optCommonErrorID: Option[Int] = (msg \ "args" \ "commonErrorID").asOpt[Int]
          var optAccuracy: Option[Int] = (msg \ "args" \ "accuracy").asOpt[Int]
          var optHelp: Option[Int] = (msg \ "args" \ "help").asOpt[Int]
          var optComment: Option[String] = (msg \ "args" \ "comment").asOpt[String]
          (optCommonErrorID.getOrElse(None), optAccuracy.getOrElse(None), optHelp.getOrElse(None), optComment.getOrElse(None)) match  {
            case (commonErrorID: Int, accuracy: Int, help: Int, comment: String) =>
              plm.signalCommonErrorFeedback(commonErrorID, accuracy, help, comment)
            case _ =>
              logNonValidJSON("commonErrorFeedback: non-correct JSON", msg)
          }
        case "readTip" =>
          var optTipID: Option[String] = (msg \ "args" \ "tipID").asOpt[String]
         optTipID.getOrElse(None) match {
            case tipID: String =>
              plm.signalReadTip(tipID)
            case _ =>
              logNonValidJSON("readTip: non-correct JSON", msg)
          } 
        case "ping" =>
          // Do nothing
        case _ =>
          logNonValidJSON("cmd: non-correct JSON", msg)
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
  
  def setCurrentUser(newUser: User) {
    currentUser = newUser
    sendMessage("user", Json.obj(
        "user" -> currentUser
      )
    )
    
    setCurrentGitID(currentUser.gitID.toString, false)
  }
  
  def clearCurrentUser() {
    currentUser = null
    sendMessage("user", Json.obj())
    
    currentGitID = UUID.randomUUID.toString
    setCurrentGitID(currentGitID, true)
  }
  
  def setCurrentGitID(newGitID: String, toSend: Boolean) {
    currentGitID = newGitID;
    if(toSend) {
      sendMessage("gitID", Json.obj(
          "gitID" -> currentGitID  
        )
      )
    }
  } 

  def getCommitId(msg: JsValue, response: String) {
    var optExerciseID : Option[String]  = (msg \ "args" \ "exerciseID").asOpt[String]
          var optLanguage : Option[String]  = (msg \ "args" \ "language").asOpt[String]
          var filename: String = null
          (optExerciseID.getOrElse(None), optLanguage.getOrElse(None)) match {
            case (exerciseID: String, language: String) =>
              filename = exerciseID + "." + language + ".code"
              sendMessage(response, Json.obj("id" -> plm.getLastCommitId(exerciseID, language)))
          }
  }
  
  def initExecutionManager() {
    executionManager.setPLMActor(this)
    executionManager.setGame(plm.game)
  }
  
  def initSpies() {
    progLangSpy = new ProgLangListener(this, plm)
    plm.game.addProgLangListener(progLangSpy, true)
    
    humanLangSpy = new HumanLangListener(this, plm)
    plm.game.addHumanLangListener(humanLangSpy, true)
  }

  def registerActor() {
    ActorsMap.add(actorUUID, self)
    sendMessage("actorUUID", Json.obj(
        "actorUUID" -> actorUUID  
      )
    )
  }

  def saveLastProgLang(programmingLanguage: String) {
    if(currentUser != null) {
      currentUser = currentUser.copy(
          lastProgLang = Some(programmingLanguage)
      )
      UserDAORestImpl.update(currentUser)
    }
  }

  def savePreferredLang() {
    if(currentUser != null) {
      currentUser = currentUser.copy(
          preferredLang = Some(currentPreferredLang)
      )
      UserDAORestImpl.update(currentUser)
    }
  }

  def setUserIdle() {
    userIdle = true
    idleStart = Instant.apply
  }

  def clearUserIdle() {
    userIdle = false
    idleEnd = Instant.apply
    if(idleStart != null) {
      var duration = Duration.between(idleStart, idleEnd)
      plm.signalIdle(idleStart.toString, idleEnd.toString, duration.toString)
    }
    else {
      Logger.error("receive 'userBack' but not previous 'userIdle'")
    }
    idleStart = null
    idleEnd = null
  }

  def saveTrackUser(trackUser: Boolean) {
    if(currentUser != null) {
      currentUser = currentUser.copy(
          trackUser = Some(trackUser)
      )
      UserDAORestImpl.update(currentUser)
    }
  }
  
  def logNonValidJSON(label: String, msg: JsValue) {
    Logger.error(label)
    Logger.error(msg.toString)
  }

  override def postStop() = {
    Logger.info("postStop: websocket closed - removing the spies")
    if(userIdle) {
      clearUserIdle
    }
    ActorsMap.remove(actorUUID)
    plm.quit(progLangSpy, humanLangSpy)
  }
}
