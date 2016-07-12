package actors

import java.io.{File, InputStream}
import java.net.URL
import java.util.Locale

import scala.util.matching.Regex
import com.fasterxml.jackson.databind.ObjectMapper
import akka.actor._
import log.PLMLogger
import models.ProgrammingLanguages
import models.lesson.TipFactory
import play.api.Logger
import play.api.Play
import play.api.Play.current
import plm.core.model.json.JSONUtils
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.ExerciseFactory
import plm.core.model.lesson.ExerciseRunner
import plm.core.model.lesson.UserSettings
import plm.core.model.lesson.tip.AbstractTipFactory
import utils.LangUtils

import scala.io.Source
/**
 * @author matthieu
 */

object ExercisesActor {
  def props = Props[ExercisesActor]

  val filterRegexp = "^(.(?!(Entity)|(CommonErr[0-9]*)))*\\.java$" // Select all files ending with ".java" but not containing "Entity"

  val exercisesName: Array[String] = generateExercisesIDsList

  val locale: Locale = new Locale("en")

  val humanLanguages: Array[Locale] = initHumanLanguages
  val exerciseRunner: ExerciseRunner = new ExerciseRunner(locale)

  val exercisesFactory: ExerciseFactory = new ExerciseFactory(locale, exerciseRunner, ProgrammingLanguages.programmingLanguages, humanLanguages)
  val tipsFactory: AbstractTipFactory = new TipFactory
  exercisesFactory.setTipFactory(tipsFactory)

  val exercises: Map[String, Exercise] = initExercises

  case class GetExercise(exerciseID: String)
  case class ExportExercises()
  case class ExportExercise(exerciseID: String)

  def generateExercisesIDsList(): Array[String] = {
    recursiveListFiles("/")
  }

  def recursiveListFiles(path: String): Array[String] = {
    var results: Array[String] = Array()

    Play.resource(path) match {
      case Some(url: URL) =>
        if(url.getProtocol.equals("file")) {
          val file: File = new File(url.toURI)
          if(file.isDirectory) {
            // Recursively browse the files of the directory looking for exercises
            results = results ++ file.listFiles.flatMap { file =>
              val filename: String = if(path.equals("/")) { path + file.getName } else { path + "/" + file.getName}
              recursiveListFiles(filename)
            }
          }
          else if(path.matches(filterRegexp)) {
            // Found an exercise, store the exercise's class
            results = results :+ path.replaceAll("/", "\\.").dropRight(5).drop(1)
          }
        }
      case None =>
        Logger.error("No resource found for " + path)
    }
    results
  }

  def initHumanLanguages(): Array[Locale] = {
    var humanLanguages: Array[Locale] = Array()
    LangUtils.getAvailableLangs().foreach { lang =>
      humanLanguages = humanLanguages :+ lang.toLocale
    }
    humanLanguages
  }

  def initExercise(exerciseName: String): Exercise = {
    val path: String = exerciseName.replaceAll("\\.", "/") + ".json"
    Play.resourceAsStream(path) match {
      case Some(is: InputStream) =>
        val lines: String = Source.fromInputStream(is).getLines().mkString("")
        is.close
        JSONUtils.jsonStringToExercise(lines)
      case None =>
        Logger.error(exerciseName + "'s JSON is missing, initializing it from source")
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

  // FIXME: Re-implement me
  def exportExercise(exerciseName: String) {
    // Instantiate the exercise the old fashioned way
    val exercise: Exercise = initFromSource(exerciseName)

    // Store into a file its JSON serialization
    // val path: String = List(baseDirectory.getPath, exerciseName.replaceAll("\\.", "/")).mkString("/")
    // JSONUtils.exerciseToFile(path, exercise)
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
