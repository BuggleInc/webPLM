import java.util.Locale

import com.github.andyglow.websocket.util.Uri
import com.github.andyglow.websocket.{WebsocketClient, WebsocketHandler}
import models.lesson.Lessons
import org.scalatest.{FunSuite, ParallelTestExecution}
import org.slf4j.{Logger, LoggerFactory}
import play.api.libs.json.Json
import plm.core.lang.LangJava
import plm.core.model.session.TemplatedSourceFileFactory

import scala.concurrent.duration._
import scala.concurrent.{Await, Promise}
import scala.language.postfixOps
import scala.util.matching.Regex

class IntegrationTest extends FunSuite with ParallelTestExecution {
  import IntegrationTest._

  val logger: Logger = LoggerFactory.getLogger(classOf[IntegrationTest])
  val lessons = new Lessons(logger, Nil)

  for {
    lesson <- lessons.lessonsList
    lecture <- lesson.lectures
  } {
    test(s"${lesson.id}/${lecture.id} solution succeeds when submitted") {
      assert(executeCode(lesson.id, lecture.id, loadSolution(lecture.id)) == Success())
    }
  }
}

object IntegrationTest {

  val SERVER_URI = Uri("ws://localhost:9000/websocket")
  val SOLUTION_PATTERN: Regex = raw"(?s).*/\* BEGIN TEMPLATE \*/(.*)/\* END TEMPLATE \*/.*".r

  def loadSolution(exerciseId: String): String = {
    val sourceFileFactory = new TemplatedSourceFileFactory(Locale.ENGLISH)
    val exercisePath = exerciseId.replaceAll(raw"\.", "/")
    val sourceFile =
      sourceFileFactory.newSourceFromFile(exerciseId, new LangJava(false), s"exercises/${exercisePath}Entity")
    sourceFile.getCorrection match {
      case SOLUTION_PATTERN(code) => code
    }
  }

  sealed trait ExecutionResult
  case class Success() extends ExecutionResult
  case class Error(message: String) extends ExecutionResult

  def executeCode(lessonId: String, exerciseId: String, code: String): ExecutionResult = {
    val resultPromise = Promise[ExecutionResult]
    val protocolHandler = new WebsocketHandler[String] {
      override def receive: PartialFunction[String, Unit] = {
        case str: String =>
          val json = Json.parse(str)
          val cmd = (json \ "cmd").get.as[String]

          cmd match {
            case "ready" =>
              sender() ! Json.obj(
                "cmd" -> "getExercise",
                "args" -> Json.obj(
                  "lessonID" -> lessonId,
                  "exerciseID" -> exerciseId)).toString()

            case "exercise" =>
              sender() ! Json.obj(
                "cmd" -> "runExercise",
                "args" -> Json.obj("code" -> code)).toString()

            case "executionResult" =>
              resultPromise.success(
                (json \ "args" \ "msgType").get.as[Int] match {
                  case 1 => Success()
                  case _ => Error((json \ "args" \ "msg").get.as[String])
                })

            case _ =>
          }
      }
    }
    val client = WebsocketClient(SERVER_URI, protocolHandler, maxFramePayloadLength = Int.MaxValue)
    client.open()
    try {
      Await.result(resultPromise.future, 1 minute)
    } finally {
      client.shutdownSync()
    }
  }
}