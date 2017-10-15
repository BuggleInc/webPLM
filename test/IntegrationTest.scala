import java.util.Locale

import com.github.andyglow.websocket.util.Uri
import com.github.andyglow.websocket.{WebsocketClient, WebsocketHandler}
import org.scalatest.{FunSuite, ParallelTestExecution}
import org.slf4j.{Logger, LoggerFactory}
import play.api.libs.json.Json
import plm.core.lang.{LangJava, LangPython, LangScala, ProgrammingLanguage}
import plm.core.model.lesson.Lessons
import plm.core.model.session.TemplatedSourceFileFactory
import plm.core.utils.FileUtils

import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext, Promise}
import scala.language.postfixOps
import scala.util.matching.Regex

class IntegrationTest extends FunSuite with ParallelTestExecution {
  import IntegrationTest._

  val logger: Logger = LoggerFactory.getLogger(classOf[IntegrationTest])
  val lessons = new Lessons(Nil)

  for {
    lesson <- lessons.lessonsList
    lecture <- lesson.lectures
    lang <- Seq(JAVA, SCALA, PYTHON)
  } {
    test(s"${lesson.id}/${lecture.id}/${lang.getLang} solution succeeds when submitted") {
      assert(executeCode(lesson.id, lecture.id, lang.getLang, loadSolution(lang, lecture.id)) == Success())
    }
  }
}

object IntegrationTest {

  val JAVA = new LangJava(ClassLoader.getSystemClassLoader, false)
  val SCALA = new LangScala(ClassLoader.getSystemClassLoader, false)
  val PYTHON = new LangPython(false)

  val SERVER_URI = Uri("ws://localhost:9000/websocket")
  val TEMPLATE_PATTERN: Regex = raw"(?s).*/\* BEGIN TEMPLATE \*/(.*)/\* END TEMPLATE \*/.*".r
  val SOLUTION_PATTERN: Regex = raw"(?s).*/\* BEGIN SOLUTION \*/(.*)/\* END SOLUTION \*/.*".r
  val PYTHON_TEMPLATE_PATTERN: Regex = raw"(?s).*# BEGIN TEMPLATE(.*)# END TEMPLATE.*".r
  val PYTHON_SOLUTION_PATTERN: Regex = raw"(?s).*# BEGIN SOLUTION(.*)# END SOLUTION.*".r

  def loadSolution(lang: ProgrammingLanguage, exerciseId: String): String = {
    val sourceFileFactory =
      new TemplatedSourceFileFactory(new FileUtils(ClassLoader.getSystemClassLoader), Locale.ENGLISH)
    val sourceFile = sourceFileFactory.newSourceFromFile(exerciseId, lang, exerciseIdToEntityPath(lang, exerciseId))
    extractSolution(lang, sourceFile.getCorrection)
  }

  def exerciseIdToEntityPath(lang: ProgrammingLanguage, exerciseId: String): String = {
    val exercisePathFragments = exerciseId.split(raw"\.")
    val entityDirectory = exercisePathFragments.init.mkString("/")
    val entityName = exercisePathFragments.last
    val langPrefix = if (lang == SCALA) "Scala" else ""
    s"$entityDirectory/$langPrefix${entityName}Entity"
  }

  def extractSolution(lang: ProgrammingLanguage, code: String): String = {
    if (lang == PYTHON) {
      code match {
        case PYTHON_TEMPLATE_PATTERN(solution) => solution
        case PYTHON_SOLUTION_PATTERN(solution) => solution
      }
    } else {
      code match {
        case TEMPLATE_PATTERN(solution) => solution
        case SOLUTION_PATTERN(solution) => solution
      }
    }
  }

  sealed trait ExecutionResult
  case class Success() extends ExecutionResult
  case class Error(message: String) extends ExecutionResult

  def executeCode(lessonId: String, exerciseId: String, langId: String, code: String): ExecutionResult = {
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
