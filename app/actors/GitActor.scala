package actors

import java.io.File
import java.io.PrintWriter
import scala.collection.mutable.HashMap
import akka.actor.Actor
import akka.actor.Props
import play.api.Logger
import play.api.libs.json.JsObject
import play.api.libs.json.Json
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.ExecutionProgress
import plm.core.model.lesson.ExecutionProgress.outcomeKind._
import plm.core.model.lesson.Exercise
import plm.core.model.tracking.GitUtils
import utils.FileUtils
import play.api.Play
import play.api.Play.current
import akka.actor.ActorRef
import scala.concurrent.ExecutionContext.Implicits.global
import org.xnap.commons.i18n.I18nFactory
import log.PLMLogger
import java.util.Locale
import org.xnap.commons.i18n.I18n
import plm.core.model.LogHandler

/**
 * @author matthieu
 */
object GitActor {

  val home: String = System.getProperty("user.home")
  val gitDirectory: String = ".plm"
  val repoUrl: String = "https://github.com/BuggleInc/PLM-data.git"

  val java: String = System.getProperty("java.version") + " (VM: " + System.getProperty("java.vm.name") + "; version: " + System.getProperty("java.vm.version") + ")"
  val os: String = System.getProperty("os.name") + " (version: " + System.getProperty("os.version") + "; arch: " + System.getProperty("os.arch") + ")"
  val plmMajorVersion: String = Play.configuration.getString("plm.major.version").get
  val plmMinorVersion: String = Play.configuration.getString("plm.minor.version").get
  val plmVersion: String = plmMajorVersion + " (" + plmMinorVersion + ")"
  val webPLMVersion: String = Play.configuration.getString("application.version").get

  def props(pushActor: ActorRef, gitID: String, optTrackUser: Option[Boolean], userAgent: String)= Props(new GitActor(pushActor, gitID, optTrackUser, userAgent))

  case class SwitchUser(newGitID: String, newOptTrackUser: Option[Boolean])
  case class SetTrackUser(newOptTrackUser: Option[Boolean])
  case class RetrieveCodeFromGit(exerciseID: String, progLang: ProgrammingLanguage)
  case class Executed(exercise: Exercise, result: ExecutionProgress, code: String, humanLang: String)
  case class SwitchExercise(exerciseTo: Exercise, optExerciseFrom: Option[Exercise])
  case class Idle(idleStart: String, idleEnd: String, duration: String)
}

class GitActor(pushActor: ActorRef, initialGitID: String, initialOptTrackUser: Option[Boolean], userAgent: String) extends Actor {
  import GitActor._
  import PushActor.RequestPush

  var gitID: String = initialGitID
  var optTrackUser: Option[Boolean] = initialOptTrackUser

  val logger: LogHandler = new PLMLogger
  val i18n: I18n = I18nFactory.getI18n(getClass(),"org.plm.i18n.Messages", new Locale("en"), I18nFactory.FALLBACK)

  val gitUtils: GitUtils = new GitUtils(logger, i18n)

  openRepo

  def receive =  {
    case SwitchUser(newGitID: String, newOptTrackUser: Option[Boolean]) =>
      closeRepo
      gitID = newGitID
      optTrackUser = newOptTrackUser
      openRepo
    case SetTrackUser(newOptTrackUser: Option[Boolean]) =>
      optTrackUser = newOptTrackUser
    case RetrieveCodeFromGit(exerciseID: String, progLang: ProgrammingLanguage) =>
      sender ! getCode(exerciseID, progLang)
    case Executed(exercise: Exercise, result: ExecutionProgress, code: String, humanLang: String) =>
      executed(exercise, result, code, humanLang)
      requestPush
    case SwitchExercise(exerciseTo: Exercise, optExerciseFrom: Option[Exercise]) =>
      switched(exerciseTo, optExerciseFrom)
      requestPush
    case Idle(idleStart: String, idleEnd: String, duration: String) =>
      idle(idleStart, idleEnd, duration)
    case _ =>
  }

  def openRepo() {
    val userBranch: String = "PLM"+GitUtils.sha1(gitID)

    try {
      val repoPath: String = List(home, gitDirectory, gitID).mkString("/")
      val repoDir: File = new File(repoPath)

      if (!repoDir.exists) {
        Logger.error("Repo doesn't exist yet")
        gitUtils.initLocalRepository(repoDir)
        gitUtils.setUpRepoConfig(repoUrl, userBranch)
        // We must create an initial commit before creating a specific branch for the user
        gitUtils.createInitialCommit
      }

      gitUtils.openRepo(repoDir)
      if (gitUtils.getRepoRef(userBranch) != null) {
        gitUtils.checkoutUserBranch(userBranch)
      } else {
        gitUtils.createLocalUserBranch(userBranch)
      }

      // try to get the branch as stored remotely
      if (gitUtils.fetchBranchFromRemoteBranch(userBranch)) {
        gitUtils.mergeRemoteIntoLocalBranch(userBranch)
        Logger.error(userBranch+" was automatically retrieved from the servers.")
      } else {
        // If no branch can be found remotely, create a new one.
        Logger.error("Couldn't retrieve a corresponding session from the servers...")
      }

      started
      requestPush
    }
    catch {
    case e: Exception =>
      Logger.error("You found a bug in the PLM. Please report it with all possible details (including the stacktrace below).")
      e.printStackTrace
    }
  }

