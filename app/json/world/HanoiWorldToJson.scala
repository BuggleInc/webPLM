package json.world

import play.api.libs.json._
import json.Utils
import plm.universe.hanoi.{ HanoiDisk, HanoiWorld }
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
    jsArray
  }

  def hanoiWorldWrite(hanoiWorld: HanoiWorld): JsValue = {
    Json.obj(
        "type" -> "HanoiWorld",
        "moveCount" -> hanoiWorld.getMoveCount,
        "slots" -> slotWrite(hanoiWorld.getSlot))
  }
}
