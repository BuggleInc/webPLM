package actors

import java.util.{ Locale, Properties, UUID }
import scala.concurrent.Future
import akka.actor._
import akka.pattern.{ ask, pipe }
import akka.util.Timeout
import scala.concurrent.duration._
import codes.reactive.scalatime.{ Duration, Instant }
import json._
import log.PLMLogger
import models.GitHubIssueManager
import models.User
import models.daos.UserDAORestImpl
import models.execution.ExecutionManager
import models.lesson.Lecture
import play.api.Logger
import play.api.Play
import play.api.Play.current
import play.api.i18n.Lang
import play.api.libs.json._
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.Exercise
import scala.concurrent.ExecutionContext.Implicits.global
import scala.language.postfixOps
import LessonsActor._
import ExercisesActor._
import ExecutionActor._
import GitActor._
import SessionActor._
import models.lesson.Lesson
import play.api.libs.functional.syntax._
import plm.core.model.lesson.ExecutionProgress
import org.xnap.commons.i18n.{ I18n, I18nFactory }
import models.ProgrammingLanguages

object PLMActor {
  def props(pushActor: ActorRef, executionManager: ExecutionManager, userAgent: String, actorUUID: String, gitID: String, newUser: Boolean, preferredLang: Option[Lang], lastProgLang: Option[String], trackUser: Option[Boolean])(out: ActorRef) = Props(new PLMActor(pushActor, executionManager, userAgent, actorUUID, gitID, newUser, preferredLang, lastProgLang, trackUser, out))
  def propsWithUser(pushActor: ActorRef, executionManager: ExecutionManager, userAgent: String, actorUUID: String, user: User)(out: ActorRef) = props(pushActor, executionManager, userAgent, actorUUID, user.gitID, false, user.preferredLang, user.lastProgLang, user.trackUser)(out)
}

