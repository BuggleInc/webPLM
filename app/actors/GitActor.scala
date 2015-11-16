package actors

import java.io.File
import java.io.PrintWriter
import scala.collection.mutable.HashMap
import akka.actor.Actor
import akka.actor.Props
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.ExecutionProgress
import plm.core.model.lesson.ExecutionProgress.outcomeKind._
import plm.core.model.lesson.Exercise
import plm.core.model.tracking.GitUtils
import utils.FileUtils
import play.api.libs.json.{ JsObject, Json }
import play.api.Logger

/**
 * @author matthieu
 */
object GitActor {

  val home: String = System.getProperty("user.home")
  val gitDirectory: String = ".plm"
  val repoUrl: String = "https://github.com/BuggleInc/PLM-data.git"

  def props(gitID: String)= Props(new GitActor(gitID))

  case class RetrieveCodeFromGit(exerciseID: String, progLang: ProgrammingLanguage)
  case class Executed(exercise: Exercise, result: ExecutionProgress, code: String, humanLang: String)
}

class GitActor(gitID: String) extends Actor {
  import GitActor._

  val gitUtils: GitUtils = new GitUtils(gitID)

  initRepo

  def receive =  {
    case RetrieveCodeFromGit(exerciseID: String, progLang: ProgrammingLanguage) =>
      sender ! getCode(exerciseID, progLang)
    case Executed(exercise: Exercise, result: ExecutionProgress, code: String, humanLang: String) =>
      createFiles(exercise, result, code, humanLang)
      val jsonExecuted: JsObject = generateExecutedJson(exercise, result)
      val executedMessage: String = jsonToCommitMessage("executed", jsonExecuted)
      gitUtils.commit(executedMessage)
      Logger.error("commit message: "+executedMessage)
      // commit
    case _ =>
  }

  def initRepo() {
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
      /*if (gitUtils.fetchBranchFromRemoteBranch(userBranch)) {
        gitUtils.mergeRemoteIntoLocalBranch(userBranch)
        Logger.error(userBranch+" was automatically retrieved from the servers.")
      } else {
        // If no branch can be found remotely, create a new one.
        Logger.error("Couldn't retrieve a corresponding session from the servers...")
      }
      */
      // Log into the git that the PLM just started
      val startedMessage: String = "{\"kind\":\"started\",\"plm\":\"2.6-pre (20150202)\",\"java\":\"1.8.0_45 (VM: Java HotSpot(TM) 64-Bit Server VM; version: 25.45-b02)\",\"os\":\"Linux (version: 3.13.0-62-generic; arch: amd64)\",\"webplm.version\":\"1.1.0\",\"webplm.user-agent\":\"Mozilla\\/5.0 (Windows NT 6.3; WOW64; rv:42.0) Gecko\\/20100101 Firefox\\/42.0\"}"
      gitUtils.commit(startedMessage)

      // and push to ensure that everything remains in sync
      //gitUtils.maybePushToUserBranch(userBranch, progress)
    } 
    catch {
    case e: Exception =>
      Logger.error("You found a bug in the PLM. Please report it with all possible details (including the stacktrace below).")
      e.printStackTrace
    }
  }

  def getCode(exerciseID: String, progLang: ProgrammingLanguage): Option[String] = {
    val path: String = retrieveCodePath(exerciseID, progLang)
    val code: Option[String] = FileUtils.readFile(path)
    return code
  }

  def retrieveCodePath(exerciseID: String, progLang: ProgrammingLanguage): String = {
    val filename: String = List(exerciseID, progLang.getExt, "code").mkString(".")
    return List(home, gitDirectory, gitID, filename).mkString("/")
  }

  def createFiles(exercise: Exercise, result: ExecutionProgress, code: String, humanLang: String) {
    val progLang: ProgrammingLanguage = result.language
    val error: String = if(result.compilationError != null) result.compilationError else result.executionError
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
    return "{\"kind\": \"" + eventKind + "\", " + json.toString.substring(1)
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

    return json
  }
}
