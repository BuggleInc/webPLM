package spies

import plm.universe.World
import play.api.libs.json.JsObject
import play.api.libs.json.JsArray
import akka.actor.ActorRef
import play.api.libs.json.Json
import plm.universe.Entity
import play.api.libs.json.JsValue
import plm.universe.Operation
import play.api.Logger
import plm.core.lang.ProgrammingLanguage
import org.json.simple.JSONArray
import org.json.simple.JSONObject
import utils.JSONUtils
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.ScheduledExecutorService

/**
 * @author matthieu
 */
class OperationSpy(out: ActorRef, world: World, progLang: ProgrammingLanguage) {
  val MAX_SIZE: Int = 10000
  val DELAY: Int = 1000

  var buffer: JSONArray = new JSONArray

  val ses: ScheduledExecutorService = Executors.newSingleThreadScheduledExecutor
  val cmd: Runnable = new Runnable() {
    override def run() {
      var length: Int = world.getSteps.size
      if(MAX_SIZE < length) {
        length = MAX_SIZE
      }
      for(i <- 0 until length) {
        Operation.addOperationsToBuffer(buffer, world.getName, world.getSteps.poll)
      }
      sendOperations
    }
  }

  ses.scheduleAtFixedRate(cmd, 1L, 1L, TimeUnit.SECONDS)

  def getOut(): ActorRef = out

  def stop() {
    ses.shutdown()
    ses.awaitTermination(1L, TimeUnit.SECONDS)
  }

  def flush() {
    val length: Int = world.getSteps.size
    for(i <- 0 until length) {
      Operation.addOperationsToBuffer(buffer, world.getName, world.getSteps.poll);
      if(buffer.size==MAX_SIZE) {
        sendOperations;
      }
    }
    sendOperations
  }

  def sendOperations() {
    if(!buffer.isEmpty) {
      out ! Operation.operationsBufferToMsg("operations", buffer)
      buffer = new JSONArray
    }
  }

  override def equals(o: Any) = {
    o match {
      case spy: OperationSpy =>
        spy.getOut == this.out
      case _ => false
    }
  }
}
