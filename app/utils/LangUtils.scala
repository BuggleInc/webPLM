package utils

import play.api.Play.current
import play.api.i18n.Lang
import play.api.mvc.RequestHeader

object LangUtils {
  
  def langIsAvailable(code: String): Boolean = {
    Lang.availables.exists { lang => lang.code == code }
  }
  
  def getPreferredLang(request: RequestHeader): Lang = {
    var preferredLang: Lang = Lang.preferred(request.acceptLanguages)
    var cookieLangCode: String = CookieUtils.getCookieValue(request, "lang")
    if(langIsAvailable(cookieLangCode)) {
      preferredLang = Lang(cookieLangCode)
    }
    preferredLang
  }
}