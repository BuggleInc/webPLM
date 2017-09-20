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
import plm.core.model.json.JSONUtils
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.ScheduledExecutorService

/**
* @author matthieu
*/
class OperationSpy(val out: ActorRef, world: World) {
  val MAX_SIZE: Int = 10000
  val DELAY: Int = 1000

  var buffer: JSONArray = new JSONArray

  val ses: ScheduledExecutorService = Executors.newSingleThreadScheduledExecutor
  val cmd: Runnable = new Runnable() {
    override def run() {
      if (!world.getSteps.isEmpty) {
        out ! JSONUtils.operationsToJSON(world, MAX_SIZE)
      }
    }
  }

  ses.scheduleAtFixedRate(cmd, 10L, 10L, TimeUnit.MILLISECONDS)

  def stop() {
    ses.shutdown()
    ses.awaitTermination(10L, TimeUnit.MILLISECONDS)
  }

  def flush() {
    while (!world.getSteps.isEmpty) {
      out ! JSONUtils.operationsToJSON(world, MAX_SIZE)
    }
  }

  override def equals(o: Any): Boolean = {
    o match {
      case spy: OperationSpy =>
        spy.out == this.out
      case _ => false
    }
  }
}
