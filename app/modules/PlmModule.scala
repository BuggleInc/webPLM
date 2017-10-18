package modules

import com.google.inject.{AbstractModule, Provides, Singleton}
import json.LectureToJson
import models.lesson.TipFactory
import net.codingwell.scalaguice.ScalaModule
import play.api.Play
import play.api.i18n.Lang
import plm.core.model.lesson.{Exercises, Lessons}
import play.api.Play.current
import plm.core.lang.ProgrammingLanguages
import plm.core.utils.FileUtils

class PlmModule extends AbstractModule with ScalaModule {
  override def configure(): Unit = {}

  @Provides
  @Singleton
  def provideLessons(): Lessons =
    new Lessons(
      Play.application.classloader,
      Lang.availables.map(_.code))

  @Provides
  @Singleton
  def provideExercises(lessons: Lessons, programmingLanguages: ProgrammingLanguages) =
    new Exercises(
      lessons,
      new FileUtils(Play.application.classloader),
      programmingLanguages,
      new TipFactory(),
      Lang.availables.map(_.toLocale))

  @Provides
  @Singleton
  def provideLectureToJson(exercises: Exercises) = new LectureToJson(exercises)

  @Provides
  @Singleton
  def provideProgrammingLanguages = new ProgrammingLanguages(Play.application.classloader)
}
