package json.entity

import play.api.libs.json._
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import plm.universe.turtles.Turtle


/**
 * @author matthieu
 */
object TurtleToJson {
  def turtleWrite(turtle: Turtle): JsValue = {
    Json.obj(
      "x" -> turtle.getX,
      "y" -> turtle.getY,
      "direction" -> turtle.getHeading
    )
  }
}