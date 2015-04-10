package json.world

import play.api.libs.json._
import plm.universe.bat.BatWorld
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import plm.universe.bat.BatTest
import json.entity.BatTestToJson

object BatWorldToJson {
  
  def batWorlddWrite(batWorld: BatWorld): JsValue = {    
    var batArray = JsArray()
    
    batWorld.getTests.toArray(Array[BatTest]()).foreach { batTest: BatTest => 
      batArray = batArray.append(BatTestToJson.batTestWrite(batTest))
    }
    
    Json.obj(
      "type" -> "BatWorld",
      "batTests" -> batArray
    )
  }
}