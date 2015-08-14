package utils

import play.api.mvc._

object CookieUtils {
  def getCookieValue(request: RequestHeader, cookieName: String): String = {
     getOrElseCookieValue(request, cookieName, "")
  }
  
  def getOrElseCookieValue(request: RequestHeader, cookieName: String, defaultValue: String): String = {
     request.cookies.get(cookieName).getOrElse(None) match {
      case cookie: Cookie =>
        return cookie.value
      case _ =>
        return defaultValue
     }
  }
}