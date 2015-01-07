package spies

import play.api.libs.json._
import play.Logger

import plm.universe.World
import plm.universe.IWorldView

import actors.PLMActor

class ExecutionSpy(plmActor: PLMActor) extends IWorldView {
  var world: World = _
  
  override def clone(): ExecutionSpy = {
    return new ExecutionSpy(plmActor)
  }
  
  def setWorld(world: World) {
    this.world = world
    world.addWorldUpdatesListener(this)
  }
  
  /**
   * Called every time something changes: entity move, new entity, entity gets destroyed, etc.
   */
  def worldHasMoved() {
    Logger.debug("The world moved!")
    if(world.operations.isEmpty()) {
      Logger.debug("Fausse alerte, c'est vide...")
    }
    else {
      var mapArgs: JsValue = Json.obj(
        "worldID" -> world.getName,
        "msg" -> Json.arr(world.operations.toArray(Array[String]()))
      )
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