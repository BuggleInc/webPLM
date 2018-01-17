import plm.core.model.lesson.Lessons
import scala.language.postfixOps
import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext, Promise}
import org.scalatestplus.play._
import com.github.andyglow.websocket.util.Uri
import com.github.andyglow.websocket.{WebsocketClient, WebsocketHandler}
import play.api.libs.json.Json


class RemoteTest extends PlaySpec {
  import TestingHelper._

	val lessons = new Lessons(ClassLoader.getSystemClassLoader, Nil)
  val SERVER_URI = Uri("ws://localhost:9000/websocket")

  "A Running server" must {
		for {
			lesson <- lessons.lessonsList
			lectureId <- lesson.orderedIDs
			lang <- Seq(JAVA, SCALA, PYTHON)
		} {
			"remotely compile exercise "+lectureId+" in "+lang in {
			  
			  remoteExecuteCode(lesson.id, lectureId, lang.getLang, loadSolution(lang, lectureId)) mustBe Success() 
			}
    }
  }

	def remoteExecuteCode(lessonId: String, exerciseId: String, langId: String, code: String): ExecutionResult = {
		val resultPromise = Promise[ExecutionResult]
		val protocolHandler = new WebsocketHandler[String] {
			override def receive: PartialFunction[String, Unit] = {
				case str: String =>
					val json = Json.parse(str)
					val cmd = (json \ "cmd").get.as[String]

					cmd match {
						case "ready" =>
							sender ! Json.obj(
								"cmd" -> "getExercise",
								"args" -> Json.obj(
									"lessonID" -> lessonId,
									"exerciseID" -> exerciseId)).toString()

						case "exercise" =>
							sender ! Json.obj(
								"cmd" -> "setProgLang",
								"args" -> Json.obj(
									"progLang" -> langId)).toString()

						case "newProgLang" =>
							sender ! Json.obj(
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
			client.shutdownAsync(ExecutionContext.global)
		}
	}
}
