package actors

import java.util.{HashMap, Locale, Map, UUID}

import scala.concurrent.{Await, Future, TimeoutException}
import akka.actor._
import akka.pattern.ask
import akka.util.Timeout

import scala.concurrent.duration._
import codes.reactive.scalatime.{Duration, Instant}
import json.{LangToJson, ProgrammingLanguageToJson}
import models.GitHubIssueManager
import models.User
import models.daos.UserDAORestImpl
import models.lesson.{Lecture, Lessons}
import play.api.Logger
import play.api.Play.current
import play.api.i18n.Lang
import play.api.libs.json._
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.Exercise.WorldKind

import scala.concurrent.ExecutionContext.Implicits.global
import scala.language.postfixOps
import ExercisesActor._
import execution.ExecutionActor._
import GitActor._
import SessionActor._
import models.lesson.Lesson
import plm.core.model.lesson.ExecutionProgress
import models.ProgrammingLanguages
import plm.universe.World
import akka.pattern.AskTimeoutException
import plm.core.model.json.JSONUtils
import plm.core.model.lesson.UserSettings
import plm.core.model.tracking.GitUtils

object PLMActor {
  def props(pushActor: ActorRef, executionActor: ActorRef, userAgent: String, actorUUID: String, gitID: String, newUser: Boolean, preferredLang: Option[Lang], lastProgLang: Option[String], trackUser: Option[Boolean])(out: ActorRef) = Props(new PLMActor(pushActor, executionActor, userAgent, actorUUID, gitID, newUser, preferredLang, lastProgLang, trackUser, out))
  def propsWithUser(pushActor: ActorRef, executionActor: ActorRef, userAgent: String, actorUUID: String, user: User)(out: ActorRef) = Props(new PLMActor(pushActor, executionActor, userAgent, actorUUID, user, out))
}

