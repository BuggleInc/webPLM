
package actors.execution

import akka.actor.ActorSystem
import com.google.inject.Inject
import com.google.inject.Singleton
import play.api.i18n.Lang
import akka.actor.ActorRef
import play.api.Logger

/**
 * @author matthieu
 */

@Singleton
class TribunalActorFactory @Inject() (system: ActorSystem) extends ExecutionActorFactory {
  def create(optLang: Option[Lang]): ActorRef = {
    Logger.info("Execution Mode: TRIBUNAL")
    val lang: Lang = optLang.getOrElse(Lang("en"))
    system.actorOf(TribunalActor.props(lang))
  }
}
