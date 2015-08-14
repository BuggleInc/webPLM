package actors

import akka.actor._
import play.api.libs.json._
import play.api.mvc.RequestHeader
import json._
import models.GitHubIssueManager
import models.PLM
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
  def props(userAgent: String, actorUUID: String, gitID: String, newUser: Boolean, preferredLang: Option[Lang], lastProgLang: Option[String], trackUser: Option[Boolean])(out: ActorRef) = Props(new PLMActor(userAgent, actorUUID, gitID, newUser, preferredLang, lastProgLang, trackUser, out))
  def propsWithUser(userAgent: String, actorUUID: String, user: User)(out: ActorRef) = Props(new PLMActor(userAgent, actorUUID, user, out))
}

class PLMActor(userAgent: String, actorUUID: String, gitID: String, newUser: Boolean, preferredLang: Option[Lang], lastProgLang: Option[String], trackUser: Option[Boolean], out: ActorRef) extends Actor {  
  var gitHubIssueManager: GitHubIssueManager = new GitHubIssueManager
  
  var availableLangs: Seq[Lang] = Lang.availables
  var plmLogger: PLMLogger = new PLMLogger(this)
  
  var resultSpy: ExecutionResultListener = null
  var progLangSpy: ProgLangListener  = null
  var humanLangSpy: HumanLangListener = null
  var registeredSpies: List[ExecutionSpy] = null
  
  var currentUser: User = null
  
  var currentPreferredLang: Lang = preferredLang.getOrElse(Lang("en"))
  
  var currentGitID: String = null
  setCurrentGitID(gitID, newUser)
  
  var currentTrackUser: Boolean = trackUser.getOrElse(false)
  
  var properties: Properties = new Properties
  properties.setProperty("webplm.version", Play.configuration.getString("application.version").get)
  properties.setProperty("webplm.user-agent", userAgent)
  
  var plm: PLM = new PLM(properties, currentGitID, plmLogger, currentPreferredLang.toLocale, lastProgLang, currentTrackUser)
  
  var userIdle: Boolean = false;
  var idleStart: Instant = null
  var idleEnd: Instant = null
  
  initSpies
  registerActor
  
  def this(userAgent: String, actorUUID: String, user: User, out: ActorRef) {
    this(userAgent, actorUUID, user.gitID.toString, false, user.preferredLang, user.lastProgLang, user.trackUser, out)
    setCurrentUser(user)
  }
  
