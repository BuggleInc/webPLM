package models

import plm.core.model.Game
import plm.core.model.tracking.GitUtils
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
import plm.universe.World
import scala.collection.mutable.ListBuffer
import scala.collection.immutable.HashMap
import play.api.libs.json._
import play.api.Logger
import play.api.i18n.Lang
import log.PLMLogger
import actors.PLMActor

import java.util.Locale
import java.io.File
import java.io.FileWriter
import java.io.BufferedWriter
import java.io.IOException
import org.eclipse.jgit.lib.NullProgressMonitor
import org.eclipse.jgit.api.errors.GitAPIException


class Git(userUUID : String, gitUtils : GitUtils) {
  var repoDir : File = getRepoDir(Game.getSavingLocation())
  var repoUrl : String = Game.getProperty("plm.git.server.url")
  
  def commitExecutionResult(code: String, error: String, outcome: String, optTotalTests: Option[String], optPassedTests: Option[String]) {
    var game: Game = gitUtils.getGame();
    var exo: Exercise = game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise]   
    
    var kindMes: String = "executed";
    
    var courseID: String = game.getCourseID
    var exoID: String = exo.getId
    var pl: ProgrammingLanguage = game.getProgrammingLanguage
    var commitMsg: String = writeExecutionResultCommitMessage(courseID, exoID, pl, outcome, optTotalTests, optPassedTests)
    commitMsg = "{\"kind\" : \"" + kindMes +"\"" + commitMsg.drop(1)
    var userBranch: String = "PLM"+GitUtils.sha1(userUUID)
    
    var pass: Boolean = outcome == "pass"
    generateExecutionResultFiles(exo, game.getProgrammingLanguage, pass, code, error)
    
