package actors

import akka.actor._
import play.Logger

object MyWebSocketActor {
  def props(out: ActorRef) = Props(new MyWebSocketActor(out))
}

class MyWebSocketActor(out: ActorRef) extends Actor {
  def receive = {
    case msg: String =>
      Logger.debug("I received your message: " + msg)
      out ! ("I received your message: " + msg)
  }
}