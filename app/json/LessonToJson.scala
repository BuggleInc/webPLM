package json

import play.api.libs.json._
import models.data.Lesson
import models.DataLoader
import java.util.Locale
import org.xnap.commons.i18n.I18n

object LessonToJson {
  
  def lessonsWrite(lessons: Seq[Lesson], locale : Locale, i18n : I18n): JsValue = {
    var array = new JsArray()
    lessons.foreach { lesson =>
      array = array :+ lessonWrite(lesson, locale, i18n)
    }
    return array
  }
  
  def lessonWrite(lesson: Lesson, locale : Locale, i18n : I18n): JsValue = {
    var dataLoader = new DataLoader
    dataLoader.loadHTMLMission(lesson.id, locale, i18n)
    Json.obj(
      "id" -> lesson.id,
      "name" -> dataLoader.name,
      "description" -> dataLoader.mission,
      "imgUrl" -> ("assets/images/lessonIcons/" + lesson.id + "-icon.png")
    )
  }
}
