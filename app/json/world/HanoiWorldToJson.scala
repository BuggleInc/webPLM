package json.world

import play.api.libs.json._
import lessons.recursion.hanoi.universe.HanoiWorld
import java.util.Vector

object HanoiWorldToJson {

  def slotWrite(slotVal: Array[Vector[Integer]]): JsValue = {
    var arraySlot = JsArray()
    slotVal.foreach { vector =>
      var arrayVector = JsArray()
      vector.toArray(Array[Integer]()).foreach { integer => 
        arrayVector = arrayVector.append(Json.toJson(integer.intValue()))
    }
    arraySlot = arraySlot :+ arrayVector
  }
  return arraySlot
}
  /*
  def integerWrite(integer: Integer): JsValue =
  {
    Json.toJson(integer.intValue())
  } */
  
  def hanoiWorldWrite(hanoiWorld: HanoiWorld): JsValue = {
    Json.obj(
        "type" -> "HanoiWorld",
        "moveCount" -> hanoiWorld.getMoveCount,
        "slotVal" -> slotWrite(hanoiWorld.getSlot))
  }
}