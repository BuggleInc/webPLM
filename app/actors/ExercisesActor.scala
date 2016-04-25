package actors

import java.io.File
import java.util.Locale
import scala.util.matching.Regex
import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.google.gson.JsonObject
import akka.actor._
import log.PLMLogger
import models.ProgrammingLanguages
import models.lesson.TipFactory
import play.api.Logger
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.ExerciseFactory
import plm.core.model.lesson.ExerciseRunner
import plm.core.model.lesson.UserSettings
import plm.core.model.lesson.tip.AbstractTipFactory
import utils.LangUtils
import plm.core.model.lesson.BlankExercise
import com.fasterxml.jackson.databind.module.SimpleModule
import java.awt.Color
import plm.core.model.json.CustomColorDeserializer
import com.fasterxml.jackson.annotation.JsonTypeInfo
import plm.core.model.json.JSONUtils
import java.util.HashMap
import plm.core.model.lesson.Exercise.WorldKind
import plm.universe.World
import plm.universe.Operation
import java.util.ArrayList
import com.fasterxml.jackson.databind.SerializationFeature
/**
 * @author matthieu
 */

object ExercisesActor {
  def props = Props[ExercisesActor]

  val path: String = if(play.Play.isProd) { "exercises" } else { "dist/exercises" }
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
    val userSettings: UserSettings = new UserSettings(locale, ProgrammingLanguages.defaultProgrammingLanguage)
    exercisesName.foreach { exerciseName => 
      val exercise: Exercise = Class.forName(exerciseName).getDeclaredConstructor().newInstance().asInstanceOf[Exercise]
      exercise.setSettings(userSettings)
      exercisesFactory.initializeExercise(exercise, ProgrammingLanguages.defaultProgrammingLanguage)

      exercises += (exerciseName -> exercise)
    }

    exercises
  }

  def exportExercises(): Unit = {
    val userSettings: UserSettings = new UserSettings(locale, ProgrammingLanguages.defaultProgrammingLanguage)
    exercisesName.foreach { exerciseName =>
      // Instantiate the exercise the old fashioned way
      val exercise: Exercise = Class.forName(exerciseName).getDeclaredConstructor().newInstance().asInstanceOf[Exercise]
      exercise.setSettings(userSettings)
      exercisesFactory.initializeExercise(exercise, ProgrammingLanguages.defaultProgrammingLanguage)

      // Store into a file its JSON serialization
      val path: String = List(baseDirectory.getPath, exerciseName.replaceAll("\\.", "/")).mkString("/")
      JSONUtils.mapper.enable(SerializationFeature.INDENT_OUTPUT)
      JSONUtils.mapper.writeValue(new File(path + ".json"), JSONUtils.exerciseToJudgeJSON(exercise))
      JSONUtils.mapper.disable(SerializationFeature.INDENT_OUTPUT)
    }
  }
}

class ExercisesActor extends Actor {
  import ExercisesActor._

  def receive =  {
    case GetExercise(exerciseID) =>
      sender ! getExercise(exerciseID)
    case ExportExercises =>
      exportExercises
    case _ =>
      Logger.error("LessonsActor: not supported message")
  }
  
  def getExercise(exerciseID: String): Exercise = {
    val exercise: Exercise = exercises.get(exerciseID).get
    ExerciseFactory.cloneExercise(exercise)
  }
}