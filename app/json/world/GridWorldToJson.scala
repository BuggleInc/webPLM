package json.world

import exceptions.NonImplementedWorldException

import play.api.libs.json._
import plm.universe.GridWorld
import plm.universe.bugglequest.BuggleWorld
import play.api.libs.json.Json.toJsFieldJsValueWrapper

object GridWorldToJson {
  
  def gridWorldWrite(gridWorld: GridWorld): JsValue = {
    var json: JsValue = null
    gridWorld match {
      case buggleWorld: BuggleWorld =>
        json = Json.obj(
          "type" -> "BuggleWorld"
        )
      case _ =>
        throw NonImplementedWorldException.create;
    }
    json = json.as[JsObject] ++ Json.obj(
      "width" -> gridWorld.getWidth,
      "height" -> gridWorld.getHeight,
      "cells" -> GridWorldCellToJson.gridWorldCellsWrite(gridWorld.getCells)
    )
    return json
  }
}