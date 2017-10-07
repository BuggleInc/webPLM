package actors

import akka.actor._
import play.api.Logger
import plm.core.model.lesson.Exercises
/**
 * @author matthieu
 */

object ExercisesActor {
  case class GetExercise(exerciseID: String)

  def props(exercises: Exercises) = Props(new ExercisesActor(exercises))
}

class ExercisesActor(exercises: Exercises) extends Actor {
  import ExercisesActor._

  def receive: PartialFunction[Any, Unit] = {
    case GetExercise(exerciseID) =>
      sender ! exercises.getExercise(exerciseID)
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }
}