    gitUtils.removeFiles()
    gitUtils.seqAddFilesToPush(commitMsg, userBranch, NullProgressMonitor.INSTANCE)
  }
  
  def writeExecutionResultCommitMessage(courseID: String, exoID: String, pl: ProgrammingLanguage, outcome: String, optTotalTests: Option[String], optPassedTests: Option[String]): String = { 
    var messageJSON: JsObject = Json.obj(
        "course" -> courseID,
        "exo" -> exoID,
        "lang" -> pl.toString,
        "outcome" -> outcome
    )
    (optTotalTests.getOrElse(None), optPassedTests.getOrElse(None)) match {
      case (totalTests: String, passedTests: String) =>
        messageJSON = messageJSON.++(Json.obj("totalTests" -> totalTests, "passedTests" -> passedTests))
      case (_, _) =>
        // Do nothing
    }
    messageJSON.toString
  }
  
  def generateExecutionResultFiles(exo: Exercise, pl: ProgrammingLanguage, pass: Boolean, code: String, error: String) {
    var correction = exo.getSourceFile(pl, 0).getCorrection() // retrieve the correction
    var mission = exo.getMission(pl) // retrieve the mission
    var ext = "." + pl.getExt

    // create the different files
    var exoFile = new File(repoDir, exo.getId() + ext + ".code")
    var errorFile = new File(repoDir, exo.getId() + ext + ".error")
    var correctionFile = new File(repoDir, exo.getId() + ext + ".correction")
    var missionFile = new File(repoDir, exo.getId() + ext + ".mission")
    
    try {
      // write the code of the exercise into the file
      var fwExo = new FileWriter(exoFile.getAbsoluteFile())
      var bwExo = new BufferedWriter(fwExo)
      bwExo.write(if(code == null) "" else code)
      bwExo.close()

      // write the compilation error of the exercise into the file
      var fwError = new FileWriter(errorFile.getAbsoluteFile())
      var bwError = new BufferedWriter(fwError)
      bwError.write(if(error == null) "" else error)
      bwError.close()

      // write the correction of the exercise into the file
      var fwCorrection = new FileWriter(correctionFile.getAbsoluteFile())
      var bwCorrection = new BufferedWriter(fwCorrection)
      bwCorrection.write(if(correction == null) "" else correction)
      bwCorrection.close()

      // write the instructions of the exercise into the file
      var fwMission = new FileWriter(missionFile.getAbsoluteFile())
      var bwMission = new BufferedWriter(fwMission)
      bwMission.write(if(mission == null) "" else mission)
      bwMission.close()
    } catch  {
      case  e : IOException => e.printStackTrace()
    }
    // if exercise is done correctly
    var doneFile = new File(repoDir, exo.getId() + ext + ".DONE")
    if (pass) {
      try {
        var fwExo = new FileWriter(doneFile.getAbsoluteFile())
        var bwExo = new BufferedWriter(fwExo)
        bwExo.write("")
        bwExo.close()
      } catch {
        case ex : IOException =>
           Logger.warn("Failed to write on disk that the exercise is passed: "+ex.getLocalizedMessage())
      }
    } else {
      if (doneFile.exists())
        doneFile.delete() // not passed anymore. Sad thing.
    }
  }

  def getRepoDir(savingLoc : String) : File = {
    var userBranch : String = "PLM"+GitUtils.sha1(userUUID)
    var repoDir : File = null
    var game = gitUtils.getGame()
    
    try {
		repoDir = new File(Game.SAVE_DIR.getAbsolutePath + System.getProperty("file.separator") + userUUID);

		if (!repoDir.exists()) {
			gitUtils.initLocalRepository(repoDir);
			gitUtils.setUpRepoConfig(repoUrl, userBranch);
			// We must create an initial commit before creating a specific branch for the user
			gitUtils.createInitialCommit();
		}

		gitUtils.openRepo(repoDir);
		if (gitUtils.getRepoRef(userBranch) != null) {
			gitUtils.checkoutUserBranch(userBranch);
		}
		else {
			gitUtils.createLocalUserBranch(userBranch);
		}

		// try to get the branch as stored remotely
		Logger.debug(userBranch)
		if (gitUtils.fetchBranchFromRemoteBranch(userBranch)) {
			gitUtils.mergeRemoteIntoLocalBranch(userBranch);
			Logger.debug(game.i18n.tr("Your session {0} was automatically retrieved from the servers.",userBranch));
		}
		else {
			// If no branch can be found remotely, create a new one.
			//getGame().getLogger().log(getGame().i18n.tr("Creating a new session locally, as no corresponding session could be retrieved from the servers.",userBranch));
			Logger.debug(game.i18n.tr("Couldn't retrieve a corresponding session from the servers..."));
		}
		// Log into the git that the PLM just started
		gitUtils.commit(writePLMStartedOrLeavedCommitMessage("started"));

		// and push to ensure that everything remains in sync
		gitUtils.maybePushToUserBranch(userBranch, NullProgressMonitor.INSTANCE); 
    } catch {
      case e : Exception => System.err.println(game.i18n.tr("You found a bug in the PLM. Please report it with all possible details (including the stacktrace below)."))
      e.printStackTrace()
    }
    return repoDir
  }
  
  def writePLMStartedOrLeavedCommitMessage(kind : String) : String =  {
	var game = gitUtils.getGame();
    var jsonObject : JsValue = Json.obj(
        "java" -> (System.getProperty("java.version") + " (VM: " + System.getProperty("java.vm.name") + "; version: " + System.getProperty("java.vm.version") + ")"),
        "os" -> (System.getProperty("os.name") + " (version: " + System.getProperty("os.version") + "; arch: " + System.getProperty("os.arch") + ")"),
        "plm" -> (Game.getProperty("plm.major.version", "internal", false) + " (" + Game.getProperty("plm.minor.version", "internal", false) + ")"))

    // Misuses JSON to ensure that the kind is always written first so that we can read github commit lists
    return "{\"kind\":\""+kind+"\","+Json.stringify(jsonObject).drop(1);
  }
}
