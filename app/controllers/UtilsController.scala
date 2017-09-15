package controllers

import actors.ExercisesActor
import play.api.mvc._
import akka.actor.ActorRef
import akka.actor.ActorSystem
import com.google.inject.Inject
import models.lesson.Exercises

class UtilsController @Inject() (system: ActorSystem, exercises: Exercises) extends Controller {
  
  val exercisesActor: ActorRef = system.actorOf(ExercisesActor.props(exercises))
  
  def exportExercises = Action {
    exercisesActor ! ExercisesActor.ExportExercises
    Ok("It's done")
  }
  
  def exportExercise(exerciseID: String) = Action {
    exercisesActor ! ExercisesActor.ExportExercise(exerciseID)
    Ok("It's done")
  }
}