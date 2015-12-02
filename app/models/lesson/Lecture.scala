package models.lesson

import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.i18n.Lang

/**
 * @author matthieu
 */
object Lecture {
  implicit lazy val lectureReads: Reads[Lecture] = (
    (JsPath \ "id").read[String] and
    (JsPath \ "names").readNullable[Map[String, String]] and
    (JsPath \ "dependingLectures").lazyRead(Reads.seq[Lecture](lectureReads))
  )(Lecture.apply _)

  def arrayToJson(lectures: Array[Lecture], lang: Lang): JsArray = {
    var jsonLectures: JsArray = Json.arr()
    lectures.foreach { lecture: Lecture =>
      jsonLectures = jsonLectures.append(lecture.toJson(lang))
    }
    jsonLectures
  }
}

case class Lecture(id: String, optNames: Option[Map[String, String]], dependingLectures: Seq[Lecture]) {
  def orderIDs(): Array[String] = {
    var array: Array[String] = Array()
    
    array = array.+:(id)
    
    dependingLectures.foreach { lecture =>
      array = array ++ lecture.orderIDs
    }
    
    array
  }

  def toJson(lang: Lang): JsObject = {
    val names: Map[String, String] = optNames.get
    val defaultName: String = names.get("en").get
    val name: String = names.getOrElse(lang.code, defaultName)
    
    Json.obj(
      "id" -> id,
      "name" -> name,
      "dependingLectures" -> Lecture.arrayToJson(dependingLectures.toArray, lang)
    )
  }
}