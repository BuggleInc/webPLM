package models.lesson

import java.util.Locale

import models.ProgrammingLanguages
import plm.core.lang._
import plm.core.model.lesson.{Exercise, ExerciseFactory, ExerciseRunner, UserSettings}
import utils.LangUtils

class Exercises(lessons: Lessons) {

  private val DEFAULT_PROGRAMMING_LANGUAGE: ProgrammingLanguage = ProgrammingLanguages.defaultProgrammingLanguage()
  private val EN_LOCALE: Locale = new Locale("en")

  private val exercisesFactory: ExerciseFactory = {
    val result = new ExerciseFactory(
      EN_LOCALE,
      new ExerciseRunner(EN_LOCALE),
      ProgrammingLanguages.programmingLanguages(),
      LangUtils.getAvailableLangs().map(_.toLocale).toArray)
    result.setTipFactory(new TipFactory())
    result
  }

  private val exercises: Map[String, Exercise] =
    lessons
      .lessonsList
      .flatMap(_.lectures)
      .map(lecture => lecture.id -> initExercise(lecture.id))
      .toMap

  def getExercise(exerciseId: String): Option[Exercise] =
    exercises
      .get(exerciseId)
      .map(ExerciseFactory.cloneExercise)

  private def initExercise(exerciseId: String): Exercise = {
    // Instantiate the exercise the old fashioned way
    val userSettings: UserSettings = new UserSettings(EN_LOCALE, DEFAULT_PROGRAMMING_LANGUAGE)
    val exercise: Exercise = Class.forName(exerciseId).getDeclaredConstructor().newInstance().asInstanceOf[Exercise]
    exercise.setSettings(userSettings)
    exercisesFactory.initializeExercise(exercise, DEFAULT_PROGRAMMING_LANGUAGE)
    exercise
  }
}
