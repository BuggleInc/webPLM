package json.world

import collection.JavaConversions._

import exceptions.NonImplementedWorldException

import json.entity.AbstractBuggleToJson

import play.api.libs.json._
import plm.core.model.Game
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

  def JsonToBuggleWorld(game: Game, JsBuggleWorld: JsValue): BuggleWorld = {
    var optName: Option[String] = (JsBuggleWorld \ "name").asOpt[String]
    var optWidth: Option[Int] = (JsBuggleWorld \ "width").asOpt[Int]
    var optHeight: Option[Int] = (JsBuggleWorld \ "height").asOpt[Int]
    var optBuggles: Option[JsObject] = (JsBuggleWorld \ "entities").asOpt[JsObject]
    var newWorld: BuggleWorld = null;
    
    (optName.getOrElse(None), optWidth.getOrElse(None), optHeight.getOrElse(None), 
     optBuggles.getOrElse(None)) match {
      case (name: String, width: Int, height: Int, buggles: JsObject) => {
       newWorld = new BuggleWorld(game, name, width, height)
        var newCells = BuggleWorldCellToJson.JsonToBuggleWorldCells(newWorld, width, height, JsBuggleWorld \ "cells")
        for(column <- newCells) {
          for(cell <- column) {
            newWorld.setCell(cell, cell.getX, cell.getY)
          }
        }
        AbstractBuggleToJson.JsonSimpleBugglesWrite(newWorld, buggles)
      }
    }

    return newWorld
  }
}