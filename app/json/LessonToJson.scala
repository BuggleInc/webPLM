package json

import play.api.libs.json._
import plm.core.model.lesson.Lesson

object LessonToJson {
  
  def lessonsWrite(lessons: Array[Lesson]): JsValue = {
    var array = new JsArray()
    lessons.foreach { lesson =>
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