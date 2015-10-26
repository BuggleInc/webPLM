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
    (JsPath \ "name").read[String] and
    (JsPath \ "lectures").read[Array[Lecture]] and
    (JsPath \ "descriptions").readNullable[Map[String, String]]
  )(Lesson.apply _)
  
}

case class Lesson(id: String, name: String, lectures: Array[Lecture], var descriptions: Option[Map[String, String]]) {
  def toJson(lang: Lang): JsObject = {
    val imgPath: String = "lessons/" + id + "/icon.png"
    val description: Option[String] = (descriptions.get).get(lang.code)
    
    Json.obj(
      "id" -> id,
      "name" -> name,
      "imgUrl" -> imgPath,
      "description" -> description
    )
  }
}