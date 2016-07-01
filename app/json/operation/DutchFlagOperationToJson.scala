package json.operation

import play.api.libs.json._
import plm.universe.dutchflag.operations._


object DutchFlagOperationToJson {

  def dutchFlagOperationWrite(dutchFlagOperation: DutchFlagOperation): JsValue =
  {
    var json:JsValue = null
    dutchFlagOperation match {
      case dutchFlagSwap: DutchFlagSwap =>
        json = dutchFlagSwapWrite(dutchFlagSwap)
      case _ => json = Json.obj()
    }
    json = json.as[JsObject] ++ Json.obj(
        "dutchFlagID" -> dutchFlagOperation.getEntity.getName
    )
    json
  }

  def dutchFlagSwapWrite(dutchFlagSwap: DutchFlagSwap): JsValue =
  {
    Json.obj(
        "destination" -> dutchFlagSwap.getDestination,
        "source" -> dutchFlagSwap.getSource
    )
  }
}
