package models

import org.xnap.commons.i18n.I18n
import org.xnap.commons.i18n.I18nFactory
import java.util.Locale
import play.api.i18n.Lang
import plm.core.utils.FileUtils
import java.io.IOException
import java.io.File
import play.api.Logger
import play.libs.Json
import models.data.Lesson

/**
 * @author Tanguy
 */
object Global {
/**
 * The lessons and exercises path, using a "/" as path separator
 * TODO : don't statically attribute these values, use a property value instead.
 */
  val lessonsListPath : String = "webPLMData/lessonList"
  val exerciseListPath : String = "webPLMData/lessons."
  
  
// i18n handling. The I18n objects are both created globally and used when needed.
  var i18n_fr : I18n = I18nFactory.getI18n(getClass(),"org.plm.i18n.Messages", Locale.FRENCH, I18nFactory.FALLBACK);
  var i18n_en : I18n = I18nFactory.getI18n(getClass(),"org.plm.i18n.Messages", Locale.ENGLISH, I18nFactory.FALLBACK);
  
  def getI18n(lang : Lang) : I18n = {
    lang.code match {
      case "fr" => i18n_fr
      case "en" => i18n_en
      case _ => null
    }
  }
// data structures. They are loaded at PLM launch and only used when asked.
  var lessonsList : Seq[Lesson] = Lesson.getLessonsList()
  /**
   * Retrieves the lesson object by its ID.
   * @param id the lesson ID
   * @return the related lesson.
   */
  def getLessonById(id : String) : Option[Lesson] = {
    lessonsList.find { lesson => lesson.id == id }
  }
}