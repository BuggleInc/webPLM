package actors.execution

import com.google.inject.Inject
import play.api.i18n.Lang
import play.api.Configuration
import play.api.Play.current
import scala.concurrent.ExecutionContext.Implicits.global



/**
 * @author matthieu
 */
class ExecutionActorFactory @Inject() (configuration: Configuration) {
  /*def apply(): ExecutionActor = {
    //context.actorOf(TribunalActor.props(Lang("en")))
  }*/
}