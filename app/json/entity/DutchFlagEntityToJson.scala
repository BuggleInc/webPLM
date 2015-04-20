package json.entity

import play.api.libs.json._
import lessons.sort.dutchflag.universe.DutchFlagEntity
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import lessons.sort.dutchflag.universe.DutchFlagEntity

object DutchFlagEntityToJson {
  
  def DutchFlagEntityWrite(dutchFlagEntity: DutchFlagEntity): JsValue = {
    Json.obj (
        "BLUE" -> DutchFlagEntity.BLUE,
        "WHITE" -> DutchFlagEntity.WHITE,
        "RED" -> DutchFlagEntity.RED)
    
  }

}