package json.world

import play.api.libs.json._
import plm.universe.turtles._
import plm.universe.sort.Action
import java.util.Iterator
import play.api.Logger
import json.Utils
import plm.universe.Entity
import java.util.List

/**
 * @author matthieu
 */
object TurtleWorldToJson {
  def turtleWorldWrite(turtleWorld: TurtleWorld): JsValue = {
    Json.obj(
        "type" -> "TurtleWorld",
        "width" -> turtleWorld.getWidth,
        "height" -> turtleWorld.getHeight,
        "shapes" -> shapesWrite(turtleWorld.shapes()),
        "sizeHints" -> sizeHintsWrite(turtleWorld.sizeHints())
    )
  }

  def shapesWrite(shapes: Iterator[Shape]): JsValue = {
    var jsArray: JsArray = JsArray()
    var shape: Shape = null
    while(shapes.hasNext) {
      shape = shapes.next
      shape match {
        case line: Line =>
          jsArray = jsArray.append(Json.obj(
            "type" -> "line",
            "x1" -> line.x1,
            "y1" -> line.y1,
            "x2" -> line.x2,
            "y2" -> line.y2,
            "color" -> Utils.colorToWrapper(line.color)
          ))
        case circle: Circle =>
          jsArray = jsArray.append(Json.obj(
            "type" -> "circle",
            "x" -> circle.x,
            "y" -> circle.y,
            "radius" -> circle.radius,
            "color" -> Utils.colorToWrapper(circle.color)
          ))
        case _ =>
          Logger.error("TurtleWorldToJson: shape not supported")
      }
    }
    return jsArray
  }

  def sizeHintsWrite(sizeHints: Iterator[SizeHint]): JsValue = {
    var jsArray: JsArray = JsArray()
    var sizeHint: SizeHint = null
    while(sizeHints.hasNext) {
      sizeHint = sizeHints.next
      jsArray = jsArray.append(Json.obj(
          "x1" -> sizeHint.x1,
          "y1" -> sizeHint.y1,
          "x2" -> sizeHint.x2,
          "y2" -> sizeHint.y2,
          "text" -> sizeHint.text
        ))
    }
    return jsArray
  }

}
