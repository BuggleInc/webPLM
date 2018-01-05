package actors

import java.util.Locale
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.DurationInt
import scala.concurrent.duration.FiniteDuration
import scala.language.postfixOps
import org.eclipse.jgit.lib.NullProgressMonitor
import org.eclipse.jgit.lib.ProgressMonitor
import org.eclipse.jgit.transport.CredentialsProvider
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider
import org.xnap.commons.i18n.I18n
import org.xnap.commons.i18n.I18nFactory
import com.google.inject.Inject
import PushActor.Push
import PushActor.RequestPush
import akka.actor.Actor
import akka.actor.ActorSystem
import akka.actor.Props
import log.PLMLogger
import play.api.Configuration
import play.api.Logger
import plm.utils.GitUtils
import java.io.File

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

  val i18n: I18n = I18nFactory.getI18n(getClass(),"org.plm.i18n.Messages", new Locale("en"), I18nFactory.FALLBACK)

  val home: String = System.getProperty("user.home")
  val gitDirectory: String = ".plm"
  val repoUrl: String = "https://github.com/BuggleInc/PLM-data.git"

  val interval: FiniteDuration = 5 minutes

  val username: String = configuration.getString("plm.github.oauth").getOrElse("dummy-username")
  val password: String = "x-oauth-basic"

  val cp: CredentialsProvider = new UsernamePasswordCredentialsProvider(username, password)
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
    case _ =>
  }

  def pushRepos() {
    pendingRequests.foreach { gitID =>
      val gitUtils: GitUtils = new GitUtils(new Locale("en"))
      val repoPath: String = List(home, gitDirectory, gitID).mkString("/")
      val repoDir: File = new File(repoPath)

      val userBranchHash: String = "PLM" + GitUtils.sha1(gitID)
      gitUtils.openRepo(repoDir)
      gitUtils.pushChanges(userBranchHash, progress, cp)
    }
    pendingRequests = Array[String]()
  }

  override def postStop() = {
    Logger.info("postStop: server stopped - pushing the repos")
    cancellable.cancel
    pushRepos
  }
}
