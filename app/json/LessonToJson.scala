package json

import play.api.libs.json.{JsArray, JsValue, Json}
import plm.core.model.lesson.Lesson

object LessonToJson {
  def lessonWrite(lesson: Lesson, languageCode: String): JsValue = {
    val imgPath: String = "lessons/" + lesson.id.replaceAll("\\.", "/") + "/icon.png"
    val descriptions: Map[String, String] = lesson.descriptions
    val defaultDescription: String = descriptions("en")
    val description: String = descriptions.getOrElse(languageCode, defaultDescription)

    Json.obj(
      "id" -> lesson.id,
      "name" -> lesson.name,
      "imgUrl" -> imgPath,
      "description" -> description
    )
  }

  def lessonsWrite(lessons: Traversable[Lesson], languageCode: String): JsArray = {
    JsArray(lessons.map(lessonWrite(_, languageCode)).toSeq)
  }
}
