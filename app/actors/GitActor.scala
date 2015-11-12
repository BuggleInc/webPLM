package actors

import akka.actor.Props
import plm.core.lang.ProgrammingLanguage
import akka.actor.Actor
import utils.FileUtils
import play.api.Logger

/**
 * @author matthieu
 */
object GitActor {
  
  val home: String = System.getProperty("user.home")
  val gitDirectory: String = ".plm"
  
  def props(gitID: String)= Props(new GitActor(gitID))

  case class RetrieveCodeFromGit(exerciseID: String, progLang: ProgrammingLanguage)
}

class GitActor(gitID: String) extends Actor {
  import GitActor._

  def receive =  {
    case RetrieveCodeFromGit(exerciseID: String, progLang: ProgrammingLanguage) =>
      sender ! getCode(exerciseID, progLang)
    case _ =>
  }

  def getCode(exerciseID: String, progLang: ProgrammingLanguage): Option[String] = {
    val path: String = retrieveFilePath(exerciseID, progLang)
    val code: Option[String] = FileUtils.readFile(path)
    return code
  }

  def retrieveFilePath(exerciseID: String, progLang: ProgrammingLanguage): String = {
    val filename: String = List(exerciseID, progLang.getExt, "code").mkString(".")
    return List(home, gitDirectory, gitID, filename).mkString("/")
  }
}
