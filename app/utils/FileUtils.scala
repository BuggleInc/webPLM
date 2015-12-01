package utils

import java.io.IOException
import java.io.FileNotFoundException
import scala.io.Source
import play.api.Logger

/**
 * @author matthieu
 */
object FileUtils {
  def readFile(path: String): Option[String] = {
    var fileContent: Option[String] = None
    try {
      fileContent = Some(Source.fromFile(path).mkString)
    } catch {
    case e: FileNotFoundException => Logger.error("Couldn't find that file.")
    case e: IOException => Logger.error("Got an IOException!")
    }
    fileContent
  }
}
