package json.operation

import plm.universe.bat.BatOperation
import play.api.libs.json.JsValue
import json.world.BatWorldToJson
import plm.core.lang.ProgrammingLanguage

object BatOperationToJson {

   def batOperationWrite(batOperation: BatOperation, progLang: ProgrammingLanguage): JsValue = {
    BatWorldToJson.batWorlddWrite(batOperation.getBatWorld, progLang)
  }
}
