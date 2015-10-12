package models.lesson

import play.api.libs.json._
import play.api.libs.functional.syntax._
/**
 * @author matthieu
 */

object Lesson {
  implicit val lessonWrites: Writes[Lesson] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "name").write[String] and
    (JsPath \ "description").write[String] and
    (JsPath \ "about").write[String] and
    (JsPath \ "imgUrl").write[String] and
    (JsPath \ "exercises").write[Array[Exercise]]
  )(unlift(Lesson.unapply))
  
  implicit val lessonReads: Reads[Lesson] = (
    (JsPath \ "id").read[String] and
    (JsPath \ "name").read[String] and
    (JsPath \ "description").read[String] and
    (JsPath \ "about").read[String] and
    (JsPath \ "imgUrl").read[String] and
    (JsPath \ "exercises").read[Array[Exercise]]
  )(Lesson.apply _)
  
  implicit val lessonFormat: Format[Lesson] = Format(lessonReads, lessonWrites)
}

case class Lesson(id: String, name: String, description: String, about: String, imgPath: String, exercises: Array[Exercise]) {}