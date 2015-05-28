package json.operation

import play.api.libs.json._
import lessons.recursion.hanoi.operations.HanoiOperation
import lessons.recursion.hanoi.operations.HanoiMove

object HanoiOperationToJson {

  def hanoiOperationWrite(hanoiOperation: HanoiOperation): JsValue =
  {
    var json:JsValue = null
    hanoiOperation match {
      case hanoiMove: HanoiMove =>
         json = hanoiMoveWrite(hanoiMove)
      case _ => json = Json.obj()
    }
    json = json.as[JsObject] ++ Json.obj(
        "hanoiID" -> hanoiOperation.getEntity.getName)
        return json
  }
  
  def hanoiMoveWrite(hanoiMove: HanoiMove): JsValue =
  {
    Json.obj(
        "source" -> hanoiMove.getSource,
        "destination" -> hanoiMove.getDestination)
  }
}