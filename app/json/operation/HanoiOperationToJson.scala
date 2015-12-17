package json.operation

import play.api.libs.json._
import plm.universe.hanoi.operations.{ HanoiMove, HanoiOperation }

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
    json
  }

  def hanoiMoveWrite(hanoiMove: HanoiMove): JsValue =
  {
    Json.obj(
        "source" -> hanoiMove.getSource,
        "destination" -> hanoiMove.getDestination)
  }
}
