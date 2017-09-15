package actors

import akka.actor._
import models.lesson.Exercises
import play.api.Logger
/**
 * @author matthieu
 */

object ExercisesActor {
  case class GetExercise(exerciseID: String)
  case class ExportExercises()
  case class ExportExercise(exerciseID: String)

  def props(exercises: Exercises) = Props(new ExercisesActor(exercises))
}

class ExercisesActor(exercises: Exercises) extends Actor {
  import ExercisesActor._

  def receive: PartialFunction[Any, Unit] = {
    case GetExercise(exerciseID) =>
      sender ! exercises.getExercise(exerciseID)
    case ExportExercises =>
      exercises.exportExercises()
    case ExportExercise(exerciseID) =>
      exercises.exportExercise(exerciseID)
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }
}
