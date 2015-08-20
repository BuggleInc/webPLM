package models.data

import play.api.libs.json.JsValue
import java.io.File
import java.io.IOException
import plm.core.utils.FileUtils
import play.api.Logger
import play.api.libs.json.Json
import models.Global
import play.api.libs.json.JsArray

/**
 * @author Tanguy
 */
object Lesson {
  /**
   * Builds a lesson from a {@link JsValue} value.
   */
  private[this] def apply(builder : JsValue) =
      new Lesson(
            (builder \ "imgUrl").asOpt[String].getOrElse(""),
            (builder \ "id").asOpt[String].getOrElse("")
          )
  /**
   * <b>Warning</b> : Unless you know exactly what you're doing don't call this function; use Global.lessonsList instead.<br /><br />
   * Generates a list of lessons from the pre-generated files.
   * @return a sorted Lesson sequence containing both lessons and exercises.
   */
  private[models] def getLessonsList() : Seq[Lesson] = {
    var res : Array[Lesson] = Array [Lesson] ()
    var path = Global.lessonsListPath.replace("/", ""+File.separatorChar) + ".json"
    /* Get StringBuffer for the lesson list */
    var sb : StringBuffer = null
    try {
      sb = FileUtils.readContentAsText(path, null, "json", false)
    } catch {
      case ex : IOException => Logger.error("Could not load lessons list (" + path + ")")
      return res
    }
    /* read it */
    var lessonListString = sb.toString()
    var lessonListJson = Json.parse(lessonListString)
    lessonListJson match {
      case lessonListJson : JsArray => lessonListJson.value.foreach{res :+= apply(_)}
      case _ => 
    }
    res
  }
}
class Lesson(var imgUrl : String, var id : String) {
  var exerciseList : Seq[Exercise] = Exercise.getExercisesList(this)
  def getExerciseById(id : String) : Option[Exercise] = {
    exerciseList.find { exercise => exercise.id == id }
  }
  def getFirstExercise = exerciseList.head;
}