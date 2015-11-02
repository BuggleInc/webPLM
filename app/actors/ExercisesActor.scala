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

  
  var humanLanguages: Array[Locale] = Array()
  LangUtils.getAvailableLangs().map { lang => 
    humanLanguages = humanLanguages :+ (lang.toLocale)
  }
  
  val exerciseRunner: ExerciseRunner = new ExerciseRunner(logger, i18n)
  val exercisesFactory: ExerciseFactory = new ExerciseFactory(logger, i18n, exerciseRunner, Game.programmingLanguages, humanLanguages)

  case class GetExercise(exerciseName: String)

  var exercises: Map[String, Exercise] = Map()

  initExercises

  def initExercises() {
    var exercise: Exercise = Class.forName("environment.Environment").getDeclaredConstructor().newInstance().asInstanceOf[Exercise]
    exercisesFactory.initializeExercise(exercise, Game.JAVA.asInstanceOf[LangJava])
    Logger.error("exercise: "+ exercise.getWorlds(WorldKind.ANSWER).get(0).getName)
    Logger.error("exercise: "+ WorldToJson.worldWrite(exercise.getWorlds(WorldKind.ANSWER).get(0)))
    exercises += ("Environment" -> exercise)
    
    exerciseRunner.run(exercise, Game.JAVA.asInstanceOf[LangJava], "recule();")
    Logger.error("exercise: "+ WorldToJson.worldWrite(exercise.getWorlds(WorldKind.CURRENT).get(0)))
  }
}

class ExercisesActor extends Actor {
  import ExercisesActor._

  def receive =  {
    case GetExercise(exerciseName) =>
      sender ! exercises.get("Environment").get
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }
}