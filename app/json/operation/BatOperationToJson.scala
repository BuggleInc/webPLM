package json.operation

import plm.universe.bat.BatOperation
import play.api.libs.json.JsValue
import json.world.BatWorldToJson

object BatOperationToJson {
  
   def batOperationWrite(batOperation: BatOperation): JsValue = {
    return BatWorldToJson.batWorlddWrite(batOperation.getBatWorld)
  }
}