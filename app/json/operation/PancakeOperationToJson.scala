package json.operation

import play.api.libs.json._
import plm.universe.pancake.operations._
import play.api.Logger


object PancakeOperationToJson {

  def pancakeOperationWrite(pancakeOperation: PancakeOperation): JsValue =
  {
    var json:JsValue = null
    pancakeOperation match {
      case flipOperation: FlipOperation =>
        json = flipOperationWrite(flipOperation)
      case _ => json = Json.obj()
    }
    json = json.as[JsObject] ++ Json.obj(
        "pancakeID" -> pancakeOperation.getEntity.getName
    )
    json
  }

  def flipOperationWrite(flipOperation: FlipOperation): JsValue =
  {
    Json.obj(
        "number" -> flipOperation.getNumber,
        "oldNumber" -> flipOperation.getOldNumber
    )
  }

}
