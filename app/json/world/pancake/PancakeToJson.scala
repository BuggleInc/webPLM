package json.world.pancake

import play.api.libs.json._
import plm.universe.pancake.Pancake

object PancakeToJson
{

  def pancakesWrite(pancakeStack: Array[Pancake]): JsValue = {
    var json: JsArray = Json.arr()
    pancakeStack.foreach { pancake =>
      json = json.+:(pancakeWrite(pancake))
    }
    json
  }

  def pancakeWrite(pancake: Pancake): JsValue =
  {
    Json.obj(
        "radius" -> pancake.getRadius(),
        "upsideDown" -> pancake.isUpsideDown
    )
  }
}
