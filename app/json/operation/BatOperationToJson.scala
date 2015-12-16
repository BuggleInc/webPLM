package json.operation

import plm.universe.bat.operations.{ BatOperation, SetResult }
import play.api.libs.json._
import plm.core.lang.ProgrammingLanguage
import models.ProgrammingLanguages

object BatOperationToJson {

  def batOperationWrite(batOperation: BatOperation, progLang: ProgrammingLanguage): JsValue = {
    var json: JsValue = null
    batOperation match {
    case setResult: SetResult =>
      json = setResultWrite(setResult, progLang)
    case _ =>
      json = Json.obj()
    }
    json
  }
  
  def setResultWrite(setResult: SetResult, progLang: ProgrammingLanguage): JsValue = {
    Json.obj(
      "index" -> setResult.getIndex(),
      "result" -> setResult.getBatTest.getResult(ProgrammingLanguages.defaultProgrammingLanguage),
      "displayedResult" -> setResult.getBatTest.getResult(progLang)
    )
  }
}
