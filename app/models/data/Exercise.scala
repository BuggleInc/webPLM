package models.data

import plm.core.utils.FileUtils
import java.io.File
import java.io.IOException
import play.api.Logger
import play.api.libs.json.Json
import play.api.libs.json.JsArray
import play.api.libs.json.JsValue
import models.Global

/**
 * @author Tanguy
 */
object Exercise {
  /**
   * <b>WARNING :</b> Don't use this function unless you know exactly what you're doing.
   * Use Global.getLesson(lessonName : String) or Global.lessonsList.get(lesson : String) instead.<br /><br />
   * This function takes a lesson and retrieves all the exercises' data of this lesson.
   * @param lesson the parent lesson
   * @return The exercise list of this lesson
   */
  private[this] def apply(builder : JsValue) : Exercise = {
    builder match {
      case builder : JsArray =>
        new Exercise(
          (builder.value.head \ "id").toString,
          (builder.value.head \ "api").toString,
          (builder.value.head \ "parent").toString,
          (builder.value.head \ "progLangs").asOpt[JsArray].getOrElse(new JsArray()).value.map(_.toString),
          builder.value.tail.map(builder => apply(builder))
      )
      case builder : JsValue => 
        new Exercise(
          (builder \ "id").toString,
          (builder \ "api").toString,
          (builder \ "parent").toString,
          (builder \ "progLangs").asOpt[JsArray].getOrElse(new JsArray()).value.map(_.toString),
          Seq[Exercise]())
    }
  }
  private[data] def getExercisesList(lesson : Lesson) : Seq[Exercise] = {
    var res : Array[Exercise] = Array [Exercise] ()
    var path = Global.exerciseListPath.replace("/", ""+File.separatorChar) + lesson.id + "-list.json"
    /* Get the StringBuffer for the exercise list */
    var sb : StringBuffer = null
    try {
      sb = FileUtils.readContentAsText(path, null, "json", false)
    } catch {
      case ex : IOException => Logger.error("Could not load exercise list (" + path + ")")
      return res
    }
    /* read it */
    var exoListString = sb.toString()
    var exoListJson = Json.parse(exoListString)
    exoListJson match {
      case exoListJson : JsArray => exoListJson.value.foreach{res :+= apply(_)}
      case _ => 
    }
    res
  }
}
protected class Exercise(var id : String, var api : String, var parent : String, var progLangs : Seq[String], var children : Seq[Exercise]) {
}