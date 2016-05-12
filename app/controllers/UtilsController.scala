package controllers

import actors.ExercisesActor
import play.api.mvc._
import akka.actor.ActorRef
import akka.actor.ActorSystem
import com.google.inject.Inject

class UtilsController @Inject() (system: ActorSystem) extends Controller {
  
  val exercisesActor: ActorRef = system.actorOf(ExercisesActor.props)
  
  def exportExercises = Action {
    exercisesActor ! ExercisesActor.ExportExercises
    Ok("It's done")
  }
  
  def exportExercise(exerciseID: String) = Action {
    exercisesActor ! ExercisesActor.ExportExercise(exerciseID)
    Ok("It's done")
  }
}