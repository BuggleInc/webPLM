package models

import org.scalatest._
import org.scalatest.mock.MockitoSugar
import org.scalatestplus.play._
import org.mockito.Mockito._
import java.util.Vector
import actors.PLMActor
import plm.core.model.lesson.Exercise
import plm.universe.World
import plm.core.model.lesson.Exercise.WorldKind
import log.PLMLogger
import java.util.Locale
import java.util.UUID
import java.util.Properties
import play.api.test.WithApplication
import spies.ExecutionSpy

class PLMSpec extends PlaySpec with MockitoSugar {
  var userUUID: String = UUID.randomUUID.toString
  
  "PLM#switchLesson" should {
    "set the selected lesson as the current one" in {
      val mockSpy = mock[ExecutionSpy]
      val returnedMockSpy = mock[ExecutionSpy]
      when(mockSpy.clone) thenReturn returnedMockSpy

      var plm = new PLM(mock[Tribunal], new Properties, userUUID, mock[PLMLogger], new Locale("en"), None, false)      
      val expectedLessonID = "welcome"
      plm.switchLesson(expectedLessonID)
      val actualLectID = plm.game.getCurrentLesson.getId
      actualLectID mustBe expectedLessonID
    }
    
    "set the first exercise as the current one" in {
      val mockSpy = mock[ExecutionSpy]
      val returnedMockSpy = mock[ExecutionSpy]
      when(mockSpy.clone) thenReturn returnedMockSpy
      
      var plm = new PLM(mock[Tribunal], new Properties, userUUID, mock[PLMLogger], new Locale("en"), None, false)
      val lessonID = "welcome"
      val expectedExerciseID = "welcome.lessons.welcome.environment.Environment"
      plm.switchLesson(lessonID)
      val actualExerciseID = plm.game.getCurrentLesson.getCurrentExercise.getId
      actualExerciseID mustBe expectedExerciseID
    }
    
    "return the current exercise" in {
      val mockSpy = mock[ExecutionSpy]
      val returnedMockSpy = mock[ExecutionSpy]
      when(mockSpy.clone) thenReturn returnedMockSpy
      
      var plm = new PLM(mock[Tribunal], new Properties, userUUID, mock[PLMLogger], new Locale("en"), None, false)
      val actualLecture = plm.switchLesson("welcome")
      val expectedLecture = plm.game.getCurrentLesson.getCurrentExercise
      actualLecture mustBe expectedLecture
    }
  }
}