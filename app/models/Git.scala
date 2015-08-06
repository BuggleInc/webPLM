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
  /**
   * Called when the exercise is switched
   * @param newExerciseID the exercise the user is switching to.
   * @param user the user data.
   */
  def gitSwitchedPush(newExerciseID : String, user : UserData) {
	  
  }
  
  /**
   * 
   */
  def gitRevertedPush(user : UserData) {
	  
  }
  
  def gitStartedPush(user : UserData) {
	  
  }
  
  /**
   * Called when user leaves the PLM
   */
  def gitLeavedPush() {
	  
  }
  
  /**
   * Called when user reads the tip.
   */
  def gitTipPush() {
	   
  }
  
  def gitHelpCallPush() {
  
  }
  def gitHelpCancelPush() {
	  
  }
  
  /**
   * 
   */
  def gitIdlePush(start : String, end : String, duration : String) {
	  
  }
  
  def gitEndExecutionPush(reply : JsValue, exoCode : String) {
	// TODO : change these two lines used to get current exercise status.
	var game = gitUtils.getGame();
    var exo : Exercise = game.getCurrentLesson.getCurrentExercise.asInstanceOf[Exercise]
    try {
      reloadFiles(reply, exoCode, exo)
      
      var kindMes = "executed";
      var commitMsg = "{\"kind\" : \"" + kindMes +"\"" + Json.stringify(reply).drop(1)
      var userBranch = "PLM"+GitUtils.sha1(userUUID)
    
      gitUtils.removeFiles()
      gitUtils.seqAddFilesToPush(commitMsg, userBranch, NullProgressMonitor.INSTANCE)
    } catch {
      case e : GitAPIException => e.printStackTrace()
    }
  }
  
  def reloadFiles(reply : JsValue, exoCode : String, exo : Exercise) {
    // checkout the branch of the current user (just in case it changed in between)
    // if this case might happen, then you should also checkout back the current user branch...
    //GitUtils gitUtils = new GitUtils(git);
    //gitUtils.checkoutUserBranch(game.getUsers().getCurrentUser(), progress);
    
    // Change the files locally
    var game = gitUtils.getGame();
    var exoError : String = (reply \ "gitLogs" \ "compilError").asOpt[String].getOrElse(null) // retrieve the compilation error
    if (exoError == null) 
      exoError = (reply \ "gitLogs" \ "execError").asOpt[String].getOrElse(null)
    var exoCorrection = exo.getSourceFile(game.getProgrammingLanguage, 0).getCorrection() // retrieve the correction
    var exoMission = exo.getMission(game.getProgrammingLanguage) // retrieve the mission

    // create the different files
    var ext = "." + game.getProgrammingLanguage.getExt

    var exoFile = new File(repoDir, exo.getId() + ext + ".code")
    var errorFile = new File(repoDir, exo.getId() + ext + ".error")
    var correctionFile = new File(repoDir, exo.getId() + ext + ".correction")
    var missionFile = new File(repoDir, exo.getId() + ext + ".mission")
    
    try {
      // write the code of the exercise into the file
      var fwExo = new FileWriter(exoFile.getAbsoluteFile())
      var bwExo = new BufferedWriter(fwExo)
      bwExo.write(if(exoCode == null) "" else exoCode)
      bwExo.close()

      // write the compilation error of the exercise into the file
      var fwError = new FileWriter(errorFile.getAbsoluteFile())
      var bwError = new BufferedWriter(fwError)
      bwError.write(if(exoError == null) "" else exoError)
      bwError.close()

      // write the correction of the exercise into the file
      var fwCorrection = new FileWriter(correctionFile.getAbsoluteFile())
      var bwCorrection = new BufferedWriter(fwCorrection)
      bwCorrection.write(if(exoCorrection == null) "" else exoCorrection)
      bwCorrection.close()

      // write the instructions of the exercise into the file
      var fwMission = new FileWriter(missionFile.getAbsoluteFile())
      var bwMission = new BufferedWriter(fwMission)
      bwMission.write(if(exoMission == null) "" else exoMission)
      bwMission.close()
    } catch  {
      case  e : IOException => e.printStackTrace()
    }
    // if exercise is done correctly
    var doneFile = new File(repoDir, exo.getId() + ext + ".DONE")
    if ((reply \ "gitLogs" \ "outcome").asOpt[String].getOrElse(null) == "pass") {
      try {
        var fwExo = new FileWriter(doneFile.getAbsoluteFile())
        var bwExo = new BufferedWriter(fwExo)
        bwExo.write("")
        bwExo.close()
      } catch {
        case ex : IOException =>
           game.getLogger().log("Failed to write on disk that the exercise is passed: "+ex.getLocalizedMessage())
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
    
    System.out.println("Test 1")
    
    try {
      repoDir = new File(savingLoc + System.getProperty("file.separator") + userUUID);

      if (!repoDir.exists()) {
        gitUtils.initLocalRepository(repoDir);
        gitUtils.setUpRepoConfig(Game.getProperty("plm.git.server.url"), userBranch);
        // We must create an initial commit before creating a specific branch for the user
        gitUtils.createInitialCommit()
      }
      
      gitUtils.openRepo(repoDir)
      if (gitUtils.getRepoRef(userBranch) != null) {
        gitUtils.checkoutUserBranch(userBranch)
      }
      else {
        gitUtils.createLocalUserBranch(userBranch)
      }
      
      // try to get the branch as stored remotely
      if (gitUtils.fetchBranchFromRemoteBranch(userBranch)) {
        gitUtils.mergeRemoteIntoLocalBranch(userBranch)
        game.getLogger().log(game.i18n.tr("Your session {0} was automatically retrieved from the servers.",userBranch))
      }
      else {
        // If no branch can be found remotely, create a new one.
        //getGame().getLogger().log(getGame().i18n.tr("Creating a new session locally, as no corresponding session could be retrieved from the servers.",userBranch));
        game.getLogger().log(game.i18n.tr("Couldn't retrieve a corresponding session from the servers..."))
      }

      // Log into the git that the PLM just started
      gitUtils.commit(writePLMStartedOrLeavedCommitMessage("started"))
      
      // and push to ensure that everything remains in sync
      gitUtils.maybePushToUserBranch(userBranch, NullProgressMonitor.INSTANCE)
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
