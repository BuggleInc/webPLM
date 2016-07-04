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
    (JsPath \ "lectures").read[Array[Lecture]]
  )(Lesson.apply _)
  
  def arrayToJson(lessons: Array[Lesson], humanLang: Lang): JsArray = {
    var jsonLessons: JsArray = Json.arr()
    lessons.foreach { lesson: Lesson =>
      jsonLessons = jsonLessons.append(lesson.toJson(humanLang))
    }
    jsonLessons
  }
}

case class Lesson(id: String, name: Option[String], lectures: Array[Lecture]) {

  val orderedIDs: Array[String] = orderIDs

  var optDescriptions: Option[Map[String, String]] = None

  def orderIDs(): Array[String] = {
    var array: Array[String] = Array()

    lectures.foreach { lecture =>
      array = array ++ lecture.orderIDs
    }

    array
  }

  def containsExercise(exerciseID: String): Boolean = {
    orderedIDs.contains(exerciseID)
  }

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
