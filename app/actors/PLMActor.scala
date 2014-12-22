package actors

import akka.actor._
import play.api.libs.json._

import models.PLM
import plm.core.model.lesson.Lesson
import plm.core.model.lesson.Lecture

case class ListLessons()
case class ListProgrammingLanguages()
case class SwitchLesson(lessonName: String)
case class SwitchExercise(lessonID: String, exerciseID: String)

class PLMActor extends Actor {

  def receive = {
    case ListLessons() =>
      sender() ! Json.toJson(PLM.lessons)
    case ListProgrammingLanguages() =>
      sender() ! Json.toJson(PLM.programmingLanguages)
    case SwitchLesson(lessonName: String) =>
      sender() ! Json.toJson(PLM.switchLesson(lessonName))
    case SwitchExercise(lessonID: String, exerciseID: String) =>
      sender() ! Json.toJson(PLM.switchExercise(lessonID, exerciseID))
  }
  
  implicit val lessonWrites = new Writes[Lesson] {
    def writes(lesson: Lesson) = Json.obj(
          "id" -> lesson.getId,
          "description" -> lesson.getDescription,
          "imgUrl" -> lesson.getImgPath
        )
  }
  
  implicit val lectureWrites = new Writes[Lecture] {
    def writes(lecture: Lecture) = Json.obj(
          "id" -> lecture.getId,
          "description" -> lecture.getMission(PLM.programmingLanguage),
          "code" -> PLM.getStudentCode
        )
  }
  
}