  def closeRepo() {
    leaved
    requestPush
    gitUtils.dispose
  }

  def started() {
    val startedJson: JsObject = generateStartedOrLeavedJson
    val startedMessage: String = jsonToCommitMessage("started", startedJson)

    gitUtils.commit(startedMessage)
  }

  def leaved() {
    val leavedJson: JsObject = generateStartedOrLeavedJson
    val leavedMessage: String = jsonToCommitMessage("leaved", leavedJson)

    gitUtils.commit(leavedMessage)
  }

  def executed(exercise: Exercise, result: ExecutionProgress, code: String, humanLang: String) {
    val jsonExecuted: JsObject = generateExecutedJson(exercise, result)
    val executedMessage: String = jsonToCommitMessage("executed", jsonExecuted)

    createFiles(exercise, result, code, humanLang)
    gitUtils.addFiles
    gitUtils.commit(executedMessage)
  }

  def switched(exerciseTo: Exercise, optExerciseFrom: Option[Exercise]) {
    val jsonSwitched: JsObject = generateSwitchedJson(exerciseTo, optExerciseFrom)
    val switchedMessage: String = jsonToCommitMessage("switched", jsonSwitched)

    gitUtils.commit(switchedMessage)
  }

  def idle(idleStart: String, idleEnd: String, duration: String) {
    val jsonIdled: JsObject = generateIdleJson(idleStart, idleEnd, duration)
    val idledMessage: String = jsonToCommitMessage("idle", jsonIdled)

    gitUtils.commit(idledMessage)
  }

  def requestPush() {
    optTrackUser match {
    case Some(true) =>
      pushActor ! RequestPush(gitID) 
    case _ =>
    }
  }

  def getCode(exerciseID: String, progLang: ProgrammingLanguage): Option[String] = {
    val path: String = retrieveCodePath(exerciseID, progLang)
    FileUtils.readFile(path)
  }

  def retrieveCodePath(exerciseID: String, progLang: ProgrammingLanguage): String = {
    val filename: String = List(exerciseID, progLang.getExt, "code").mkString(".")
    List(home, gitDirectory, gitID, filename).mkString("/")
  }

  def createFiles(exercise: Exercise, result: ExecutionProgress, code: String, humanLang: String) {
    val progLang: ProgrammingLanguage = result.language
    val error: String = if(result.outcome == ExecutionProgress.outcomeKind.COMPILE) result.compilationError else result.executionError
    val correction: String = exercise.getDefaultSourceFile(progLang).getCorrection
    val mission: String = exercise.getMission(humanLang, progLang)

    var files: HashMap[String, String] = new HashMap[String, String]

    files.put("code", code)
    files.put("error", error)
    files.put("correction", correction)
    files.put("mission", mission)

    if (result.outcome == ExecutionProgress.outcomeKind.PASS) {
      files.put("DONE", "")
    }

    files.foreach{ case (fileExt: String, content: String) =>
      val filename: String = List(exercise.getId, progLang.getExt, fileExt).mkString(".")
      val path: String = List(home, gitDirectory, gitID, filename).mkString("/")
      val writer = new PrintWriter(new File(path))
      writer.write(content)
      writer.close()
    }
  }

  def jsonToCommitMessage(eventKind: String, json: JsObject): String = {
    // Misuses JSON to ensure that the kind is always written first so that we can read github commit lists
    "{\"kind\": \"" + eventKind + "\", " + json.toString.substring(1)
  }

  def generateStartedOrLeavedJson(): JsObject = {
    Json.obj(
      "java" -> java,
      "os" -> os,
      "plm" -> plmVersion,
      "webplm" -> webPLMVersion,
      "user-agent" -> userAgent
    )
  }

  def generateExecutedJson(exercise: Exercise, result: ExecutionProgress): JsObject = {
    var json: JsObject = Json.obj("exo" -> exercise.getId)

    var outcome: String = "UNKNOWN"
    result.outcome match {
    case COMPILE =>
      outcome = "compile"
    case FAIL =>
      outcome = "fail"
    case PASS =>
      outcome = "pass"
    }

    json = json ++ Json.obj(
      "lang" -> result.language.toString,
      "outcome" -> outcome,
      "passedtests" -> result.passedTests,
      "totaltests" -> result.totalTests
    )

    if (result.feedbackDifficulty != null)
      json = json ++ Json.obj("exoDifficulty" -> result.feedbackDifficulty)
    if (result.feedbackInterest != null)
      json = json ++ Json.obj("exoInterest" -> result.feedbackInterest)
    if (result.feedback != null)
      json = json ++ Json.obj("exoComment" -> result.feedback)

    json
  }

  def generateSwitchedJson(exerciseTo: Exercise, optExerciseFrom: Option[Exercise]): JsObject = {
    var json: JsObject = Json.obj("switchTo" -> exerciseTo.getId)

    optExerciseFrom match {
      case Some(exerciseFrom: Exercise) =>
        json = json ++ Json.obj(
          "exo" -> exerciseFrom.getId    
        )
      case _ =>
    }

    json
  }

  def generateIdleJson(idleStart: String, idleEnd: String, duration: String): JsObject = {
    Json.obj(
        "start" -> idleStart,
        "end" -> idleEnd,
        "duration" -> duration
    )
  }

  override def postStop() = {
    Logger.debug("gitActor's postStop: leaving & requesting push")
    leaved
    requestPush
  }
}
