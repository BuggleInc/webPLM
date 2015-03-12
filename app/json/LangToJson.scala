package json

import play.api.libs.json._
import play.api.i18n.Lang


object LangToJson {
  
  def langWrite(lang: Lang): JsValue = {
    Json.obj(
      "code" -> lang.code,
      "name" -> lang.toLocale.getDisplayLanguage
    )
  }

  def langsWrite(langs: Seq[Lang]): JsValue = {
    var array = new JsArray()
    langs.foreach { lang =>
      array = array :+ langWrite(lang)
    }
    return array
  }
}