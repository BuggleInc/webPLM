package json.world.pancake

import play.api.libs.json._
import lessons.sort.pancake.universe.Pancake

object PancakeToJson 
{

  def pancakesWrite(pancakeStack: Array[Pancake]): JsValue = {
    var json: JsArray = Json.arr()
    pancakeStack.foreach { pancake => 
      json = json.+:(pancakeWrite(pancake))
    }
    return json
  }
  
  def pancakeWrite(pancake: Pancake): JsValue =
  {
    Json.obj(
        "radius" -> pancake.getRadius(),
        "upsideDown" -> pancake.isUpsideDown
    )
  }
}