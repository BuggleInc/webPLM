package actors

import akka.actor._
import play.api.libs.json._
import play.api.mvc.RequestHeader
import play.Logger

import models.PLM
import spies.ExecutionResultSpy
import plm.core.model.lesson.Lesson
import plm.core.model.lesson.Lecture

object PLMActor {
  def props(out: ActorRef) = Props(new PLMActor(out))
}

class PLMActor(out: ActorRef) extends Actor {
  
  var isProgressSpyAdded: Boolean = false
  var resultSpy: ExecutionResultSpy = new ExecutionResultSpy(this)
  PLM.addProgressSpyListener(resultSpy)
  
  def receive = {
    case msg: JsValue =>
      Logger.debug("Received a message");
      Logger.debug(msg.toString());
      var cmd: Option[String] = (msg \ "cmd").asOpt[String]
      cmd.getOrElse(None) match {
        case "getLessons" =>
          var mapArgs: JsValue = Json.toJson(Map("lessons" -> Json.toJson(PLM.lessons)))
          sendMessage("lessons", mapArgs)
        case "getExercise" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String) =>
              var mapArgs: JsValue = Json.toJson(Map("exercise" -> Json.toJson(PLM.switchExercise(lessonID, exerciseID))))
              var res: JsValue = createMessage("exercise", mapArgs)
              Logger.debug(Json.stringify(res))
              out ! res
            case (lessonID:String, _) =>
              var mapArgs: JsValue = Json.toJson(Map("exercise" -> Json.toJson(PLM.switchLesson(lessonID))))
              sendMessage("exercise", mapArgs)
            case (_, _) =>
              Logger.debug("getExercise: non-correct JSON")
          }
        case "runExercise" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          var optCode: Option[String] = (msg \ "args" \ "code").asOpt[String]
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None), optCode.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String, code: String) =>
              PLM.runExercise(lessonID, exerciseID, code)
            case (_, _, _) =>
              Logger.debug("runExercise: non-correctJSON")
          }
        case _ =>
          Logger.debug("cmd: non-correct JSON")
      }
  }
  
  def createMessage(cmdName: String, mapArgs: JsValue): JsValue = {
    return Json.obj(
      "cmd" -> cmdName,
      "args" -> mapArgs
    )
  }
  
  def sendMessage(cmdName: String, mapArgs: JsValue) {
    out ! createMessage(cmdName, mapArgs)
  }
  
  override def postStop() = {
    Logger.debug("postStop: websocket closed - removing the resultSpy")
    PLM.removeProgressSpyListener(resultSpy)
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