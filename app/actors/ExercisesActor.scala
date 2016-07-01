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
import scala.util.matching.Regex
import java.io.File

/**
 * @author matthieu
 */

object ExercisesActor {
  def props = Props[ExercisesActor]

  val baseDirectory: File = new File("exercises")
  val filterRegexp = new Regex("^(.(?!Entity))*\\.java$") // Select all files ending with ".java" but not containing "Entity"

  val exercisesName: Array[String] = generateExercisesIDsList(baseDirectory, filterRegexp)

  val logger: PLMLogger = new PLMLogger
  val i18n: I18n = I18nFactory.getI18n(getClass(),"org.plm.i18n.Messages", new Locale("en"), I18nFactory.FALLBACK);

  val humanLanguages: Array[Locale] = initHumanLanguages
  val exerciseRunner: ExerciseRunner = new ExerciseRunner(logger, i18n)
  val exercisesFactory: ExerciseFactory = new ExerciseFactory(logger, i18n, exerciseRunner, ProgrammingLanguages.programmingLanguages, humanLanguages)
  val exercises: Map[String, Exercise] = initExercises

  case class GetExercise(exerciseID: String)

  def generateExercisesIDsList(directory: File, r: Regex): Array[String] = {
    val files: Array[File] = directory.listFiles
    var results: Array[String] = Array()
    if(files != null) {
      results = results ++ files.filter(_.isDirectory).flatMap(recursiveListFiles(_,r)).map { file => file }
    }
    results
  }

  def recursiveListFiles(f: File, r: Regex): Array[String] = {
    val files: Array[File] = f.listFiles
    var results: Array[String] = Array()
    if(files != null) {
      results = files.filter(f => r.findFirstIn(f.getName).isDefined).map { file => f.getName + "." + file.getName.dropRight(5) /* To remove ".java" */ }
      results = results ++ files.filter(_.isDirectory).flatMap(recursiveListFiles(_,r)).map { file => f.getName + "." + file }
    }
    results
  }

  def initHumanLanguages(): Array[Locale] = {
    var humanLanguages: Array[Locale] = Array()
    LangUtils.getAvailableLangs().map { lang => 
      humanLanguages = humanLanguages :+ (lang.toLocale)
    }
    humanLanguages
  }

  def initExercises(): Map[String, Exercise] = {
    var exercises: Map[String, Exercise] = Map()

    exercisesName.foreach { exerciseName => 
      val exercise: Exercise = Class.forName(exerciseName).getDeclaredConstructor().newInstance().asInstanceOf[Exercise]
      exercisesFactory.initializeExercise(exercise, ProgrammingLanguages.defaultProgrammingLanguage)
      exercises += (exerciseName -> exercise)
    }

    exercises
  }
}

class ExercisesActor extends Actor {
  import ExercisesActor._

  def receive =  {
    case GetExercise(exerciseID) =>
      sender ! getExercise(exerciseID)
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }
  
  def getExercise(exerciseID: String): Exercise = {
    val exercise: Exercise = exercises.get(exerciseID).get
    exercisesFactory.cloneExercise(exercise)
  }
}