package actors

import akka.actor._
import play.api.libs.json._
import play.api.mvc.RequestHeader
import play.Logger

import models.PLM
import models.ExecutionResult
import plm.core.model.lesson.Lesson
import plm.core.model.lesson.Lecture

object PLMActor {
  def props(out: ActorRef) = Props(new PLMActor(out))
}

class PLMActor(out: ActorRef) extends Actor {
  def receive = {
    case msg: JsValue =>
      Logger.debug("On arrive ici");
      Logger.debug(msg.toString());
      var cmd: Option[String] = (msg \ "cmd").asOpt[String]
      cmd.getOrElse(None) match {
        case "getLessons" =>
          var mapArgs: JsValue = Json.toJson(Map("lessons" -> Json.toJson(PLM.lessons)))
          var res: JsValue = createMessage("lessons", mapArgs)
          Logger.debug(Json.stringify(res))
          out ! res
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
              var res: JsValue = createMessage("exercise", mapArgs)
              Logger.debug(Json.stringify(res))
              out ! res
            case (_, _) =>
              Logger.debug("getExercise: non-correct JSON")
          }
        case "runExercise" =>
          var optLessonID: Option[String] = (msg \ "args" \ "lessonID").asOpt[String]
          var optExerciseID: Option[String] = (msg \ "args" \ "exerciseID").asOpt[String]
          var optCode: Option[String] = (msg \ "args" \ "code").asOpt[String]
          (optLessonID.getOrElse(None), optExerciseID.getOrElse(None), optCode.getOrElse(None)) match {
            case (lessonID:String, exerciseID: String, code: String) =>
              var mapArgs: JsValue = Json.toJson(Map("result" -> Json.toJson(PLM.runExercise(lessonID, exerciseID, code))))
              var res: JsValue = createMessage("executionResult", mapArgs)
              Logger.debug(Json.stringify(res))
              out ! res
            case (_, _, _) =>
              Logger.debug("runExercise: non-correctJSON")
          }
        case None =>
          Logger.debug("cmd: non-correct JSON")
      }
  }
  
  def createMessage(cmdName: String, mapArgs: JsValue): JsValue = {
    return Json.obj(
      "cmd" -> cmdName,
      "args" -> mapArgs
    )
  }
  
  implicit val executionResultWrites = new Writes[ExecutionResult] {
    def writes(executionResult: ExecutionResult) = Json.obj(
          "msgType" -> executionResult.getMsgType,
          "msg" -> executionResult.getMsg
        )
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