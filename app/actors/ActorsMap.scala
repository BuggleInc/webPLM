package actors

import scala.collection.mutable
import akka.actor.ActorRef

object ActorsMap {
  val actors: mutable.HashMap[String, ActorRef] = mutable.HashMap()
  
  def add(key: String, actorRef: ActorRef) = actors.+=((key, actorRef))
  def remove(key: String) = actors.-=(key)
  def get(key: String): Option[ActorRef] = actors.get(key)
}