  def receive = {
    case msg: JsValue =>
      Logger.debug("Received a message")
      Logger.debug(msg.toString())
      var cmd: Option[String] = (msg \ "cmd").asOpt[String]
      cmd.getOrElse(None) match {
        case "signIn" | "signUp" =>
          setCurrentUser((msg \ "user").asOpt[User].get)
          registeredSpies.foreach { spy => spy.unregister }
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
          registeredSpies.foreach { spy => spy.unregister }
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
              Logger.debug("setProgrammingLanguage: non-correct JSON")
          }
        case "setLang" =>
          var optLang: Option[String] =  (msg \ "args" \ "lang").asOpt[String]
          (optLang.getOrElse(None)) match {
            case lang: String =>
              currentPreferredLang = Lang(lang)
              plm.setLang(currentPreferredLang)
              savePreferredLang()
            case _ =>
              Logger.debug("setLang: non-correct JSON")
          }
        case "getExercise" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          var lecture: Lecture = null;
          var executionSpy: ExecutionSpy = new ExecutionSpy(this, "operations")
          var demoExecutionSpy: ExecutionSpy = new ExecutionSpy(this, "demoOperations")
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String) =>
              lecture = plm.switchExercise(lessonID, exerciseID, executionSpy, demoExecutionSpy)
            case (lessonID:String, _) =>
              lecture = plm.switchLesson(lessonID, executionSpy, demoExecutionSpy)
            case (_, _) =>
              Logger.debug("getExercise: non-correct JSON")
          }
          if(lecture != null) {
            sendMessage("exercise", Json.obj(
              "exercise" -> LectureToJson.lectureWrites(lecture, plm.programmingLanguage, plm.getStudentCode, plm.getInitialWorlds, plm.getSelectedWorldID)
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
              Logger.debug("runExercise: non-correctJSON")
          }
        case "runDemo" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String) =>
              plm.runDemo(lessonID, exerciseID)
            case (_, _) =>
              Logger.debug("runDemo: non-correctJSON")
          }
        case "stopExecution" =>
          plm.stopExecution
        case "revertExercise" =>
          var lecture = plm.revertExercise
          sendMessage("exercise", Json.obj(
              "exercise" -> LectureToJson.lectureWrites(lecture, plm.programmingLanguage, plm.getStudentCode, plm.getInitialWorlds, plm.getSelectedWorldID)
          ))
        case "getExercises" =>
          if(plm.currentExercise != null) {
            var lectures = plm.game.getCurrentLesson.getRootLectures.toArray(Array[Lecture]())
            sendMessage("exercises", Json.obj(
              "exercises" -> ExerciseToJson.exercisesWrite(lectures) 
            ))
          }
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
                  Logger.debug("setTrackUser: non-correct JSON")
              }
            case _ =>
              Logger.debug("updateUser: non-correct JSON")
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
              Logger.debug("setTrackUser: non-correct JSON")
          }
        case "submitBugReport" =>
          var optTitle: Option[String] = (msg \ "args" \ "title").asOpt[String]
          var optBody: Option[String] = (msg \ "args" \ "body").asOpt[String]
          (optTitle.getOrElse(None), optBody.getOrElse(None)) match {
            case (title: String, body: String) =>
              gitHubIssueManager.isCorrect(title, body).getOrElse(None) match {
                case errorMsg: String =>
                  Logger.debug("Try to post incorrect issue...")
                  Logger.debug("Title: "+title+", body: "+body)
                  sendMessage("incorrectIssue", Json.obj("msg" -> errorMsg))
                case None =>
                  gitHubIssueManager.postIssue(title, body).getOrElse(None) match {
                    case issueUrl: String =>
                      Logger.debug("Issue created at: "+ issueUrl)
                      sendMessage("issueCreated", Json.obj("url" -> issueUrl))
                    case None =>
                      Logger.debug("Error while uploading issue...")
                      sendMessage("issueErrored", Json.obj())
                  }
              }
            case (_, _) =>
              Logger.debug("submitBugReport: non-correct JSON")
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
              Logger.debug("commonErrorFeedback: non-correct JSON")
          }
        case _ =>
          Logger.debug("cmd: non-correct JSON")
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
  
  def initSpies() {
    resultSpy = new ExecutionResultListener(this, plm.game)
    plm.game.addGameStateListener(resultSpy)
    
    progLangSpy = new ProgLangListener(this, plm)
    plm.game.addProgLangListener(progLangSpy, true)
    
    humanLangSpy = new HumanLangListener(this, plm)
    plm.game.addHumanLangListener(humanLangSpy, true)
    
    registeredSpies = List()
  }
  
  def registerActor() {
    ActorsMap.add(actorUUID, self)
    sendMessage("actorUUID", Json.obj(
        "actorUUID" -> actorUUID  
      )
    )
  }
  
  def registerSpy(spy: ExecutionSpy) {
    registeredSpies = registeredSpies ::: List(spy)
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
    Logger.debug("start idling at: "+ idleStart)      
  }
  
  def clearUserIdle() {
    userIdle = false
    idleEnd = Instant.apply
    if(idleStart != null) {
      var duration = Duration.between(idleStart, idleEnd)
      Logger.debug("end idling at: "+ idleEnd)
      Logger.debug("duration: " + duration)
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
  
  def signalEndOfExec() {
    registeredSpies.foreach { spy => spy.sendOperations }
  }
  
  override def postStop() = {
    Logger.debug("postStop: websocket closed - removing the spies")
    if(userIdle) {
      clearUserIdle
    }
    ActorsMap.remove(actorUUID)
    plm.game.removeGameStateListener(resultSpy)
    plm.game.removeProgLangListener(progLangSpy)
    plm.game.removeHumanLangListener(humanLangSpy)
    registeredSpies.foreach { spy => spy.unregister }
    plm.game.quit
  }
}