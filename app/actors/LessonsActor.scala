package actors

import akka.actor._
import play.api.Logger
import models.lesson.{ Exercise, Lesson}
import scala.io.Source
import play.api.libs.json.{ JsObject, Json, JsValue }


/**
 * @author matthieu
 */

object LessonsActor {
  def props = Props[LessonsActor]

  case class GetLessonsList()
  case class GetExercisesList(lessonName: String)
  case class GetExercise(lessonName: String, exerciseName: String)

  val lessonsName: Array[String] =  Array( // WARNING, keep ChooseLessonDialog.lessons synchronized
    "welcome"//, "maze", "turmites", "turtleart",
    //"sort/basic", "sort/dutchflag", "sort/baseball", "sort/pancake", 
    //"recursion/cons", "recursion/logo", "recursion/hanoi",
    //"bat/string1"
  )

  var lessons: Map[String, Lesson] = Map()
  var orderedLessons: Array[Lesson] = Array[Lesson]()
  
  initLessons

  def initLessons() {
    lessonsName.foreach { lessonName =>
      val lesson: Lesson = loadLesson(lessonName)
      lessons += (lessonName -> lesson)
      orderedLessons = orderedLessons :+ lesson
    }
  }

  def loadLesson(lessonName: String): Lesson = {
    val path: String = "lessons/" + lessonName + "/main.json"
    val lines: String = Source.fromFile(path).mkString
    val json: JsValue = Json.parse(lines)

    json.as[Lesson]
  }
}

class LessonsActor extends Actor {
  import LessonsActor._

  def receive =  {
    case GetLessonsList =>
      Logger.error("Exercise: " + LessonsActor.orderedLessons(0).exercises(0).name)
      sender ! LessonsActor.orderedLessons
    case GetExercisesList(lessonName) =>
      sender ! getLesson(lessonName).get.exercises
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }

  def getLesson(lessonName: String): Option[Lesson] = LessonsActor.lessons.get(lessonName)
}