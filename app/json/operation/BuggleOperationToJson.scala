package json.operation

import play.api.libs.json._
import plm.universe.bugglequest.BuggleOperation
import plm.universe.bugglequest.MoveBuggleOperation
import plm.universe.bugglequest.ChangeBuggleDirection
import plm.universe.bugglequest.ChangeBuggleCarryBaggle
import plm.universe.bugglequest.ChangeBuggleBrushDown
import plm.universe.bugglequest.ChangeBuggleBodyColor

object BuggleOperationToJson {

  def buggleOperationWrite(buggleOperation: BuggleOperation): JsValue = {
    var json: JsValue = null
    buggleOperation match {
      case moveBuggleOperation: MoveBuggleOperation =>
        json = moveBuggleOperationWrite(moveBuggleOperation)
      case changeBuggleDirection: ChangeBuggleDirection =>
        json = changeBuggleDirectionWrite(changeBuggleDirection)
      case changeBuggleCarryBaggle: ChangeBuggleCarryBaggle =>
        json = changeBuggleCarryBaggleWrite(changeBuggleCarryBaggle)
      case changeBuggleBrushDown: ChangeBuggleBrushDown =>
        json = changeBuggleBrushDownWrite(changeBuggleBrushDown)
      case changeBuggleBodyColor: ChangeBuggleBodyColor =>
        json = changeBuggleBodyColorWrite(changeBuggleBodyColor)
      case _ =>
        json = Json.obj()
    }
    json = json.as[JsObject] ++ Json.obj(
      "buggleID" -> buggleOperation.getBuggle.getName
    )
    return json
  }
  
  def moveBuggleOperationWrite(moveBuggleOperation: MoveBuggleOperation): JsValue = {
    Json.obj(
      "oldX" -> moveBuggleOperation.getOldX(),
      "oldY" -> moveBuggleOperation.getOldY(),
      "newX" -> moveBuggleOperation.getNewX(),
      "newY" -> moveBuggleOperation.getNewY()
    )
  }

  def changeBuggleCarryBaggleWrite(changeBuggleCarryBaggle: ChangeBuggleCarryBaggle): JsValue = {
    Json.obj(
      "oldCarryBaggle" -> changeBuggleCarryBaggle.getOldCarryBaggle,
      "newCarryBaggle" -> changeBuggleCarryBaggle.getNewCarryBaggle
    )
  }
  
  def changeBuggleBrushDownWrite(changeBuggleBrushDown: ChangeBuggleBrushDown): JsValue = {
    Json.obj(
      "oldBrushDown" -> changeBuggleBrushDown.getOldBrushDown,
      "newBrushDown" -> changeBuggleBrushDown.getNewBrushDown
    )
  }

  def changeBuggleDirectionWrite(changeBuggleDirection: ChangeBuggleDirection): JsValue = {
    Json.obj(
      "oldDirection" -> changeBuggleDirection.getOldDirection.intValue(),
      "newDirection" -> changeBuggleDirection.getNewDirection.intValue()
    )
  }
  
  def changeBuggleBodyColorWrite(changeBuggleBodyColor: ChangeBuggleBodyColor): JsValue = {
    var oldColor = changeBuggleBodyColor.getOldBodyColor
    var newColor = changeBuggleBodyColor.getNewBodyColor
    Json.obj(
      "oldColor" -> List[Int](oldColor.getRed, oldColor.getGreen, oldColor.getBlue, oldColor.getAlpha),
      "newColor" -> List[Int](newColor.getRed, newColor.getGreen, newColor.getBlue, newColor.getAlpha)
    )
  }
  
}