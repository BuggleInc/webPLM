package actors

import GitActor._
import scala.collection.mutable.HashMap
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.language.postfixOps
import akka.actor._
import akka.pattern.ask
import akka.pattern.pipe
import scala.concurrent.ExecutionContext.Implicits.global
import akka.util.Timeout
import plm.core.lang.ProgrammingLanguage
import plm.core.model.lesson.Exercise
import play.api.Logger

/**
 * @author matthieu
 */

object SessionActor {
  def props(gitActor: ActorRef, programmingLanguages: Array[ProgrammingLanguage]) = Props(new SessionActor(gitActor, programmingLanguages))

  implicit val timeout = Timeout(5 seconds)

  case class RetrieveCode(exercise: Exercise, progLang: ProgrammingLanguage)
  case class SetCode(exercise: Exercise, progLang: ProgrammingLanguage, code: String)
  case class IsExercisePassed(exercise: Exercise, progLang: ProgrammingLanguage)
}

class SessionActor(gitActor: ActorRef, programmingLanguages: Array[ProgrammingLanguage]) extends Actor {
  import SessionActor._

  val exercisesCodes: HashMap[String, HashMap[ProgrammingLanguage, String]] = new HashMap[String, HashMap[ProgrammingLanguage, String]]
  val exercisesPassed: HashMap[String, HashMap[ProgrammingLanguage, Boolean]] = new HashMap[String, HashMap[ProgrammingLanguage, Boolean]]

  def receive =  {
    case RetrieveCode(exercise, progLang) =>
      val exerciseCodes: HashMap[ProgrammingLanguage, String] = exercisesCodes.getOrElseUpdate(exercise.getId, new HashMap[ProgrammingLanguage, String])
      exerciseCodes.get(progLang) match {
        case Some(code: String) =>
          sender ! code
        case _ =>
          // Not retrieved yet from Git
          initFromGit(exercise, progLang)
      }
    case SetCode(exercise, progLang, code) =>
      setCode(exercise, progLang, code)
    case IsExercisePassed(exercise, progLang) =>
      val exercisePassed: HashMap[ProgrammingLanguage, Boolean] = exercisesPassed.getOrElseUpdate(exercise.getId, new HashMap[ProgrammingLanguage, Boolean])
      exercisePassed.get(progLang) match {
        case Some(passed: Boolean) =>
          sender ! passed
        case _ =>
          passedFromGit(exercise, progLang)
      }
    case _ =>
  }

  def initFromGit(exercise: Exercise, progLang: ProgrammingLanguage) {
    val plmActor: ActorRef = sender
    (gitActor ? RetrieveCodeFromGit(exercise.getId, progLang)).mapTo[Option[String]].map { optCode =>
      optCode match {
        case Some(code: String) =>
          setCode(exercise, progLang, code)
          plmActor ! code
        case _ =>
          val code: String = exercise.getDefaultSourceFile(progLang).getBody
          setCode(exercise, progLang, code)
          plmActor ! code
      }
    }
  }

  def passedFromGit(exercise: Exercise, progLang: ProgrammingLanguage): Unit = {
    val actor: ActorRef = sender
    (gitActor ? GitActor.IsExercisePassed(exercise.getId, progLang)).mapTo[Boolean].map { passed =>
      setPassed(exercise, progLang, passed)
      actor ! passed
    }
  }
  
  def setCode(exercise: Exercise, progLang: ProgrammingLanguage, code: String) {
    val exerciseCodes: HashMap[ProgrammingLanguage, String] = exercisesCodes.getOrElseUpdate(exercise.getId, new HashMap[ProgrammingLanguage, String])
    exerciseCodes.put(progLang, code)
  }

  def setPassed(exercise: Exercise, progLang: ProgrammingLanguage, passed: Boolean) {
    val exercisePassed: HashMap[ProgrammingLanguage, Boolean] = exercisesPassed.getOrElseUpdate(exercise.getId, new HashMap[ProgrammingLanguage, Boolean])
    exercisePassed.put(progLang, passed)
  }
}