class PLMActor (
    pushActor: ActorRef,
    executionActor: ActorRef,
    userAgent: String,
    actorUUID: String,
    gitID: String,
    newUser: Boolean,
    preferredLang: Option[Lang],
    lastProgLang: Option[String],
    trackUser: Option[Boolean],
    out: ActorRef)
  extends Actor {

  def this(pushActor: ActorRef, executionActor: ActorRef, userAgent: String, actorUUID: String, user: User, out: ActorRef) {
    this(pushActor, executionActor, userAgent, actorUUID, user.gitID.toString, false, user.preferredLang, user.lastProgLang, user.trackUser, out)
    setCurrentUser(user)
  }

  implicit val timeout = Timeout(5 seconds)

  var optCurrentLesson: Option[String] = None
  var optCurrentExercise: Option[Exercise] = None
  var optCurrentUser: Option[User] = None
  var currentProgLang: ProgrammingLanguage = initProgLang(lastProgLang)
  var currentHumanLang: Lang = initHumanLang(preferredLang)

  val exercisesActor: ActorRef = context.actorOf(ExercisesActor.props)

  val gitActor: ActorRef = context.actorOf(GitActor.props(pushActor, gitID, None, userAgent))
  val sessionActor: ActorRef = context.actorOf(SessionActor.props(gitActor, ProgrammingLanguages.programmingLanguages))

  val locale: Locale = currentHumanLang.toLocale

  val userSettings: UserSettings = new UserSettings(currentHumanLang.toLocale, currentProgLang)

  val gitHubIssueManager: GitHubIssueManager = new GitHubIssueManager

  val availableLangs: Seq[Lang] = Lang.availables

  val lessons = new Lessons(Logger.logger, availableLangs.map(_.code))

  sendReady
  sendProgLangs
  sendHumanLangs

  var currentGitID: String = ""
  setCurrentGitID(gitID, newUser)

  var optIdle: Option[Instant] = None

  registerActor

  def receive = {
    case msg: JsValue =>
      Logger.debug("Received a message")
      Logger.debug(msg.toString())
      val cmd: Option[String] = (msg \ "cmd").asOpt[String]
      cmd.getOrElse(None) match {
        case "signIn" | "signUp" =>
          val currentUser: User = (msg \ "user").asOpt[User].get
          setCurrentUser(currentUser)
          sessionActor ! UserChanged
          gitActor ! SwitchUser(currentUser.gitID, currentUser.trackUser)
          currentUser.preferredLang match {
            case Some(newLang: Lang) =>
              updateHumanLang(newLang.code)
            case _ =>
              savePreferredLang
          }
          currentUser.lastProgLang match {
          case Some(progLang: String) =>
            updateProgLang(progLang)
          case _ =>
            saveLastProgLang
          }
        case "signOut" =>
          clearCurrentUser
          sessionActor ! UserChanged
          gitActor ! SwitchUser(currentGitID, None)
        case "getLessons" =>
          val jsonLessons: JsArray =
            Lesson.arrayToJson(lessons.lessonsList, currentHumanLang)
          sendMessage("lessons", Json.obj(
            "lessons" -> jsonLessons
          ))
        case "getExercisesList" =>
          val optLessonName: Option[String] = (msg \ "args" \ "lessonName").asOpt[String]
          optLessonName match {
            case Some(lessonName: String) =>
              val jsonLectures: JsArray =
                Lecture.arrayToJson(
                  sessionActor,
                  lessons.exercisesList(lessonName),
                  currentHumanLang,
                  currentProgLang)
              sendMessage("lectures", Json.obj(
                "lectures" -> jsonLectures
              ))
            case _ =>
              Logger.debug("getExercisesList: non-correct JSON")
          }
        case "setProgLang" =>
          val optProgLang: Option[String] = (msg \ "args" \ "progLang").asOpt[String]
          optProgLang match {
            case Some(progLang: String) =>
              updateProgLang(progLang)
              saveLastProgLang
            case _ =>
              logNonValidJSON("setProgrammingLanguage: non-correct JSON", msg)
          }
        case "setHumanLang" =>
          val optLang: Option[String] =  (msg \ "args" \ "lang").asOpt[String]
          optLang match {
            case Some(lang: String) =>
              updateHumanLang(lang)
              executionActor ! UpdateLang(currentHumanLang)
              savePreferredLang
            case _ =>
              logNonValidJSON("setLang: non-correct JSON", msg)
          }
        case "getExercise" =>
          val optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          val optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]

          optLessonID match {
          case Some(lessonID: String) =>
            if(lessons.lessonExists(lessonID)) {
              optExerciseID match {
                case Some(exerciseID: String) =>
                  if(lessons.exerciseExists(lessonID, exerciseID)) {
                    switchExercise(lessonID, exerciseID)
                  } else {
                    sendMessage("exerciseNotFound", Json.obj())
                  }
                case _ =>
                  switchExercise(lessonID, lessons.firstExerciseId(lessonID))
              }
            } else {
              Logger.debug("getExercise: tried to access not known lesson")
              sendMessage("lessonNotFound", Json.obj())
            }
          case _ =>
            Logger.debug("getExercise: non-correctJSON")
            sendMessage("lessonNotFound", Json.obj())
          }
        case "runExercise" =>
          val exercise: Exercise = optCurrentExercise.get
          val optCode: Option[String] = (msg \ "args" \ "code").asOpt[String]
          val optVisualCode: Option[String] = (msg \ "args" \ "workspace").asOpt[String]
          optCode match {
            case Some(code: String) =>
              implicit val timeout = Timeout(15 seconds)
              (executionActor ? StartExecution(out, exercise, currentProgLang, code)).mapTo[ExecutionProgress].map { executionResult =>
                handleExecutionResult(exercise, code, optVisualCode, executionResult)
              } onFailure {
                case timeout: AskTimeoutException =>
                  Logger.error("PLMActor: executionActor ? StartExecution timeout")
                  // Need to generate a special executionResult
                  val executionResult: ExecutionProgress = new ExecutionProgress(currentProgLang, locale)
                  executionResult.setTimeoutError
                  handleExecutionResult(exercise, code, optVisualCode, executionResult)
                case t: Throwable =>
                  t.printStackTrace
              }
            case _ =>
              Logger.debug("runExercise: non-correctJSON")
          }
        case "stopExecution" =>
          executionActor ! StopExecution
        case "runDemo" =>
          optCurrentExercise match {
            case Some(currentExercise: Exercise) =>
              currentExercise.getWorlds(WorldKind.ANSWER).toArray(Array[World]()).foreach { world =>
                out ! JSONUtils.demoOperationsToJSON(world)
              }
            case _ =>
          }
        case "revertExercise" =>
          optCurrentExercise match {
            case Some(currentExercise: Exercise) =>
              val defaultCode: String = currentExercise.getDefaultSourceFile(currentProgLang).getBody
              sessionActor ! SetCode(currentExercise, currentProgLang, defaultCode)
              gitActor ! RevertExercise(currentExercise, currentProgLang)

              sendMessage("reset", Json.obj("defaultCode" -> defaultCode))
            case _ =>
          }
        case "updateUser" =>
          val optFullName: Option[String] = (msg \ "args" \ "fullName").asOpt[String]
          val optTrackUser: Option[Boolean] = (msg \ "args" \ "trackUser").asOpt[Boolean]
          (optCurrentUser, optFullName) match {
            case (Some(currentUser: User), Some(fullName: String)) if !fullName.trim.isEmpty =>
              val newUser = currentUser.copy(
                  fullName = optFullName,
                  trackUser = optTrackUser
              )
              optCurrentUser = Some(newUser)
              UserDAORestImpl.update(newUser)
              sendMessage("userUpdated", Json.obj())
              optTrackUser match {
                case Some(trackUser: Boolean) =>
                  gitActor ! SetTrackUser(optTrackUser)
                case _ =>
                  logNonValidJSON("setTrackUser: non-correct JSON", msg)
              }
            case _ =>
              logNonValidJSON("updateUser: non-correct JSON", msg)
          }
        case "userIdle" =>
          setIdle
        case "userBack" =>
          clearIdle
        case "setTrackUser" =>
          val optTrackUser: Option[Boolean] = (msg \ "args" \ "trackUser").asOpt[Boolean]
          optTrackUser match {
            case Some(trackUser: Boolean) =>
              gitActor ! SetTrackUser(optTrackUser)
              saveTrackUser(trackUser)
            case _ =>
              logNonValidJSON("setTrackUser: non-correct JSON", msg)
          }
        case "submitBugReport" =>
          val optTitle: Option[String] = (msg \ "args" \ "title").asOpt[String]
          val optBody: Option[String] = (msg \ "args" \ "body").asOpt[String]
          (optTitle, optBody) match {
            case (Some(title: String), Some(body: String)) =>
              gitHubIssueManager.isCorrect(title, body) match {
                case Some(errorMsg: String) =>
                  Logger.debug("Try to post incorrect issue...")
                  Logger.debug("Title: "+title+", body: "+body)
                  sendMessage("incorrectIssue", Json.obj("msg" -> errorMsg))
                case None =>
                  val optExerciseID: Option[String] = optCurrentExercise match {
                    case Some(exercise: Exercise) =>
                      Some(exercise.getId)
                    case _ =>
                      None
                  }
                  val (optUserID: Option[String], optUserLastCommit: Option[String]) = optCurrentUser match {
                    case Some(user: User) if user.trackUser.get =>
                      (Some("PLM"+GitUtils.sha1(user.gitID)), None)
                    case _ =>
                      (None, None)
                  }

                  val additionalInformations: String = gitHubIssueManager.generateAdditionalInformations(optCurrentLesson, optExerciseID,
                    currentProgLang, currentHumanLang,
                    plmVersion, webPLMVersion,
                    optUserID, optUserLastCommit)

                  gitHubIssueManager.postIssue(title, body, additionalInformations) match {
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
    Json.obj(
      "cmd" -> cmdName,
      "args" -> mapArgs
    )
  }

  def sendMessage(cmdName: String, mapArgs: JsValue) {
    val msg: JsValue = createMessage(cmdName, mapArgs)
    out ! msg.toString
  }

  def registerActor() {
    ActorsMap.add(actorUUID, self)
    sendMessage("actorUUID", Json.obj(
        "actorUUID" -> actorUUID
      )
    )
  }

  def switchExercise(lessonID: String, exerciseID: String) {
    (exercisesActor ? GetExercise(exerciseID)).mapTo[Option[Exercise]].map { optExercise =>
      optExercise match {
        case Some(exercise: Exercise) =>

          if(!exercise.isProgLangSupported(currentProgLang)) {
            updateProgLang(ProgrammingLanguages.defaultProgrammingLanguage().getLang)
          }

          gitActor ! SwitchExercise(exercise, optCurrentExercise)

          optCurrentLesson = Some(lessonID)
          optCurrentExercise = Some(exercise)
          exercise.setSettings(userSettings)

          (sessionActor ? RetrieveCode(exercise, currentProgLang)).mapTo[String].map { code =>
            val actualCode: String = if(currentProgLang.getVisualFile) { "" } else { code }
            val mapArgs: Map[String, Object] = new HashMap[String, Object]
            mapArgs.put("exercise", JSONUtils.exerciseToClientJSON(exercise, actualCode, exercise.getWorld(0).getName, ""))

            out ! JSONUtils.createMessage("exercise", mapArgs)
          }
        case None =>
          out ! JSONUtils.createMessage("exerciseNotFound", null)
      }
    }
  }

  def sendReady(): Unit = {
    sendMessage("ready", Json.obj())
  }

  def sendProgLangs() {
    sendMessage("progLangs", Json.obj(
      "selected" -> ProgrammingLanguageToJson.programmingLanguageWrite(currentProgLang),
      "availables" -> ProgrammingLanguageToJson.programmingLanguagesWrite(ProgrammingLanguages.programmingLanguages)
    ))
  }

  def sendHumanLangs() {
    sendMessage("humanLangs", Json.obj(
      "selected" -> LangToJson.langWrite(currentHumanLang),
      "availables" -> LangToJson.langsWrite(availableLangs)
    ))
  }

  def setCurrentUser(newUser: User) {
    optCurrentUser = Some(newUser)
    sendMessage("user", Json.obj(
        "user" -> newUser
      )
    )

    setCurrentGitID(newUser.gitID, false)
  }

  def clearCurrentUser() {
    optCurrentUser = None
    sendMessage("user", Json.obj())

    setCurrentGitID(UUID.randomUUID.toString, true)
  }

  def setCurrentGitID(newGitID: String, toSend: Boolean) {
    currentGitID = newGitID
    if(toSend) {
      sendMessage("gitID", Json.obj(
          "gitID" -> currentGitID
        )
      )
    }
  }

  def saveLastProgLang() {
    optCurrentUser match {
    case Some(currentUser: User) =>
      val newUser: User = currentUser.copy(
          lastProgLang = Some(currentProgLang.getLang)
      )
      optCurrentUser = Some(newUser)
      UserDAORestImpl.update(newUser)
    case _ =>
    }
  }

  def savePreferredLang() {
    optCurrentUser match {
    case Some(currentUser: User) =>
      val newUser: User = currentUser.copy(
          preferredLang = Some(currentHumanLang)
      )
      optCurrentUser = Some(newUser)
      UserDAORestImpl.update(newUser)
    case _ =>
    }
  }

  def saveTrackUser(trackUser: Boolean) {
    optCurrentUser match {
    case Some(currentUser: User) =>
      val newUser: User = currentUser.copy(
          trackUser = Some(trackUser)
      )
      optCurrentUser = Some(newUser)
      UserDAORestImpl.update(newUser)
    case _ =>
    }
  }

  def setIdle() {
    val idleStart: Instant = Instant.apply
    optIdle = Some(idleStart)
    Logger.debug("start idling at: "+ idleStart)
  }

  def clearIdle() {
    optIdle match {
    case Some(idleStart: Instant) =>
      val idleEnd: Instant = Instant.apply
      val duration = Duration.between(idleStart, idleEnd)
      Logger.debug("end idling at: "+ idleEnd)
      Logger.debug("duration: " + duration)
      gitActor ! Idle(idleStart.toString, idleEnd.toString, duration.toString)
    case _ =>
    }
    optIdle = None
  }

  def logNonValidJSON(label: String, msg: JsValue) {
    Logger.error(label)
    Logger.error(msg.toString)
  }

  def initProgLang(lastProgLang: Option[String]): ProgrammingLanguage = {
    lastProgLang match {
    case Some(progLang: String) =>
      ProgrammingLanguages.getProgrammingLanguage(progLang)
    case _ =>
      ProgrammingLanguages.defaultProgrammingLanguage
    }
  }

  def initHumanLang(lastHumanLang: Option[Lang]): Lang = {
    lastHumanLang match {
      case Some(lang: Lang) =>
        lang
      case _ =>
        Lang("en")
    }
  }

  def updateHumanLang(humanLang: String) {
    currentHumanLang = Lang(humanLang)
    userSettings.setHumanLang(currentHumanLang.toLocale)
    sendMessage("newHumanLang", generateUpdatedHumanLangJson)
  }

  def checkProglang(progLang: String): Boolean = {
    val newProgLang: ProgrammingLanguage = ProgrammingLanguages.getProgrammingLanguage(progLang)
    var isProgLangSupported: Boolean = true
    optCurrentExercise match {
      case Some(exercise: Exercise) =>
        if (!exercise.isProgLangSupported(newProgLang)) {
          isProgLangSupported = false
        }
      case _ =>
    }
    isProgLangSupported
  }

  def updateProgLang(progLang: String) {
    if(checkProglang(progLang)) {
      currentProgLang = ProgrammingLanguages.getProgrammingLanguage(progLang)
      userSettings.setProgLang(currentProgLang)
      sendMessage("newProgLang", generateUpdatedProgLangJson)
    } else {
      sendMessage("progLangUnsupported", Json.obj())
    }
  }

  def generateUpdatedExerciseJson(): JsObject = {
    optCurrentExercise match {
    case Some(exercise: Exercise) =>
      val exerciseJson: JsObject = Json.obj(
        "instructions" -> exercise.getMission(currentHumanLang.toLocale, currentProgLang),
        "help" -> exercise.getWorldAPI
      )
      exerciseJson
    case _ =>
      Json.obj()
    }
  }

  def generateUpdatedHumanLangJson(): JsObject = {
    var json: JsObject = Json.obj("newHumanLang" -> LangToJson.langWrite(currentHumanLang))
    val tuple =
      (generateUpdatedLessonsListJson(),
       generateUpdatedExercisesListJson(),
       generateUpdatedExerciseJson())
    tuple.productIterator.foreach { additionalJson =>
      json = json ++ additionalJson.asInstanceOf[JsObject]
    }
    json
  }

  def generateUpdatedLessonsListJson(): JsValue = {
    Json.obj(
      "lessons" -> Lesson.arrayToJson(lessons.lessonsList, currentHumanLang)
    )
  }

  def generateUpdatedExercisesListJson(): JsObject = {
    optCurrentLesson match {
      case Some(lessonName: String) =>
        Json.obj(
          "lectures" ->
            Lecture.arrayToJson(
              sessionActor,
              lessons.exercisesList(lessonName),
              currentHumanLang,
              currentProgLang))
      case _ => Json.obj() 
    }
  }

  def generateUpdatedProgLangJson(): JsObject = {
    var json: JsObject = Json.obj("newProgLang" -> ProgrammingLanguageToJson.programmingLanguageWrite(currentProgLang))

    val futureTuple = for {
      codeJson <- generateUpdatedCodeJson()
    } yield (codeJson, generateUpdatedExercisesListJson(), generateUpdatedExerciseJson())

    val tuple = Await.result(futureTuple, 5 seconds)
    tuple.productIterator.foreach { additionalJson =>
      json = json ++ additionalJson.asInstanceOf[JsObject]
    }
    json
  }

  def generateUpdatedCodeJson(): Future[JsObject] = {
    optCurrentExercise match {
    case Some(exercise: Exercise) =>
      (sessionActor ? RetrieveCode(exercise, currentProgLang)).mapTo[String].map { code =>
        val actualCode: String = if(currentProgLang.getVisualFile) { "" } else { code }
        val codeJson: JsObject = Json.obj(
          "code" -> actualCode
        )
        codeJson
      }
    case _ =>
      Future { Json.obj() }
    }
  }

  def handleExecutionResult(exercise: Exercise, code: String, optVisualCode: Option[String], executionResult: ExecutionProgress) {
    sessionActor ! SetCode(exercise, currentProgLang, code)
    gitActor ! Executed(exercise, executionResult, code, optVisualCode)

    val msgType: Int = if (executionResult.outcome == ExecutionProgress.outcomeKind.PASS) 1 else 0
    val commonErrorID: Int = executionResult.commonErrorID
    val commonErrorText: String = executionResult.commonErrorText
    val msg: String = executionResult.getMsg(locale)

    val mapArgs: JsValue = Json.obj(
      "msgType" -> msgType,
      "msg" -> msg,
      "commonErrorID" -> commonErrorID,
      "commonErrorText" -> commonErrorText
    )

    sendMessage("executionResult", mapArgs)
  }

  override def postStop() = {
    Logger.debug("postStop: websocket closed - removing the spies")
    clearIdle

    gitActor ! PoisonPill
    executionActor ! PoisonPill
    exercisesActor ! PoisonPill
    sessionActor ! PoisonPill

    ActorsMap.remove(actorUUID)
  }
}
