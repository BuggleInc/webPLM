package json

import play.api.libs.json._
import plm.core.lang.ProgrammingLanguage

object ProgrammingLanguageToJson {

  def programmingLanguagesWrite(programmingLanguages: Array[ProgrammingLanguage]): JsValue = {
    var array = new JsArray()
    programmingLanguages.foreach { operation =>
      array = array :+ programmingLanguageWrite(operation)
    }
    array
  }

  def programmingLanguageWrite(programmingLanguage: ProgrammingLanguage): JsValue = {
    val lang: String = programmingLanguage.getLang
    val link: String = "/img/lang_"+ lang.toLowerCase +".png"
    Json.obj(
        "lang" -> lang,
        "icon" -> link
    )
  }
}
