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

/**
 * @author matthieu
 */
class OperationSpy(out: ActorRef, world: World, progLang: ProgrammingLanguage) extends IWorldView {  
  val delay: Int = 1000
  
  var buffer: JsArray = new JsArray
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
    val currentTime = System.currentTimeMillis
    val length: Int = world.getSteps.size
    for(i <- cnt to length-1) {
      val operations: Array[Operation] = world.getSteps.get(i).toArray(Array[Operation]())
      val currentTime = System.currentTimeMillis
      val mapArgs: JsValue = Json.obj(
        "worldID" -> world.getName,
        "operations" -> OperationToJson.operationsWrite(operations, progLang)
      )
      buffer = buffer.append(mapArgs)
      if(lastTime+delay <= currentTime) {
        lastTime = currentTime
        sendOperations
      }
    }
    cnt = length
  }
  
  /**
   * Called when entities are created or destroyed, not when they move
   */
  def worldHasChanged() {}
  
  def sendOperations() {
    if(buffer.value.length > 0) {
      val msg: JsObject = Json.obj(
          "cmd" -> "operations",
          "args" -> Json.obj(
              "buffer" -> buffer
          )
      )
      out ! msg
      buffer = new JsArray
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