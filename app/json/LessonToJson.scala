package json

import play.api.libs.json._
import plm.core.model.lesson.Lesson
import java.util.Map
import plm.core.model.Game

object LessonToJson {
  
  def lessonsWrite(lessons: Map[String, Lesson]): JsValue = {
    var array = new JsArray()
    Game.lessonsName.foreach { lessonName =>
      var lesson: Lesson = lessons.get(lessonName)
      array = array :+ lessonWrite(lesson)
    }
    return array
  }
  
  def lessonWrite(lesson: Lesson): JsValue = {
    Json.obj(
      "id" -> lesson.getId,
      "description" -> lesson.getDescription,
      "imgUrl" -> lesson.getImgPath
    )
  }
}