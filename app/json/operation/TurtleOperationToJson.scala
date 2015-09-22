package json.operation

import play.api.libs.json.JsValue
import play.api.libs.json.JsObject
import play.api.libs.json.Json
import json.Utils
import plm.universe.turtles.operations._

/**
 * @author matthieu
 */
object TurtleOperationToJson {
  def turtleOperationWrite(turtleOperation: TurtleOperation): JsValue = {
    var json: JsObject = null
   turtleOperation match {
      case moveTurtle: MoveTurtle =>
        json = moveTurtleWrite(moveTurtle)
      case rotateTurtle: RotateTurtle =>
        json = rotateTurtleWrite(rotateTurtle)
      case changeTurtleVisible: ChangeTurtleVisible =>
        json = changeTurtleVisibleWrite(changeTurtleVisible)
      case addLine: AddLine =>
        json = addLineWrite(addLine)
      case addCircle: AddCircle =>
        json = addCircleWrite(addCircle)
      case clearCanvas: ClearCanvas =>
        json = clearCanvasWrite(clearCanvas)
      case addSizeHint: AddSizeHint =>
        json = addSizeHintWrite(addSizeHint)
      case _ =>
        json = Json.obj()
    }
    json = json ++ Json.obj(
      "turtleID" -> turtleOperation.getTurtle.getName
    )
    return json
  }
  
  def moveTurtleWrite(moveTurtle: MoveTurtle): JsObject = {
    Json.obj(
      "oldX" -> moveTurtle.getOldX,
      "oldY" -> moveTurtle.getOldY,
      "newX" -> moveTurtle.getNewX,
      "newY" -> moveTurtle.getNewY
    )
  }
  
  def rotateTurtleWrite(rotateTurtle: RotateTurtle): JsObject = {
    Json.obj(
      "oldHeading" -> rotateTurtle.getOldHeading,
      "newHeading" -> rotateTurtle.getNewHeading
    )
  }
  
  def changeTurtleVisibleWrite(changeTurtleVisible: ChangeTurtleVisible): JsObject = {
    Json.obj(
      "oldVisible" -> changeTurtleVisible.getOldVisible,
      "newVisible" -> changeTurtleVisible.getNewVisible
    )
  }
  
  def addLineWrite(addLine: AddLine): JsObject = {
    Json.obj(
      "x1" -> addLine.getX1,
      "y1" -> addLine.getY1,
      "x2" -> addLine.getX2,
      "y2" -> addLine.getY2,
      "color" -> Utils.colorToWrapper(addLine.getColor)
    )
  }
  
  def addCircleWrite(addCircle: AddCircle): JsObject = {
    Json.obj(
      "x" -> addCircle.getX,
      "y" -> addCircle.getY,
      "radius" -> addCircle.getRadius,
      "color" -> Utils.colorToWrapper(addCircle.getColor)
    )
  }
  
  def clearCanvasWrite(clearCanvas: ClearCanvas): JsObject = {
    Json.obj()
  }
  
  def addSizeHintWrite(addSizeHint: AddSizeHint): JsObject = {
    Json.obj(
      "x1" -> addSizeHint.getX1,
      "y1" -> addSizeHint.getY1,
      "x2" -> addSizeHint.getX2,
      "y2" -> addSizeHint.getY2,
      "text" -> addSizeHint.getText
    )
  }
}