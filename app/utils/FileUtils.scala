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
      case e: FileNotFoundException => Logger.error(s"Couldn't find file $path.")
      case e: IOException => Logger.error(s"Got an IOException while reading $path!")
    }
    fileContent
  }
}
