package json.operation

import play.api.libs.json._

import plm.universe.GridWorldCell
import plm.universe.GridWorldCellOperation

import plm.universe.bugglequest.BuggleWorldCellOperation
import plm.universe.bugglequest.ChangeCellColor
import plm.universe.bugglequest.ChangeCellContent
import plm.universe.bugglequest.ChangeCellHasBaggle
import plm.universe.bugglequest.ChangeCellHasContent

object GridWorldCellOperationToJson {

  def gridWorldCellWrites(gridWorldCell: GridWorldCell): JsValue = {
    Json.obj(
      "x" -> gridWorldCell.getX,
      "y" -> gridWorldCell.getY
    )
  }
  
  def changeCellHasContentWrite(changeCellHasContent: ChangeCellHasContent): JsValue = {
    Json.obj(
      "oldHasContent" -> changeCellHasContent.getOldHasContent,
      "newHasContent" -> changeCellHasContent.getNewHasContent
    )
  }
  
  def changeCellHasBaggleWrite(changeCellHasBaggle: ChangeCellHasBaggle): JsValue = {
    Json.obj(
      "oldHasBaggle" -> changeCellHasBaggle.getOldHasBaggle,
      "newHasBaggle" -> changeCellHasBaggle.getNewHasBaggle
    )
  }
  
  def changeCellContentWrite(changeCellContent: ChangeCellContent): JsValue = {
    var oldContent = changeCellContent.getOldContent
    var newContent = changeCellContent.getNewContent
    Json.obj(
      "oldContent" -> oldContent,
      "newContent" -> newContent
    )
  }
  
  def changeCellColorWrite(changeCellColor: ChangeCellColor): JsValue = {
    var oldColor = changeCellColor.getOldColor
    var newColor = changeCellColor.getNewColor
    Json.obj(
      "oldColor" -> List[Int](oldColor.getRed, oldColor.getGreen, oldColor.getBlue, oldColor.getAlpha),
      "newColor" -> List[Int](newColor.getRed, newColor.getGreen, newColor.getBlue, newColor.getAlpha)
    )
  }
  
  def buggleWorldCellOperationWrite(buggleWorldCellOperation: BuggleWorldCellOperation): JsValue = {
    buggleWorldCellOperation match {
      case changeCellColor: ChangeCellColor =>
        changeCellColorWrite(changeCellColor)
      case changeCellHasBaggle: ChangeCellHasBaggle =>
        changeCellHasBaggleWrite(changeCellHasBaggle)
      case changeCellHasContent: ChangeCellHasContent =>
        changeCellHasContentWrite(changeCellHasContent)
      case changeCellContent: ChangeCellContent =>
        changeCellContentWrite(changeCellContent)
      case _ =>
        Json.obj(
          "operation" -> "arf"    
        )
    }
  }
  
  def gridWorldCellOperationWrite(gridWorldCellOperation: GridWorldCellOperation): JsValue = {
    var json: JsValue = null
    gridWorldCellOperation match {
      case buggleWorldCellOperation: BuggleWorldCellOperation =>
        json = buggleWorldCellOperationWrite(buggleWorldCellOperation)
    }
    json = json.as[JsObject] ++ Json.obj(
        "cell" -> gridWorldCellWrites(gridWorldCellOperation.getCell)
    )
    return json
  }
}