package models.lesson

import com.google.gson.JsonElement
import json.GsonUtil.getOptionalGsonMember

import scala.collection.JavaConverters._


/**
 * @author matthieu
 */
object Lesson {

  def fromJson(json: JsonElement): Lesson = {
    val root = json.getAsJsonObject
    new Lesson(
      root.get("id").getAsString,
      getOptionalGsonMember(root, "name").map(_.getAsString),
      root.get("lectures").getAsJsonArray.asScala.map(Lecture.fromJson).toArray
    )
  }
}

case class Lesson(id: String, name: Option[String], lectures: Array[Lecture]) {

  val orderedIDs: Array[String] = lectures.view.flatMap(_.orderedIDs).toArray

  var optDescriptions: Option[Map[String, String]] = None

  def containsExercise(exerciseID: String): Boolean = {
    orderedIDs.contains(exerciseID)
  }
}
