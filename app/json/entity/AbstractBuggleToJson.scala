package json.entity

import java.awt.Color

import play.api.libs.json._
import plm.universe.bugglequest.AbstractBuggle
import plm.universe.bugglequest.SimpleBuggle
import plm.universe.bugglequest.BuggleWorld
import plm.universe.Direction
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
  
  def JsonSimpleBugglesWrite(buggleWorld: BuggleWorld, jsSimpleBuggles: JsObject): Array[SimpleBuggle] = {
    var bugglesID = jsSimpleBuggles.keys
    var newBuggles: Array[SimpleBuggle] = new Array[SimpleBuggle](bugglesID.size)
    var i = 0;
    for(buggleID <- bugglesID) {
      var optBuggle: Option[JsObject] = (jsSimpleBuggles \ buggleID).asOpt[JsObject]
      optBuggle.getOrElse(None) match {
        case buggle: JsObject =>
          newBuggles(i) = JsonSimpleBuggleWrite(buggleWorld, buggleID, buggle)
          i += 1
      }
    }
    return newBuggles
  }
  
  def JsonSimpleBuggleWrite(buggleWorld: BuggleWorld, name: String, jsSimpleBuggle: JsObject): SimpleBuggle = {
    var optX: Option[Int] = (jsSimpleBuggle \ "x").asOpt[Int]
    var optY: Option[Int] = (jsSimpleBuggle \ "y").asOpt[Int]
    var optColor: Option[Array[Int]] = (jsSimpleBuggle \ "color").asOpt[Array[Int]]
    var optDirection: Option[Int] = (jsSimpleBuggle \ "direction").asOpt[Int]
    var optcarryBaggle: Option[Boolean] = (jsSimpleBuggle \ "carryBaggle").asOpt[Boolean]
    
    (optX.getOrElse(None), optY.getOrElse(None), optColor.getOrElse(None), 
     optDirection.getOrElse(None), optcarryBaggle.getOrElse(None)) match {
      case (x: Int, y: Int, color: Array[Int], directionNb: Int, carryBaggle: Boolean) => {
        var direction = directionNb match {
          case Direction.NORTH_VALUE => Direction.NORTH
          case Direction.EAST_VALUE  => Direction.EAST
          case Direction.WEST_VALUE  => Direction.WEST
          case Direction.SOUTH_VALUE => Direction.SOUTH
        }
        return new SimpleBuggle(buggleWorld, name, x, y, direction,
                                new Color(color(0), color(1), color(2), color(3)),
                                new Color(42, 42, 42, 255))
      }
    }
  }
}