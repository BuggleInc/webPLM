package json.world.baseball

import plm.universe.baseball.BaseballWorld
import play.api.libs.json.Json.JsValueWrapper
import play.api.libs.json._

object BaseballWorldToJson 
{

   def baseballWorldWrite(baseballWorld: BaseballWorld): JsValue = {
     Json.obj(
         "type" -> "BaseballWorld",
         "field" -> baseballWorld.getField,
         "baseAmount" -> baseballWorld.getBasesAmount,
         "posAmount" -> baseballWorld.getPositionsAmount,
         "moveCount" -> baseballWorld.getMoveCount(),
         "holePos" -> baseballWorld.getHolePosition,
         "holeBase" -> baseballWorld.getHoleBase)
   }
}