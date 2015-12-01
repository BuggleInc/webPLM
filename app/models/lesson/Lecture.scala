package models.lesson

import play.api.libs.json._
import play.api.libs.functional.syntax._


/**
 * @author matthieu
 */
object Lecture {
  implicit lazy val lectureWrites: Writes[Lecture] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "name").write[String] and
    (JsPath \ "dependingLectures").lazyWrite(Writes.seq[Lecture](lectureWrites))
  )(unlift(Lecture.unapply))
  
  implicit lazy val lectureReads: Reads[Lecture] = (
    (JsPath \ "id").read[String] and
    (JsPath \ "name").read[String] and
    (JsPath \ "dependingLectures").lazyRead(Reads.seq[Lecture](lectureReads))
  )(Lecture.apply _)
  
  implicit val lectureFormat: Format[Lecture] = Format(lectureReads, lectureWrites)
}

case class Lecture(id: String, name: String, dependingLectures: Seq[Lecture]) {}