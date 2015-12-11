package json.world

import play.api.libs.json._
import plm.universe.bat.BatWorld
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import plm.universe.bat.BatTest
import json.entity.BatTestToJson
import plm.core.lang.ProgrammingLanguage

object BatWorldToJson {
  
  def batWorlddWrite(batWorld: BatWorld, progLang: ProgrammingLanguage): JsValue = {    
    var batArray = JsArray()
    
    batWorld.getTests.toArray(Array[BatTest]()).foreach { batTest: BatTest => 
      batArray = batArray.append(BatTestToJson.batTestWrite(batTest, progLang))
    }
    Json.obj(
      "type" -> "BatWorld",
      "batTests" -> batArray
    )
  }
}