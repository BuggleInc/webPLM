package json.world.pancake

import play.api.libs.json._
import lessons.sort.pancake.universe.PancakeWorld
import lessons.sort.pancake.universe.Pancake
import play.api.libs.json.Json.JsValueWrapper


object PancakeWorldToJson {
  
  def pancakeWorldWrite(pancakeWorld: PancakeWorld): JsValue =
  {
    var json: JsValue = null
    var pancakeStack = pancakeWorld.getStack
        json = json.as[JsObject] ++ Json.obj(
            "pancakeStack" -> PancakeToJson.pancakesWrite(pancakeStack)
        )
        json = json.as[JsObject] ++ Json.obj(
        "type" -> "PancakeWorld",
        "moveCount" -> pancakeWorld.getMoveCount
        )
        return json
  }

}