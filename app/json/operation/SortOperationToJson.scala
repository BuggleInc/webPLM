package json.operation

import play.api.libs.json._
import plm.universe.sort.operations._


object SortOperationToJson {

	def sortOperationWrite(sortOperation: SortOperation): JsValue =
	{
		var json:JsValue = null
		sortOperation match {
      case setValOperation: SetValOperation =>
        json = setValOperationWrite(setValOperation)
      case swapOperation: SwapOperation =>
        json = swapOperationWrite(swapOperation)
      case copyOperation: CopyOperation =>
        json = copyOperationWrite(copyOperation)
      case countOperation: CountOperation =>
        json = countOperationWrite(countOperation)
      case getValueOperation : GetValueOperation =>
        json = getValueOperationWrite(getValueOperation)
      case _ => json = Json.obj()
    }
    json = json.as[JsObject] ++ Json.obj(
        "sortID" -> sortOperation.getEntity.getName
    )
    return json 
  }
  
  def swapOperationWrite(swapOperation: SwapOperation): JsValue =
  {
    Json.obj(
      "destination" -> swapOperation.getDestination(),
      "source" -> swapOperation.getSource()
    )
	}
  
  def copyOperationWrite(copyOperation: CopyOperation): JsValue =
  {
    Json.obj(
      "destination" -> copyOperation.getDestination(),
      "source" -> copyOperation.getSource(),
      "oldValue" -> copyOperation.getOldValue()
    )
  }
  
  def setValOperationWrite(setValOperation: SetValOperation): JsValue =
  {
    Json.obj(
        "value" -> setValOperation.getValue(),
        "oldValue" -> setValOperation.getOldValue(),
        "position" -> setValOperation.getPosition()
    )
  }
  
  def countOperationWrite(countOperation: CountOperation): JsValue =
  {
    Json.obj(
        "read" -> countOperation.getRead(),
        "write" -> countOperation.getWrite(),
        "oldRead" -> countOperation.getOldRead(),
        "oldWrite" -> countOperation.getOldWrite()
    )
  }
  
  def getValueOperationWrite(getValueOperation: GetValueOperation): JsValue =
  {
    Json.obj(
        "position" -> getValueOperation.getPosition()
    )
  }
}