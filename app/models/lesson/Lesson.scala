package models.lesson

import com.google.gson.{JsonArray, JsonElement, JsonObject}
import json.GsonUtil.{getOptionalGsonMember, iterableToGsonArray}

import scala.collection.JavaConverters._


/**
 * @author matthieu
 */
object Lesson {

  def fromJson(json: JsonElement): Lesson = {
    val root = json.getAsJsonObject
    val name = root.get("name")
    new Lesson(
      root.get("id").getAsString,
      getOptionalGsonMember(root, "name").map(_.getAsString),
      root.get("lectures").getAsJsonArray.asScala.map(Lecture.fromJson).toArray
    )
  }

  def arrayToJson(lessons: Array[Lesson], humanLanguageCode: String): JsonArray = {
    iterableToGsonArray(lessons.map(_.toJson(humanLanguageCode)))
  }
}

case class Lesson(id: String, name: Option[String], lectures: Array[Lecture]) {

  val orderedIDs: Array[String] = lectures.view.flatMap(_.orderedIDs).toArray

  var optDescriptions: Option[Map[String, String]] = None

  def containsExercise(exerciseID: String): Boolean = {
    orderedIDs.contains(exerciseID)
  }

  def toJson(languageCode: String): JsonObject = {
    val imgPath: String = "lessons/" + id.replaceAll("\\.", "/") + "/icon.png"
    val descriptions: Map[String, String] = optDescriptions.get
    val defaultDescription: String = descriptions("en")
    val description: String = descriptions.getOrElse(languageCode, defaultDescription)

    val json = new JsonObject()
    json.addProperty("id", id)
    if (name.isDefined) {
      json.addProperty("name", name.get)
    }
    json.addProperty("imgUrl", imgPath)
    json.addProperty("description", description)
    json
  }
}
