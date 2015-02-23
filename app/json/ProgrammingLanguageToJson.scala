package json

import play.api.libs.json._
import plm.core.lang.ProgrammingLanguage

object ProgrammingLanguageToJson {
  
  def programmingLanguagesWrite(programmingLanguages: Array[ProgrammingLanguage]): JsValue = {
    var array = new JsArray()
    programmingLanguages.foreach { operation =>
      array = array :+ programmingLanguageWrite(operation)
    }
    return array
  }
  
  def programmingLanguageWrite(programmingLanguage: ProgrammingLanguage): JsValue = {
    var lang: String = programmingLanguage.getLang
    var link: String = "/img/lang_"+ lang.toLowerCase +".png"
    Json.obj(
        "lang" -> lang,
        "icon" -> link
    )
  }
}