package json

import play.api.libs.json._
import plm.core.model.lesson.Lecture

object ExerciseToJson {

  def exercisesWrite(lectures: Array[Lecture]): JsValue = {
    var array = Json.arr()
    lectures.foreach { root => 
      array = array ++ exerciseWrite(root, "null")
    }
    return array
  }
  
  def exerciseWrite(lecture: Lecture , parentID: String): JsArray = {
    var array = Json.arr(Json.obj(
      "id" -> lecture.getId,
      "name" -> lecture.getName,
      "parent" -> parentID
    ))
    lecture.getDependingLectures.toArray(Array[Lecture]()).foreach { lectBis =>
       array = array ++ exerciseWrite(lectBis, lecture.getName)
    }
    return array
  }
  
}