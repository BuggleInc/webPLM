package json.world.pancake

import play.api.libs.json._
import lessons.sort.pancake.universe.PancakeWorld
import lessons.sort.pancake.universe.Pancake
import play.api.libs.json.Json.JsValueWrapper


object PancakeWorldToJson {
  
  def pancakeWorldWrite(pancakeWorld: PancakeWorld): JsValue =
  {
    var pancakeStack = pancakeWorld.getStack
    Json.obj(
        "pancakeStack" -> PancakeToJson.pancakesWrite(pancakeStack),
        "type" -> "PancakeWorld",
        "moveCount" -> pancakeWorld.getMoveCount,
        "numberFlip" -> 0,
        "oldNumber" -> 0,
        "burnedWorld" -> pancakeWorld.isBurnedWorld()
    )
  }

}