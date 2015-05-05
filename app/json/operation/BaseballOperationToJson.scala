  package json.operation

import play.api.libs.json._
import lessons.sort.baseball.operations._

object BaseballOperationToJson {
  
  def baseballOperationWrite(baseballOperation: BaseballOperation): JsValue =
  {
    var json:JsValue = null
    baseballOperation match
    {
      case moveOperation: MoveOperation =>
         json = moveOperationWrite(moveOperation)
      case _ => json = Json.obj()
    }
    
    json = json.as[JsObject] ++ Json.obj(
        "baseballID" -> baseballOperation.getEntity.getName)
        return json
  }
  
  def moveOperationWrite(moveOperation: MoveOperation): JsValue =
  {
    Json.obj(
        "base" -> moveOperation.getBase,
        "position" -> moveOperation.getPosition,
        "oldBase" -> moveOperation.getOldBase,
        "oldPosition" -> moveOperation.getOldPosition)
  }

}