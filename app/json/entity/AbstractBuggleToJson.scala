package json.entity

import play.api.libs.json._
import plm.universe.bugglequest.AbstractBuggle
import play.api.libs.json.Json.toJsFieldJsValueWrapper

object AbstractBuggleToJson {
  
  def abstractBuggleWrite(abstractBuggle: AbstractBuggle): JsValue = {
    Json.obj(
      "x" -> abstractBuggle.getX,
      "y" -> abstractBuggle.getY,
      "color" -> List[Int](abstractBuggle.getCouleurCorps.getRed, abstractBuggle.getCouleurCorps.getGreen, abstractBuggle.getCouleurCorps.getBlue, abstractBuggle.getCouleurCorps.getAlpha),
      "direction" -> abstractBuggle.getDirection.intValue,
      "carryBaggle" -> abstractBuggle.isCarryingBaggle()
    )
  }
}