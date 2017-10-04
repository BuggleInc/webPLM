package modules

import com.google.inject.{AbstractModule, Provides, Singleton}
import json.LectureToJson
import models.lesson.{Exercises, Lessons}
import net.codingwell.scalaguice.ScalaModule
import play.api.Logger
import play.api.i18n.Lang

class PlmModule extends AbstractModule with ScalaModule {
  override def configure(): Unit = {}

  @Provides
  @Singleton
  def provideLessons(): Lessons = {
    import play.api.Play.current
    new Lessons(Logger.logger, Lang.availables.map(_.code))
  }

  @Provides
  @Singleton
  def provideExercises(lessons: Lessons) = new Exercises(lessons)

  @Provides
  @Singleton
  def provideLectureToJson(exercises: Exercises) = new LectureToJson(exercises)
}
