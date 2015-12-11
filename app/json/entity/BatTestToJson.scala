package json.entity

import play.api.libs.json.JsValue
import plm.universe.bat.BatTest
import play.api.libs.json.Json
import plm.core.lang.ProgrammingLanguage

object BatTestToJson {
  
  def batTestWrite(batTest: BatTest, progLang: ProgrammingLanguage): JsValue = {
    Json.obj(
      "test" -> batTest.formatAsString(progLang),
      "answered" -> batTest.isAnswered,
      "correct" -> batTest.isCorrect,
      "visible" -> batTest.isVisible()
    )
  }
}