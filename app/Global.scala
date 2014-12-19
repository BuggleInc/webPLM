import java.awt.Desktop;
import java.net.URI;
import play.api._
import plm.core.model.Game

object Global extends GlobalSettings {

  override def onStart(app: Application) {
    Logger.info("Application has started")
    Game.getInstance()
    //Desktop.getDesktop().browse(new URI("http://localhost:9000"));
  }
}