package models.lesson

import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.i18n.Lang
/**
 * @author matthieu
 */

object Lesson {
  implicit val lessonReads: Reads[Lesson] = (
    (JsPath \ "id").read[String] and
    (JsPath \ "name").readNullable[String] and
    (JsPath \ "lectures").read[Array[Lecture]] and
    (JsPath \ "optDescriptions").readNullable[Map[String, String]]
  )(Lesson.apply _)
  
  def arrayToJSON(lessons: Array[Lesson], humanLang: Lang): JsArray = {
    var jsonLessons: JsArray = Json.arr()
    lessons.foreach { lesson: Lesson =>
      jsonLessons = jsonLessons.append(lesson.toJson(humanLang))
    }
    jsonLessons
  }
  
}

case class Lesson(id: String, name: Option[String], lectures: Array[Lecture], var optDescriptions: Option[Map[String, String]]) {
  def toJson(lang: Lang): JsObject = {
    val imgPath: String = "lessons/" + id + "/icon.png"
    val descriptions: Map[String, String] = optDescriptions.get
    val defaultDescription: String = descriptions.get("en").get
    val description: String = descriptions.getOrElse(lang.code, defaultDescription)
    
    Json.obj(
      "id" -> id,
      "name" -> name,
      "imgUrl" -> imgPath,
      "description" -> description
    )
  }
}