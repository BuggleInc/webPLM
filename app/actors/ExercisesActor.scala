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
import plm.core.utils.CustomColorDeserializer
import com.fasterxml.jackson.annotation.JsonTypeInfo
/**
 * @author matthieu
 */

object ExercisesActor {
  def props = Props[ExercisesActor]

  val baseDirectory: File = new File("exercises")
  val filterRegexp = new Regex("^(.(?!(Entity)|(CommonErr[0-9]*)))*\\.java$") // Select all files ending with ".java" but not containing "Entity"

  val exercisesName: Array[String] = generateExercisesIDsList(baseDirectory, filterRegexp)

  val locale: Locale = new Locale("en")

  val humanLanguages: Array[Locale] = initHumanLanguages
  val exerciseRunner: ExerciseRunner = new ExerciseRunner(locale)

  val exercisesFactory: ExerciseFactory = new ExerciseFactory(locale, exerciseRunner, ProgrammingLanguages.programmingLanguages, humanLanguages)
  val tipsFactory: AbstractTipFactory = new TipFactory
  exercisesFactory.setTipFactory(tipsFactory)

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
    val userSettings: UserSettings = new UserSettings(locale, ProgrammingLanguages.defaultProgrammingLanguage)
    exercisesName.foreach { exerciseName => 
      val exercise: Exercise = Class.forName(exerciseName).getDeclaredConstructor().newInstance().asInstanceOf[Exercise]
      exercise.setSettings(userSettings)
      exercisesFactory.initializeExercise(exercise, ProgrammingLanguages.defaultProgrammingLanguage)

      if(exercise.getId == "Environment") {
        val mapper: ObjectMapper = new ObjectMapper()
        val module: SimpleModule = new SimpleModule
        module.addDeserializer(classOf[Color], new CustomColorDeserializer)
        mapper.registerModule(module)
        try {
            val root: JsonNode = mapper.convertValue(exercise, classOf[JsonNode])
            val typeEntities: String = root.get("initialWorld").get(0).get("entities").get(0).get("type").asText
            for(i <- 0 until exercise.getWorldCount;
              j <- 0 until exercise.getInitialWorld.get(i).getEntityCount) {
              val node: JsonNode = root.path("answerWorld").path(i).path("entities").path(j)
              node.asInstanceOf[ObjectNode].put("type", typeEntities)
            }
            Logger.error("original JSON: " + root.toString)
            val clone: Exercise = mapper.readValue(root.toString(), classOf[BlankExercise]);
            clone.asInstanceOf[BlankExercise].setupCurrentWorld
            clone.setSettings(userSettings)
            val json: String = mapper.writeValueAsString(clone)
            Logger.error("clone JSON: " + json)
        }
        catch {
          case jsonE: JsonProcessingException =>
            jsonE.printStackTrace
          case e: Exception =>
            e.printStackTrace
        }
      }

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
    ExerciseFactory.cloneExercise(exercise)
  }
}