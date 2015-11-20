package actors

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.language.postfixOps
import akka.actor.{ Actor, ActorSystem, Props }
import play.api.Logger
import plm.core.model.tracking.GitUtils
import java.io.File
import org.eclipse.jgit.transport.{ CredentialsProvider, UsernamePasswordCredentialsProvider }
import play.api.Play
import com.google.inject.Inject
import play.api.Configuration
import org.eclipse.jgit.lib.{ NullProgressMonitor, ProgressMonitor }

/**
 * @author matthieu
 */

object PushActor {
  def props = Props[PushActor]

  case class RequestPush(userUUID: String)
  case class Push()
}

class PushActor @Inject() (configuration: Configuration) extends Actor {
  import PushActor._

  val home: String = System.getProperty("user.home")
  val gitDirectory: String = ".plm"
  val repoUrl: String = "https://github.com/BuggleInc/PLM-data.git"

  val interval: FiniteDuration = 5 seconds

  val username: String = configuration.getString("plm.github.oauth").getOrElse("dummy-username")
  val password: String = "x-oauth-basic"

  val cp: CredentialsProvider = new UsernamePasswordCredentialsProvider(username, password);
  val progress: ProgressMonitor = NullProgressMonitor.INSTANCE

  val system = ActorSystem("application")
  val cancellable = system.scheduler.schedule(0 seconds, interval, self, Push)

  var pendingRequests: Array[String] = Array[String]()

  def receive = {
    case RequestPush(gitID: String) =>
      if(!pendingRequests.contains(gitID)) {
        pendingRequests = pendingRequests.+:(gitID)
      }
    case Push =>
      pushRepos
      pendingRequests = Array[String]()
    case _ =>
  }
  
  def pushRepos() {
    pendingRequests.foreach { gitID => 
      val gitUtils: GitUtils = new GitUtils("")
      val repoPath: String = List(home, gitDirectory, gitID).mkString("/")
      val repoDir: File = new File(repoPath)
      
      val userBranchHash: String = "PLM" + GitUtils.sha1(gitID)
      gitUtils.openRepo(repoDir)
      gitUtils.pushChanges(userBranchHash, progress, cp)
    }
  }
  
  override def postStop() = {
    Logger.error("postStop: server stopped - pushing the repos")
    pushRepos
  }
}