class PLMActor (
    pushActor: ActorRef,
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

  implicit val timeout = Timeout(5 seconds)

  val lessonsActor: ActorRef = context.actorOf(LessonsActor.props)
  val exercisesActor: ActorRef = context.actorOf(ExercisesActor.props)
  val executionActor: ActorRef = context.actorOf(ExecutionActor.props)
  val gitActor: ActorRef = context.actorOf(GitActor.props(pushActor, "dummy", userAgent))
  val sessionActor: ActorRef = context.actorOf(SessionActor.props(gitActor, ProgrammingLanguages.programmingLanguages))

  val i18n: I18n = I18nFactory.getI18n(getClass(),"org.plm.i18n.Messages", new Locale("en"), I18nFactory.FALLBACK)

  var gitHubIssueManager: GitHubIssueManager = new GitHubIssueManager

  var availableLangs: Seq[Lang] = Lang.availables

  var optCurrentExercise: Option[Exercise] = None
  var currentUser: User = null
  var currentProgLang: ProgrammingLanguage = initProgLang(lastProgLang)
  var currentPreferredLang: Lang = preferredLang.getOrElse(Lang("en"))

  var currentGitID: String = null
  setCurrentGitID(gitID, newUser)

  var currentTrackUser: Boolean = trackUser.getOrElse(false)

  var userIdle: Boolean = false;
  var idleStart: Instant = null
  var idleEnd: Instant = null

  registerActor

  def receive = {
    case msg: JsValue =>
      Logger.debug("Received a message")
      Logger.debug(msg.toString())
      val cmd: Option[String] = (msg \ "cmd").asOpt[String]
      cmd.getOrElse(None) match {
        case "signIn" | "signUp" =>
          setCurrentUser((msg \ "user").asOpt[User].get)
          currentTrackUser = currentUser.trackUser.getOrElse(false)
          currentUser.preferredLang match {
            case Some(newLang: Lang) =>
              currentPreferredLang = newLang
              // FIXME: Re-implement me
              // plm.setLang(currentPreferredLang)
            case _ =>
              savePreferredLang()
          }
          // FIXME: Re-implement me
          // plm.setProgrammingLanguage(currentUser.lastProgLang.getOrElse("Java"))
        case "signOut" =>
          clearCurrentUser()
          // FIXME: Re-implement me
          // plm.setUserUUID(currentGitID)
          currentTrackUser = false
          // FIXME: Re-implement me
          // plm.setTrackUser(currentTrackUser)
        case "getLessons" =>
          (lessonsActor ? GetLessonsList).mapTo[Array[Lesson]].map { lessons =>
            val jsonLessons: JsArray = Lesson.arrayToJSON(lessons, currentPreferredLang)
            sendMessage("lessons", Json.obj(
              "lessons" -> jsonLessons
            ))
          }
        case "getExercisesList" =>
          val optLessonName: Option[String] = (msg \ "args" \ "lessonName").asOpt[String]
          optLessonName match {
            case Some(lessonName: String) =>
              (lessonsActor ? GetExercisesList(lessonName)).mapTo[Array[Lecture]].map { lectures =>
                sendMessage("lectures", Json.obj(
                  "lectures" -> lectures
                ))
              }
            case _ =>
              Logger.debug("getExercisesList: non-correct JSON")
          }
        case "setProgrammingLanguage" =>
          val optProgrammingLanguage: Option[String] = (msg \ "args" \ "programmingLanguage").asOpt[String]
          optProgrammingLanguage match {
            case Some(programmingLanguage: String) =>
              currentProgLang = ProgrammingLanguages.getProgrammingLanguage(programmingLanguage)
              // FIXME: Re-implement me
              // plm.setProgrammingLanguage(programmingLanguage)

              saveLastProgLang(programmingLanguage)
            case _ =>
              logNonValidJSON("setProgrammingLanguage: non-correct JSON", msg)
          }
        case "setLang" =>
          var optLang: Option[String] =  (msg \ "args" \ "lang").asOpt[String]
          optLang match {
            case Some(lang: String) =>
              currentPreferredLang = Lang(lang)
              // FIXME: Re-implement me
              // plm.setLang(currentPreferredLang)
              savePreferredLang()
            case _ =>
              logNonValidJSON("setLang: non-correct JSON", msg)
          }
        case "getExercise" =>
          (exercisesActor ? GetExercise("Environment")).mapTo[Exercise].map { exercise =>
            gitActor ! SwitchExercise(exercise, optCurrentExercise)

            optCurrentExercise = Some(exercise)
            (sessionActor ? RetrieveCode(exercise, currentProgLang)).mapTo[String].map { code =>
              val json: JsObject = ExerciseToJson.exerciseWrites(exercise, currentProgLang, code, currentPreferredLang.toLocale)
              sendMessage("exercise", Json.obj(
                "exercise" -> json
              ))
            }
          }
        case "runExercise" =>
          val exercise: Exercise = optCurrentExercise.get
          val optCode: Option[String] = (msg \ "args" \ "code").asOpt[String]
          optCode match {
            case Some(code: String) =>
              (executionActor ? StartExecution(out, exercise, currentProgLang, code)).mapTo[ExecutionProgress].map { executionResult =>
                gitActor ! Executed(exercise, executionResult, code, currentPreferredLang.language)

                val msgType: Int = if (executionResult.outcome == ExecutionProgress.outcomeKind.PASS) 1 else 0
                val commonErrorID: Int = executionResult.commonErrorID
                val commonErrorText: String = executionResult.commonErrorText
                val msg: String = executionResult.getMsg(i18n)

                val mapArgs: JsValue = Json.obj(
                  "msgType" -> msgType,
                  "msg" -> msg,
                  "commonErrorID" -> commonErrorID,
                  "commonErrorText" -> commonErrorText
                )

                sendMessage("executionResult", mapArgs)
              }
            case _ =>
              Logger.debug("runExercise: non-correctJSON")
          }
        case "stopExecution" =>
          // FIXME: Re-implement me
          // plm.stopExecution
        case "revertExercise" =>
          // FIXME: Re-implement me
          optCurrentExercise match {
            case Some(currentExercise: Exercise) =>
              currentExercise.getDefaultSourceFile(currentProgLang).getBody
          }
          /*
          var lecture = plm.revertExercise
          sendMessage("exercise", Json.obj(
              "exercise" -> LectureToJson.lectureWrites(lecture, plm.programmingLanguage, plm.getStudentCode, plm.getInitialWorlds, plm.getAnswerWorlds, plm.getSelectedWorldID)
          ))
          */
        case "getLangs" =>
          sendMessage("langs", Json.obj(
            "selected" -> LangToJson.langWrite(currentPreferredLang),
            "availables" -> LangToJson.langsWrite(availableLangs)
          ))
        case "updateUser" =>
          var optFirstName: Option[String] = (msg \ "args" \ "firstName").asOpt[String]
          var optLastName: Option[String] = (msg \ "args" \ "lastName").asOpt[String]
          var optTrackUser: Option[Boolean] = (msg \ "args" \ "trackUser").asOpt[Boolean]
          (optFirstName, optFirstName) match {
            case (Some(firstName:String), Some(lastName: String)) =>
              currentUser = currentUser.copy(
                  firstName = optFirstName,
                  lastName = optLastName,
                  trackUser = optTrackUser
              )
              UserDAORestImpl.update(currentUser)
              sendMessage("userUpdated", Json.obj())
              optTrackUser match {
                case Some(trackUser: Boolean) =>
                  // FIXME: Re-implement me
                  // plm.setTrackUser(currentTrackUser)
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
          optTrackUser match {
            case Some(trackUser: Boolean) =>
              currentTrackUser = trackUser
              saveTrackUser(currentTrackUser)
              // FIXME: Re-implement me
              // plm.setTrackUser(currentTrackUser)
            case _ =>
              logNonValidJSON("setTrackUser: non-correct JSON", msg)
          }
        case "submitBugReport" =>
          var optTitle: Option[String] = (msg \ "args" \ "title").asOpt[String]
          var optBody: Option[String] = (msg \ "args" \ "body").asOpt[String]
          (optTitle, optBody) match {
            case (Some(title: String), Some(body: String)) =>
              gitHubIssueManager.isCorrect(title, body) match {
                case Some(errorMsg: String) =>
                  Logger.debug("Try to post incorrect issue...")
                  Logger.debug("Title: "+title+", body: "+body)
                  sendMessage("incorrectIssue", Json.obj("msg" -> errorMsg))
                case None =>
                  gitHubIssueManager.postIssue(title, body) match {
                    case Some(issueUrl: String) =>
                      Logger.debug("Issue created at: "+ issueUrl)
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
          (optCommonErrorID, optAccuracy, optHelp, optComment) match  {
            case (Some(commonErrorID: Int), Some(accuracy: Int), Some(help: Int), Some(comment: String)) =>
              // FIXME: Re-implement me
              // plm.signalCommonErrorFeedback(commonErrorID, accuracy, help, comment)
            case _ =>
              logNonValidJSON("commonErrorFeedback: non-correct JSON", msg)
          }
        case "readTip" =>
          var optTipID: Option[String] = (msg \ "args" \ "tipID").asOpt[String]
          optTipID match {
            case Some(tipID: String) =>
              // FIXME: Re-implement me
              // plm.signalReadTip(tipID)
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
      Logger.debug("end idling at: "+ idleEnd)
      Logger.debug("duration: " + duration)
      // FIXME: Re-implement me
      // plm.signalIdle(idleStart.toString, idleEnd.toString, duration.toString)
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

  def initProgLang(lastProgLang: Option[String]): ProgrammingLanguage = {
    lastProgLang match {
    case Some(progLang: String) =>
      return ProgrammingLanguages.getProgrammingLanguage(progLang)
    case _ =>
      ProgrammingLanguages.defaultProgrammingLanguage
    }
  }

  override def postStop() = {
    Logger.info("postStop: websocket closed - removing the spies")
    if(userIdle) {
      clearUserIdle
    }
    ActorsMap.remove(actorUUID)
  }
}
