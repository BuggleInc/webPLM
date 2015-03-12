package json

import play.api.libs.json._
import play.api.i18n.Lang

object LangToJson {
  
  def langWrite(lang: Lang): JsValue = {
    var link = "/assets/images/"+lang.code+".png"
    Json.obj(
      "icon" -> link,
      "code" -> lang.code,
      "name" -> lang.toLocale.getDisplayName(lang.toLocale).capitalize
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