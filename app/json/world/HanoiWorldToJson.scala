package json.world

import play.api.libs.json._
import json.Utils
import lessons.recursion.hanoi.universe.HanoiWorld
import lessons.recursion.hanoi.universe.HanoiDisk
import java.util.Vector

object HanoiWorldToJson {

  def slotWrite(slots: Array[Vector[HanoiDisk]]): JsValue = {
    var jsArray = JsArray()
    slots.foreach { vector =>
      var slot = JsArray()
      vector.toArray(Array[HanoiDisk]()).foreach { hanoiDisk => 
        slot = slot.append(Json.obj(
          "size" -> hanoiDisk.getSize,
          "color" -> Utils.colorToWrapper(hanoiDisk.getColor)
        ))
      }
      jsArray = jsArray :+ slot
    }
    return jsArray
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
        "slots" -> slotWrite(hanoiWorld.getSlot))
  }
}