package models.lesson

import java.io.{File, InputStream}
import java.util.Locale

import models.ProgrammingLanguages
import play.api.{Logger, Mode, Play}
import plm.core.model.json.JSONUtils
import plm.core.model.lesson.tip.AbstractTipFactory
import plm.core.model.lesson.{Exercise, ExerciseFactory, ExerciseRunner, UserSettings}
import utils.LangUtils

import scala.io.Source

class Exercises(lessons: Lessons) {
  val baseDirectory: String = "exercises/"

  val exerciseNames: Array[String] = lessons.lessonsList flatMap { lesson => lesson.lectures.map(_.id) }

  val locale: Locale = new Locale("en")

  val humanLanguages: Array[Locale] = initHumanLanguages
  val exerciseRunner: ExerciseRunner = new ExerciseRunner(locale)

  val exercisesFactory: ExerciseFactory = new ExerciseFactory(locale, exerciseRunner, ProgrammingLanguages.programmingLanguages, humanLanguages)
  val tipsFactory: AbstractTipFactory = new TipFactory
  exercisesFactory.setTipFactory(tipsFactory)

  val exercises: Map[String, Exercise] = initExercises

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

  def needToGenerateJSON(exerciseName: String, path: String): Boolean = {
    val files: Array[File] = generateFiles(path)
    val jsonFile: File = new File(baseDirectory + path)

    if (!jsonFile.exists())
      return true

    files.foreach { file =>
      if(jsonFile.lastModified < file.lastModified)
        return true
    }

    return false
  }

  def initExercise(exerciseName: String): Exercise = {
    val jsonFile: String = exerciseName.replaceAll("\\.", "/") + ".json"

    // scanning the whole disk is a bad idea when in production mode
    if (Play.current.mode == Mode.Dev && needToGenerateJSON(exerciseName, jsonFile)) {
      exportExercise(exerciseName)
    } else {
      // In prod mode, we mostly want to use the JSON
      // Only use the sources as a fallback
      withResource(jsonFile) {
        case Some(is: InputStream) =>
          val lines: String = Source.fromInputStream(is)("UTF-8").mkString
          initFromJSON(lines)
        case _ =>
          exportExercise(exerciseName)
      }
    }
  }

  def initFromJSON(lines: String): Exercise = {
    val exercise: Exercise = JSONUtils.jsonStringToExercise(lines)
    exercisesFactory.computeMissions(exercise)
    exercisesFactory.computeHelps(exercise)
    exercise
  }

  def initExercises(): Map[String, Exercise] = {
    var exercises: Map[String, Exercise] = Map()
    exerciseNames.foreach { exerciseName =>
      val exercise: Exercise = initExercise(exerciseName)
      exercises += (exerciseName -> exercise)
    }

    exercises
  }

  def exportExercises(): Unit = {
    exerciseNames.foreach { exerciseName =>
      exportExercise(exerciseName)
    }
  }

  def exportExercise(exerciseName: String): Exercise = {
    // Instantiate the exercise the old fashioned way
    val userSettings: UserSettings = new UserSettings(locale, ProgrammingLanguages.defaultProgrammingLanguage)
    val exercise: Exercise = Class.forName(exerciseName).getDeclaredConstructor().newInstance().asInstanceOf[Exercise]
    exercise.setSettings(userSettings)
    exercisesFactory.initializeExercise(exercise, ProgrammingLanguages.defaultProgrammingLanguage)

    Logger.info(s"Regenerating exercise ${exerciseName}.json")
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

  private def withResource[O](fileName: String)(action: Option[InputStream] => O): O = {
    val maybeInputStream = Option(getClass.getClassLoader.getResourceAsStream(fileName))
    try {
      action(maybeInputStream)
    } finally {
      maybeInputStream.foreach(_.close())
    }
  }
}
