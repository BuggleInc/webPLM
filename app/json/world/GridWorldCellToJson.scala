package json.world

import play.api.libs.json._
import plm.universe.GridWorldCell
import plm.universe.bugglequest.BuggleWorldCell
import play.api.libs.json.Json.toJsFieldJsValueWrapper

object GridWorldCellToJson {

  def gridWorldCellsWrite(cells: Array[Array[GridWorldCell]]): JsValue = {
    var arrayCells = JsArray()
    cells.foreach { line => 
      var arrayLine = JsArray()
      line.foreach { cell =>
         arrayLine = arrayLine :+ gridWorldCellWrite(cell)
      }
      arrayCells = arrayCells :+ arrayLine
    }
    return arrayCells
  }
  
  def gridWorldCellWrite(gridWorldCell: GridWorldCell): JsValue = {
    var json: JsValue = null
    gridWorldCell match {
      case buggleWorldCell: BuggleWorldCell =>
        json = BuggleWorldCellToJson.buggleWorldCellWrite(buggleWorldCell)
    }
    json = json.as[JsObject] ++ Json.obj(
      "x" -> gridWorldCell.getX,
      "y" -> gridWorldCell.getY
    )
    return json
  }
  
}