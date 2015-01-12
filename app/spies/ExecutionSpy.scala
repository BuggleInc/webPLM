package spies

import play.api.libs.json._
import play.Logger

import plm.universe.World
import plm.universe.IWorldView
import plm.universe.Operation
import plm.universe.bugglequest.BuggleOperation
import plm.universe.bugglequest.MoveBuggleOperation

import actors.PLMActor

class ExecutionSpy(plmActor: PLMActor) extends IWorldView {
  var world: World = _
  
  override def clone(): ExecutionSpy = {
    return new ExecutionSpy(plmActor)
  }
  
  def setWorld(world: World) {
    this.world = world
    world.addWorldUpdatesListener(this)
    plmActor.registerSpy(this)
  }
  
  def unregister() {
    world.removeWorldUpdatesListener(this)
  }
  
  // Can't define a writer for each subclass 
  // Since it would be ambiguous which one to use
  // Have to define functions instead
  implicit object operationWrite extends Writes[Operation] {
    def writes(operation: Operation) = operation match {
      case buggleOperation: BuggleOperation =>
        buggleOperationWrite(buggleOperation)
      case _ =>
        Json.obj(
          "operation" -> "arf"    
        )
    }
  }
  
  def buggleOperationWrite(buggleOperation: BuggleOperation): JsValue = {
    buggleOperation match {
      case moveBuggleOperation: MoveBuggleOperation =>
        moveBuggleOperationWrite(moveBuggleOperation)
    }
  }
  
  def moveBuggleOperationWrite(moveBuggleOperation: MoveBuggleOperation): JsValue = {
    Json.obj(
      "type" -> moveBuggleOperation.getName(),
      "buggleID" -> moveBuggleOperation.getBuggle().getName(),
      "oldX" -> moveBuggleOperation.getOldX(),
      "oldY" -> moveBuggleOperation.getOldY(),
      "newX" -> moveBuggleOperation.getNewX(),
      "newY" -> moveBuggleOperation.getNewY()
    )
  }

  /**
   * Called every time something changes: entity move, new entity, entity gets destroyed, etc.
   */
  def worldHasMoved() {
    if(!world.operations.isEmpty()) {
      Logger.debug("The world moved!")
      
      var mapArgs: JsValue = Json.obj(
        "worldID" -> world.getName,
        "operations" -> world.operations.toArray(Array[Operation]()).toList
      )
      Logger.debug(Json.stringify(mapArgs))
      world.operations.clear()
      plmActor.sendMessage("operations", mapArgs)
    
    }
  }
  
  /**
   * Called when entities are created or destroyed, not when they move
   */
  def worldHasChanged() {
    // Do not care?
  }
  
  
}