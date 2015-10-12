package models.lesson

import play.api.libs.json._
import play.api.libs.functional.syntax._


/**
 * @author matthieu
 */
object Exercise {
  implicit val exerciseWrites: Writes[Exercise] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "name").write[String] and
    (JsPath \ "mission").write[String]
  )(unlift(Exercise.unapply))
  
  implicit val exerciseReads: Reads[Exercise] = (
    (JsPath \ "id").read[String] and
    (JsPath \ "name").read[String] and
    (JsPath \ "mission").read[String]
  )(Exercise.apply _)
  
  implicit val exerciseFormat: Format[Exercise] = Format(exerciseReads, exerciseWrites)
  
  def fromJson(json: JsValue): Exercise = {
    json.as[Exercise]
  }
}

case class Exercise(id: String, name: String, mission: String) {}