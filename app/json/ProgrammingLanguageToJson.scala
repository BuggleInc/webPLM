package json

import play.api.libs.json._
import plm.core.lang.ProgrammingLanguage

object ProgrammingLanguageToJson {
  
  def programmingLanguagesWrite(programmingLanguages: Array[ProgrammingLanguage]): JsValue = {
    var array = new JsArray()
    programmingLanguages.foreach { operation =>
      array = array :+ programmingLanguageWrite(operation.getLang)
    }
    return array
  }
  
  def programmingLanguageWrite(lang : String): JsValue = {
    var link: String = "/img/lang_"+ lang.toLowerCase +".png"
    Json.obj(
        "lang" -> lang,
        "icon" -> link
    )
  }
}