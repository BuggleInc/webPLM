package spies

import play.api.libs.json._

import plm.universe.World
import plm.universe.IWorldView

import plm.universe.Operation
import plm.universe.Entity

import actors.PLMActor
import play.api.Logger
import json.operation.OperationToJson

class ExecutionSpy(plmActor: PLMActor, messageID: String) extends IWorldView {  
  var world: World = _
  
  var buffer: JsArray = new JsArray
  var lastTime: Long = System.currentTimeMillis()
  var delay: Int = 1000
  
  def getPLMActor = plmActor
  def getMessageID = messageID
 
  override def clone(): ExecutionSpy = {
    return new ExecutionSpy(plmActor, messageID)
  }
  
  def setWorld(w: World) {
    world = w
    world.addWorldUpdatesListener(this)
  }
  
  def unregister() {
    world.removeWorldUpdatesListener(this)
  }
  
  /**
   * Called every time something changes: entity move, new entity, entity gets destroyed, etc.
   */
  def worldHasMoved() {
    world.getEntities.toArray(Array[Entity]()).foreach { entity => 
      if(entity.isReadyToSend) {
        var mapArgs: JsValue = Json.obj(
          "worldID" -> world.getName,
          "operations" -> OperationToJson.operationsWrite(entity.getOperations.toArray(Array[Operation]()))
        )
        entity.getOperations.clear
        entity.setReadyToSend(false)
        buffer = buffer.append(mapArgs)
        if(lastTime+delay <= System.currentTimeMillis) {
          sendOperations
        }
      }
    }
  }
  
  /**
   * Called when entities are created or destroyed, not when they move
   */
  def worldHasChanged() {
    // Do not care?
  }
  
  def sendOperations() {
    if(buffer.value.length > 0) {
      lastTime = System.currentTimeMillis
      plmActor.sendMessage(messageID, Json.obj("buffer" -> buffer))
      buffer = new JsArray
    }
  }
  
  override def equals(o: Any) = {
    o match {
      case spy: ExecutionSpy => 
        spy.getPLMActor == this.plmActor && spy.getMessageID == this.messageID
      case _ => false
    }
  }
}