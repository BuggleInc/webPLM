package models

import scala.Option
import scala.collection.mutable.HashMap
import plm.core.model.Game
import plm.core.model.lesson.Lesson
import plm.core.model.lesson.Lecture

object PLMLesson {
  
  var _game : Game = Game.getInstance
  var _lessons : List[Lesson] = game.getLessons.toArray(Array[Lesson]()).toList
  var _exercises : HashMap[String, List[Lecture]] = new HashMap[String, List[Lecture]]
  def game: Game = _game

  def lessons: List[Lesson] = _lessons
  
  def exercises(id: String) : List[Lecture] = {
    var key : String = "lessons."+id
    var option : Option[List[Lecture]] = _exercises.get(key);
    
    if(!option.isDefined) {
      game.switchLesson(key, false);
      _exercises.put(key, game.getCurrentLesson.exercises.toArray(Array[Lecture]()).toList)
    }
    
    _exercises.get(key).get
  }
  
  def setCurrentLesson(lessonName: String) = {
    game.switchLesson(lessonName, true)
  }
  
}
