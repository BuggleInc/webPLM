package modules

import com.google.inject._
import com.google.inject.AbstractModule
import java.awt.Desktop
import net.codingwell.scalaguice.ScalaModule
import java.net.URI
import play.api.Configuration

/**
 * @author matthieu$
 */

class Browser @Inject()(configuration: Configuration) {
  if(Desktop.isDesktopSupported)
  {
    Desktop.getDesktop.browse(new URI("http://localhost:9000"))
  }
}


class BrowserModule extends AbstractModule with ScalaModule {
  def configure() = {
    bind(classOf[Browser]).asEagerSingleton
  }
}