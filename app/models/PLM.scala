package models

import plm.core.model.Game
import plm.core.model.lesson.Lesson
import plm.core.model.lesson.Lecture
import plm.core.lang.ProgrammingLanguage
import scala.collection.mutable.ListBuffer

import play.api.libs.json._

object PLM {
  
  var _game : Game = Game.getInstance()
  var _lessons : List[Lesson] = game.getLessons.toArray(Array[Lesson]()).toList
  var _programmingLanguages: List[ProgrammingLanguage] = Game.getProgrammingLanguages.toList
  
  def game : Game = _game
  def lessons: List[Lesson] = _lessons
  
  def programmingLanguages: List[String] = {
    var programmingLanguages : ListBuffer[String] = new ListBuffer[String]()
    _programmingLanguages.foreach { x => println("lang: ", x.getLang); programmingLanguages += x.getLang };
    return programmingLanguages.toList
  }
  
  def switchLesson(lessonName: String): Lecture = {
    var key = "lessons." + lessonName;
    game.switchLesson(key, true)
    return game.getCurrentLesson.getCurrentExercise
  }
  
  def switchExercise(lessonID: String, exerciseID: String): Lecture = {
    var key = "lessons." + lessonID;
    game.switchLesson(key, true)
    return game.getCurrentLesson.getCurrentExercise
  }
  
  def programmingLanguage: ProgrammingLanguage = Game.getProgrammingLanguage
}