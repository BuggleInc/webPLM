package actors

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.language.postfixOps
import akka.actor.Actor
import akka.actor.ActorSystem
import akka.actor.Props
import play.api.Logger
import plm.core.model.tracking.GitUtils
import java.io.File
/**
 * @author matthieu
 */

object PushActor {

  val home: String = System.getProperty("user.home")
  val gitDirectory: String = ".plm"
  val repoUrl: String = "https://github.com/BuggleInc/PLM-data.git"

  val interval: FiniteDuration = 5 seconds
  
  def props = Props[PushActor]

  case class RequestPush(userUUID: String)
  case class Push()
}

class PushActor extends Actor {
  import PushActor._

  var pendingRequests: Array[String] = Array[String]()

  val system = ActorSystem("application")
  val cancellable = system.scheduler.schedule(0 seconds, interval, self, Push)

  def receive = {
    case RequestPush(gitID: String) =>
      Logger.error("On a reçu un RequestPush")
      pendingRequests = pendingRequests.+:(gitID)
    case Push =>
      Logger.error("Dans push")
      pushRepos
    case _ =>
  }
  
  def pushRepos() {
    pendingRequests.foreach { gitID => 
    }
  }
  
  override def postStop() = {
    Logger.error("postStop: server stopped - pushing the repos")
    pushRepos
  }
}