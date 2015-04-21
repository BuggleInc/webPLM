package json.world.pancake

import play.api.libs.json._
import lessons.sort.pancake.universe.Pancake

object PancakeToJson 
{

  def pancakesWrite(pancakeStack: Array[Pancake]): JsValue = {
    var json: JsValue = Json.obj()
    pancakeStack.foreach { pancake => 
      json = json.as[JsObject] ++ pancakeWrite(pancake).as[JsObject] 
    }
    return json
  }
  
  def pancakeWrite(pancake: Pancake): JsValue =
  {
    Json.obj(
        "radius" -> pancake.getRadius(),
        "upsideDown" -> pancake.isUpsideDown)
  }
}