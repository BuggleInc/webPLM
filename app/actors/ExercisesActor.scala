package actors

import java.io.File
import java.util.Locale

import scala.util.matching.Regex

import com.fasterxml.jackson.databind.ObjectMapper

import akka.actor._
import log.PLMLogger
import models.ProgrammingLanguages
import models.lesson.TipFactory
import play.api.Logger
import plm.core.model.json.JSONUtils
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.ExerciseFactory
import plm.core.model.lesson.ExerciseRunner
import plm.core.model.lesson.UserSettings
import plm.core.model.lesson.tip.AbstractTipFactory
import utils.LangUtils
/**
 * @author matthieu
 */

object ExercisesActor {
  def props = Props[ExercisesActor]

  if(play.Play.isProd) {
    Exercise.directory = "exercises"
  } else {
    Exercise.directory = "dist/exercises"
  }

  val path: String = Exercise.directory
  val baseDirectory: File = new File(path)
  val filterRegexp = new Regex("^(.(?!(Entity)|(CommonErr[0-9]*)))*\\.java$") // Select all files ending with ".java" but not containing "Entity"

  val exercisesName: Array[String] = generateExercisesIDsList(baseDirectory, filterRegexp)

  val locale: Locale = new Locale("en")

  val humanLanguages: Array[Locale] = initHumanLanguages
  val exerciseRunner: ExerciseRunner = new ExerciseRunner(locale)

  val exercisesFactory: ExerciseFactory = new ExerciseFactory(locale, exerciseRunner, ProgrammingLanguages.programmingLanguages, humanLanguages)
  exercisesFactory.setRootDirectory(path)
  val tipsFactory: AbstractTipFactory = new TipFactory
  exercisesFactory.setTipFactory(tipsFactory)

  val exercises: Map[String, Exercise] = initExercises

  case class GetExercise(exerciseID: String)
  case class ExportExercises()
  case class ExportExercise(exerciseID: String)

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
      humanLanguages = humanLanguages :+ lang.toLocale
    }
    humanLanguages
  }

  def initExercise(exerciseName: String): Exercise = {
    val path: String = List(baseDirectory.getPath, exerciseName.replaceAll("\\.", "/")).mkString("/") + ".json"
    if(new File(path).exists) {
      initFromJSON(path)
    }
    else {
      initFromSource(exerciseName)
    }
  }

  def initFromJSON(path: String): Exercise = {
    JSONUtils.fileToExercise(path)
  }

  def initFromSource(exerciseName: String): Exercise = {
    val userSettings: UserSettings = new UserSettings(locale, ProgrammingLanguages.defaultProgrammingLanguage)
    val exercise: Exercise = Class.forName(exerciseName).getDeclaredConstructor().newInstance().asInstanceOf[Exercise]
    exercise.setSettings(userSettings)
    exercisesFactory.initializeExercise(exercise, ProgrammingLanguages.defaultProgrammingLanguage)
    exercise
  }

  def initExercises(): Map[String, Exercise] = {
    var exercises: Map[String, Exercise] = Map()
    val userSettings: UserSettings = new UserSettings(locale, ProgrammingLanguages.defaultProgrammingLanguage)
    exercisesName.foreach { exerciseName =>
      val exercise: Exercise = initExercise(exerciseName)
      exercises += (exerciseName -> exercise)
    }

    exercises
  }

  def exportExercises(): Unit = {
    exercisesName.foreach { exerciseName =>
      exportExercise(exerciseName)
    }
  }
  
  def exportExercise(exerciseName: String) {
    // Instantiate the exercise the old fashioned way
    val exercise: Exercise = initFromSource(exerciseName)

    // Store into a file its JSON serialization
    val path: String = List(baseDirectory.getPath, exerciseName.replaceAll("\\.", "/")).mkString("/")
    JSONUtils.exerciseToFile(path, exercise)
  }
}

class ExercisesActor extends Actor {
  import ExercisesActor._

  def receive =  {
    case GetExercise(exerciseID) =>
      sender ! getExercise(exerciseID)
    case ExportExercises =>
      exportExercises
    case ExportExercise(exerciseID) =>
      exportExercise(exerciseID)
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }

  def getExercise(exerciseID: String): Exercise = {
    val exercise: Exercise = exercises.get(exerciseID).get
    ExerciseFactory.cloneExercise(exercise)
  }
}
