package actors

import akka.actor._
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.Exercise.WorldKind
import play.api.Logger
import plm.core.model.Game
import plm.core.model.lesson.Lesson
import plm.core.model.LogHandler
import plm.core.model.lesson.ExerciseFactory
import plm.core.model.lesson.ExerciseRunner
import json.LectureToJson
import plm.universe.World
import log.PLMLogger
import org.xnap.commons.i18n.I18n
import org.xnap.commons.i18n.I18nFactory
import java.util.Locale
import json.world.WorldToJson
import plm.core.lang.LangJava
import utils.LangUtils
import models.ProgrammingLanguages

/**
 * @author matthieu
 */

object ExercisesActor {
  def props = Props[ExercisesActor]
  val exercisesName: Array[String] = Array( // WARNING, keep ChooseLessonDialog.lessons synchronized
    "Environment"
  )

  val logger: PLMLogger = new PLMLogger
  val i18n: I18n = I18nFactory.getI18n(getClass(),"org.plm.i18n.Messages", new Locale("en"), I18nFactory.FALLBACK);

  val humanLanguages: Array[Locale] = initHumanLanguages
  val exerciseRunner: ExerciseRunner = new ExerciseRunner(logger, i18n)
  val exercisesFactory: ExerciseFactory = new ExerciseFactory(logger, i18n, exerciseRunner, ProgrammingLanguages.programmingLanguages, humanLanguages)
  val exercises: Map[String, Exercise] = initExercises

  case class GetExercise(exerciseName: String)

  def initHumanLanguages(): Array[Locale] = {
    var humanLanguages: Array[Locale] = Array()
    LangUtils.getAvailableLangs().map { lang => 
      humanLanguages = humanLanguages :+ (lang.toLocale)
    }
    humanLanguages
  }

  def initExercises(): Map[String, Exercise] = {
    var exercises: Map[String, Exercise] = Map()

    var exercise: Exercise = Class.forName("environment.Environment").getDeclaredConstructor().newInstance().asInstanceOf[Exercise]
    exercisesFactory.initializeExercise(exercise, ProgrammingLanguages.defaultProgrammingLanguage)
    exercises += ("Environment" -> exercise)

    exercises
  }
}

class ExercisesActor extends Actor {
  import ExercisesActor._

  def receive =  {
    case GetExercise(exerciseName) =>
      sender ! getExercise(exerciseName)
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }
  
  def getExercise(exerciseName: String): Exercise = {
    var exercise: Exercise = exercises.get("Environment").get
    exercisesFactory.cloneExercise(exercise)
  }
}