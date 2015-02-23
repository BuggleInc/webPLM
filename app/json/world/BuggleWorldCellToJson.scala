package json.world

import play.api.libs.json._
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
}