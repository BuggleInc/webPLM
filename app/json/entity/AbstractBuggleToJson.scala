package json.entity

import play.api.libs.json._
import plm.universe.bugglequest.AbstractBuggle
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import json.Utils

object AbstractBuggleToJson {
  
  def abstractBuggleWrite(abstractBuggle: AbstractBuggle): JsValue = {
    Json.obj(
      "x" -> abstractBuggle.getX,
      "y" -> abstractBuggle.getY,
      "color" -> Utils.colorToWrapper(abstractBuggle.getCouleurCorps),
      "direction" -> abstractBuggle.getDirection.intValue,
      "carryBaggle" -> abstractBuggle.isCarryingBaggle()
    )
  }
}