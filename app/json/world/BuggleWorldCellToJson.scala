package json.world

import java.awt.Color

import play.api.libs.json._
import plm.core.model.Game
import plm.universe.bugglequest.BuggleWorld
import plm.universe.bugglequest.BuggleWorldCell
import play.api.libs.json.Json.toJsFieldJsValueWrapper

object BuggleWorldCellToJson {

  def buggleWorldCellWrite(buggleWorldCell: BuggleWorldCell): JsValue = {
    var color = buggleWorldCell.getColor
    Json.obj(
      "color" -> List[Int](color.getRed, color.getGreen, color.getBlue, color.getAlpha),
      "hasBaggle" -> buggleWorldCell.hasBaggle,
      "hasContent" -> buggleWorldCell.hasContent,
      "content" -> buggleWorldCell.getContent,
      "hasLeftWall" -> buggleWorldCell.hasLeftWall,
      "hasTopWall" -> buggleWorldCell.hasTopWall
    )
  }
  
  def JsonToBuggleWorldCells(buggleWorld: BuggleWorld, width: Int, height: Int, cells: JsValue): Array[Array[BuggleWorldCell]] = {
    var optColumns: Option[Array[JsArray]] = cells.asOpt[Array[JsArray]]
    var newCells: Array[Array[BuggleWorldCell]] = Array.ofDim[BuggleWorldCell](width, height)
    
    optColumns.getOrElse(None) match {
      case columns: Array[JsArray] =>
        for(column <- columns) {
          var optCells: Option[Array[JsObject]] = column.asOpt[Array[JsObject]]
          
          optCells.getOrElse(None) match {
            case cells: Array[JsObject] =>
              for(cell <- cells) {
                var newCell = JsonToBuggleWorldCell(buggleWorld, cell)
                newCells(newCell.getX)(newCell.getY) = newCell
              }
          }
        }
    }
    return newCells
  }
  
  def JsonToBuggleWorldCell(buggleWorld: BuggleWorld, cell: JsValue): BuggleWorldCell = {
    var newCell: BuggleWorldCell = null
    var optX: Option[Int] = (cell \ "x").asOpt[Int]
    var optY: Option[Int] = (cell \ "y").asOpt[Int]
    var optColor: Option[Array[Int]] = (cell \ "color").asOpt[Array[Int]]
    var optHasBaggle: Option[Boolean] = (cell \ "hasBaggle").asOpt[Boolean]
    var optHasContent: Option[Boolean] = (cell \ "hasContent").asOpt[Boolean]
    var optContent: Option[String] = (cell \ "content").asOpt[String]
    var optHasLeftWall: Option[Boolean] = (cell \ "hasLeftWall").asOpt[Boolean]
    var optHasTopWall: Option[Boolean] = (cell \ "hasTopWall").asOpt[Boolean]

    (optX.getOrElse(None), optY.getOrElse(None), optColor.getOrElse(None), optHasBaggle.getOrElse(None),
     optHasContent.getOrElse(None), optContent.getOrElse(None),
     optHasLeftWall.getOrElse(None), optHasTopWall.getOrElse(None)) match {
      case(x: Int, y: Int, color: Array[Int], hasBaggle: Boolean,
           hasContent: Boolean, content: String,
           hasLeftWall: Boolean, hasTopWall: Boolean) => {

        newCell = new BuggleWorldCell(buggleWorld , x, y)
        newCell.setColor(new Color(color(0), color(1), color(2), color(3)))

        if(hasBaggle) {
          newCell.baggleAdd()
        }
        if(hasContent) {
          newCell.setContent(content)
        }
        if(hasLeftWall) {
          newCell.putLeftWall()
        }
        if(hasTopWall) {
          newCell.putTopWall()
        }
      }
    }
    return newCell;
  }
}