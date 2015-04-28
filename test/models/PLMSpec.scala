package models

import org.scalatest._
import org.scalatest.mock.MockitoSugar
import org.scalatestplus.play._
import org.mockito.Mockito._
import java.util.Vector
import actors.PLMActor
import spies.ExecutionSpy
import plm.core.model.lesson.Exercise
import plm.universe.World
import plm.core.model.lesson.Exercise.WorldKind
import log.PLMLogger
import java.util.Locale
import java.util.UUID

class PLMSpec extends PlaySpec with MockitoSugar {
  var userUUID: String = UUID.randomUUID.toString
  var plm = new PLM(mock[PLMLogger], new Locale("en"), userUUID)
  
  "PLM#switchLesson" should {
    "set the selected lesson as the current one" in {
      val mockSpy = mock[ExecutionSpy]
      when(mockSpy.clone) thenReturn mock[ExecutionSpy]
      
      val expectedLessonID = "welcome"
      plm.switchLesson(expectedLessonID, mockSpy, mockSpy)
      val actualLectID = plm.game.getCurrentLesson.getId
      actualLectID mustBe expectedLessonID
    }
    
    "set the first exercise as the current one" in {
      val mockSpy = mock[ExecutionSpy]
      when(mockSpy.clone) thenReturn mock[ExecutionSpy]
      
      val lessonID = "welcome"
      val expectedExerciseID = "welcome.lessons.welcome.environment.Environment"
      plm.switchLesson(lessonID, mockSpy, mockSpy)
      val actualExerciseID = plm.game.getCurrentLesson.getCurrentExercise.getId
      actualExerciseID mustBe expectedExerciseID
    }
    
    "return the current exercise" in {
      val mockSpy = mock[ExecutionSpy]
      when(mockSpy.clone) thenReturn mock[ExecutionSpy]
      
      val actualLecture = plm.switchLesson("welcome", mockSpy, mockSpy)
      val expectedLecture = plm.game.getCurrentLesson.getCurrentExercise
      actualLecture mustBe expectedLecture
    }
  }
  
  "PLM#addExecutionSpy" should {
    "add a spy's clone to each world" in {
      val mockPLMActor = mock[PLMActor]
      val executionSpy = new ExecutionSpy(mockPLMActor, "testOperation")
      
      val worlds = new Vector[World]()   
      var mockFirstWorld = mock[World]
      var mockSecondWorld = mock[World]
      var mockThirdWorld = mock[World]
      
      worlds.add(mockFirstWorld)
      worlds.add(mockSecondWorld)
      worlds.add(mockThirdWorld)
      
      val exo = mock[Exercise]
      when(exo.getWorlds(WorldKind.CURRENT)) thenReturn worlds
      plm.addExecutionSpy(exo, executionSpy, WorldKind.CURRENT)
      verify(mockFirstWorld, times(1)).addWorldUpdatesListener(executionSpy)
      verify(mockSecondWorld, times(1)).addWorldUpdatesListener(executionSpy)
      verify(mockThirdWorld, times(1)).addWorldUpdatesListener(executionSpy)
    }
    
    "register each clone in PLMActor" in {
      val mockPLMActor = mock[PLMActor]
      val executionSpy = new ExecutionSpy(mockPLMActor, "testOperation")
      
      val worlds = new Vector[World]()   
      var mockFirstWorld = mock[World]
      var mockSecondWorld = mock[World]
      var mockThirdWorld = mock[World]
      
      worlds.add(mockFirstWorld)
      worlds.add(mockSecondWorld)
      worlds.add(mockThirdWorld)
      
      val exo = mock[Exercise]
      when(exo.getWorlds(WorldKind.CURRENT)) thenReturn worlds
      plm.addExecutionSpy(exo, executionSpy, WorldKind.CURRENT)
      verify(mockPLMActor, times(3)).registerSpy(executionSpy)
    }
    
    
  }
  
}