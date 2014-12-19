package actors

import models.PLMLesson
import plm.core.model.lesson.Lesson
import akka.actor._
import play.api.libs.json._

abstract class LessonsActor extends Actor {
  
  /*
  def receive = {
    case ListLessons() =>
      sender() ! Json.toJson(PLMLesson.lessons)
    case SwitchLesson(id: String) =>
      PLMLesson.
  }
  
  implicit val lessonWrites = new Writes[Lesson] {
    def writes(lesson: Lesson) = Json.obj(
          "id" -> lesson.getId,
          "description" -> lesson.getDescription,
          "imgUrl" -> lesson.getImgPath
        )
  }
  *
  */
}