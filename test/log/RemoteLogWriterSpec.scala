package log

import org.scalatest._
import org.scalatest.mock.MockitoSugar
import org.scalatestplus.play._
import org.mockito.Mockito._
import org.mockito.Matchers

import java.util.Vector

import play.api.libs.json._

import actors.PLMActor
import spies.ExecutionSpy

import plm.core.model.Game
import plm.core.model.lesson.Exercise
import plm.universe.World
import plm.core.model.lesson.Exercise.WorldKind

class RemoteLogWriterSpec extends PlaySpec with MockitoSugar {
    
  "RemoteLogWriter" should {
    "set itself as the output stream" in {
      var game: Game = new Game
      val mockPLMActor = mock[PLMActor]
      val remoteLogWriter: RemoteLogWriter = new RemoteLogWriter(mockPLMActor, game)
      
      val actualOutputWriter = game.getOutputWriter
      actualOutputWriter mustBe remoteLogWriter
    }
    
    "redirect every message to the PLMActor" in {
      var game: Game = new Game
      val mockPLMActor = mock[PLMActor]
      val remoteLogWriter: RemoteLogWriter = new RemoteLogWriter(mockPLMActor, game)
      
      var i: Int = 0
      for(i <- 0 to 9) {
         System.out.print("test")
      }
     
      verify(mockPLMActor, times(10)).sendMessage("log", Json.obj(
        "msg" -> "test"   
      ))
    }
  }
}