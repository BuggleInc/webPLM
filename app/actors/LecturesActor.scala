package actors

import models.PLMLesson
import plm.core.model.lesson.Lecture
import akka.actor._
import play.api.libs.json._

abstract class LecturesActor extends Actor {
  /*
  def receive = {
    case ListExercises(id: String) =>
      sender() ! Json.toJson(PLMLesson.exercises(id))
  }
  
  implicit val lectureWrites = new Writes[Lecture] {
    def writes(lecture: Lecture) = Json.obj(
          "id" -> lecture.getId
        )
  }
  * 
  */
}

//case class ListExercises(id: String)