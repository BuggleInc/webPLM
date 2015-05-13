package json.world

import play.api.libs.json._
import plm.universe.sort.SortingWorld
import javax.swing.plaf.basic.BasicListUI.Actions
import plm.universe.sort.Action

object SortWorldToJson {
  
  def sortWorldWrite(sortingWorld: SortingWorld): JsValue = {
    Json.obj(
        "type" -> "SortingWorld",
        "values" -> sortingWorld.getValues,
        "readCount" -> sortingWorld.getReadCount,
        "writeCount" -> sortingWorld.getWriteCount
    )   
  }

}