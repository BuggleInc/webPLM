package json

import java.awt.Color

/**
 * @author matthieu
 */
object Utils {
  def colorToWrapper(color: Color): List[Int] = {
    List[Int](color.getRed, color.getGreen, color.getBlue, color.getAlpha)
  }
}