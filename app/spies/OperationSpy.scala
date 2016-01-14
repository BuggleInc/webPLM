package spies

import plm.universe.IWorldView
import plm.universe.World
import play.api.libs.json.JsObject
import play.api.libs.json.JsArray
import akka.actor.ActorRef
import play.api.libs.json.Json
import json.operation.OperationToJson
import plm.universe.Entity
import play.api.libs.json.JsValue
import plm.universe.Operation
import play.api.Logger
import plm.core.lang.ProgrammingLanguage
import org.json.simple.JSONArray
import org.json.simple.JSONObject

/**
 * @author matthieu
 */
class OperationSpy(out: ActorRef, world: World, progLang: ProgrammingLanguage) extends IWorldView {  
  val MAX_SIZE: Int = 10000
  val DELAY: Int = 1000
  
  var buffer: JSONArray = new JSONArray
  var cnt: Int = 0
  var lastTime: Long = System.currentTimeMillis
  
  def getOut(): ActorRef = out
  
  world.addWorldUpdatesListener(this)
  
  def unregister() {
    world.removeWorldUpdatesListener(this)
  }
  
  /**
   * Called every time something changes: entity move, new entity, entity gets destroyed, etc.
   */
  def worldHasMoved() {
    val currentTime: Long = System.currentTimeMillis
    val length: Int = world.getSteps.size
    for(i <- cnt to length-1) {
      Operation.addOperationsToBuffer(buffer, world.getName, world.getSteps.get(i))
    }
    if(buffer.size() >= MAX_SIZE || lastTime+DELAY <= currentTime) {
      lastTime = System.currentTimeMillis
      sendOperations
    }
    cnt = length
  }
  
  /**
   * Called when entities are created or destroyed, not when they move
   */
  def worldHasChanged() {}
  
  def sendOperations() {
    if(!buffer.isEmpty) {
      out ! Operation.operationsBufferToMsg(buffer)      
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