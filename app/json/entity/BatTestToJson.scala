package json.entity

import play.api.libs.json.JsValue
import plm.universe.bat.BatTest
import play.api.libs.json.Json

object BatTestToJson {
  
  def batTestWrite(batTest: BatTest): JsValue = {
    Json.obj(
      "test" -> batTest.formatAsString,
      "answered" -> batTest.isAnswered,
      "correct" -> batTest.isCorrect,
      "visible" -> batTest.isVisible()
    )
  }
}