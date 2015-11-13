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
import utils.FileUtils
import play.api.libs.json.{ JsObject, Json }
import play.api.Logger

/**
 * @author matthieu
 */
object GitActor {

  val home: String = System.getProperty("user.home")
  val gitDirectory: String = ".plm"

  def props(gitID: String)= Props(new GitActor(gitID))

  case class RetrieveCodeFromGit(exerciseID: String, progLang: ProgrammingLanguage)
  case class Executed(exercise: Exercise, result: ExecutionProgress, code: String, humanLang: String)
}

class GitActor(gitID: String) extends Actor {
  import GitActor._

  def receive =  {
    case RetrieveCodeFromGit(exerciseID: String, progLang: ProgrammingLanguage) =>
      sender ! getCode(exerciseID, progLang)
    case Executed(exercise: Exercise, result: ExecutionProgress, code: String, humanLang: String) =>
      createFiles(exercise, result, code, humanLang)
      val commitMessage = generateCommitMessage("executed", Some(exercise), None, Some(result), None)
      Logger.error("commit message: "+commitMessage)
      // commit
    case _ =>
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

  def generateCommitMessage(eventKind: String, optExercise: Option[Exercise], optExoTo: Option[Exercise], optResult: Option[ExecutionProgress], optDefaultJson: Option[JsObject]): String = {
    var json: JsObject = Json.obj()
    
    optDefaultJson match {
    case Some(defaultJson: JsObject) =>
      json = defaultJson
    case _ =>
    }
    
    optExercise match {
    case Some(exercise: Exercise) =>
      json = json ++ Json.obj("exo" -> exercise.getId)
    case _ =>
    }

    optResult match {
    case Some(result: ExecutionProgress) =>
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
    case _ =>
    }

    optExoTo match {
    case Some(exoTo: Exercise) =>
      json = json ++ Json.obj("switchto" -> exoTo.getId)
    case _ =>
    }

    // Misuses JSON to ensure that the kind is always written first so that we can read github commit lists
    return "{\"kind\": \"" + eventKind + "\", " + json.toString.substring(1)
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

}
