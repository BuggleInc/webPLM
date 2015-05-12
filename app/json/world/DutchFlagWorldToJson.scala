package json.world

import play.api.libs.json._
import lessons.sort.dutchflag.universe.DutchFlagWorld

object DutchFlagWorldToJson {

  def dutchFlagWorldWrite(dutchFlagWorld: DutchFlagWorld): JsValue = {
    Json.obj(
        "type" -> "DutchFlagWorld",
        "content" -> dutchFlagWorld.getContent,
        "moveCount" -> dutchFlagWorld.getMove
    )
  }
}