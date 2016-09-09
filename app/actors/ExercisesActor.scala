package actors

import java.io.{File, InputStream}
import java.net.URL
import java.util.Locale

import akka.actor._
import models.ProgrammingLanguages
import models.lesson.TipFactory
import play.api.{Logger, Mode, Play}
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

  val baseDirectory: String = "exercises/"
  val filterRegexp: String = "^(.(?!(Entity)|(CommonErr[0-9]*)))*\\.java$" // Select all files ending with ".java" but not containing "Entity"

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

  def generateFiles(path: String): Array[File] = {
    var files: Array[File] = Array[File]()

    // Gather the entities
    val extensions: Array[String] = Array(".java", ".blockly", ".py")
    val entitiesPaths: Array[String] = extensions.map( extension => baseDirectory + path.dropRight(5) + "Entity" + extension)
    entitiesPaths.foreach { entityPath =>
      val file: File = new File(entityPath)
      if(file.exists()) {
        files = files :+ file
      }
    }

    // Add the Scala entity
    val lastPart: String = path.split("/").last.dropRight(4)
    val scalaEntityPath: String = baseDirectory + path.split("/").dropRight(1).mkString("/") + "Scala" + lastPart + "Entity.scala"

    val scalaEntityFile: File = new File(scalaEntityPath)
    if(scalaEntityFile.exists()) {
      files = files :+ scalaEntityFile
    }

    // Add the exercise's file
    val exerciseFile: File = new File(baseDirectory + path.dropRight(5) + ".java")
    if(exerciseFile.exists()) {
      files = files :+ exerciseFile
    }

    files
  }

  def isJSONUpToDate(jsonFile: File, files: Array[File]): Boolean = {
    var upToDate: Boolean = true
    files.foreach { file =>
      if(jsonFile.lastModified < file.lastModified) {
        upToDate = false
      }
    }
    upToDate
  }

  def needToGenerateJSON(exerciseName: String, path: String): Boolean = {
    val files: Array[File] = generateFiles(path)
    val jsonFile: File = new File(baseDirectory + path)

    (!jsonFile.exists() || !isJSONUpToDate(jsonFile, files))
  }

  def initExercise(exerciseName: String): Exercise = {
    val path: String = exerciseName.replaceAll("\\.", "/") + ".json"

    // We want to generate or refresh the JSON only in dev mode
    if(Play.current.mode == Mode.Dev && needToGenerateJSON(exerciseName, path)) {
      Logger.info(s"Regenerating JSON of exercise: $exerciseName")
      exportExercise(exerciseName)
    } else {
      // In prod mode, we mostly want to use the JSON
      // Only use the sources as a fallback
      Play.resourceAsStream(path) match {
        case Some(is: InputStream) =>
          val lines: String = Source.fromInputStream(is)("UTF-8").mkString
          is.close
          initFromJSON(lines)
        case _ =>
          initFromSource(exerciseName)
      }
    }
  }

  def initFromJSON(lines: String): Exercise = {
    val exercise: Exercise = JSONUtils.jsonStringToExercise(lines)
    exercisesFactory.computeMissions(exercise)
    exercisesFactory.computeHelps(exercise)
    exercise
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

  def exportExercise(exerciseName: String): Exercise = {
    // Instantiate the exercise the old fashioned way
    val exercise: Exercise = initFromSource(exerciseName)

    // Store into a file its JSON serialization
    val path: String = List(baseDirectory, exerciseName.replaceAll("\\.", "/")).mkString("/")
    JSONUtils.exerciseToFile(path, exercise)

    exercise
  }

  def getExercise(exerciseID: String): Option[Exercise] = {
    exercises.get(exerciseID) match {
      case Some(exercise: Exercise) =>
        Some(ExerciseFactory.cloneExercise(exercise))
      case None =>
        None
    }
  }
}

class ExercisesActor extends Actor {
  import ExercisesActor._

  def receive = {
    case GetExercise(exerciseID) =>
      sender ! getExercise(exerciseID)
    case ExportExercises =>
      exportExercises
    case ExportExercise(exerciseID) =>
      exportExercise(exerciseID)
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }
}
