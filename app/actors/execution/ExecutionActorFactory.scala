package actors.execution

import com.google.inject.Inject
import akka.actor.ActorRef
import play.api.i18n.Lang

/**
 * @author matthieu
 */
trait ExecutionActorFactory {
  def create(optLang: Option[Lang]): ActorRef
}