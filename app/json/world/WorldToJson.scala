package json.world

import exceptions.NonImplementedWorldException
import play.api.libs.json._
import plm.universe.World
import plm.universe.GridWorld
import plm.universe.turtles.TurtleWorld
import plm.universe.bat.BatWorld
import plm.universe.Entity
import json.entity.EntityToJson
import play.api.libs.json.Json.toJsFieldJsValueWrapper
import plm.universe.sort.SortingWorld
import lessons.sort.dutchflag.universe.DutchFlagWorld
import lessons.sort.pancake.universe.PancakeWorld
import json.world.pancake.PancakeWorldToJson
import lessons.sort.baseball.universe._
import json.world.baseball.BaseballWorldToJson
import lessons.recursion.hanoi.universe.HanoiWorld

object WorldToJson {
  
  def worldsWrite(worlds: Array[World]): JsValue = {
    var json: JsValue = Json.obj()
    worlds.foreach { world =>
      json = json.as[JsObject] ++ worldWrite(world).as[JsObject] 
    }
    return json
  }
 
  def worldWrite(world: World): JsValue = {
    var json: JsValue = null
    world match {
      case gridWorld: GridWorld =>
        json = GridWorldToJson.gridWorldWrite(gridWorld)
        var entities = world.getEntities.toArray(Array[Entity]())
        json = json.as[JsObject] ++ Json.obj(
            "entities" -> EntityToJson.entitiesWrite(entities)
        )
      case batWorld: BatWorld =>
      	json = BatWorldToJson.batWorlddWrite(batWorld)
      case sortingWorld: SortingWorld =>
        json = SortWorldToJson.sortWorldWrite(sortingWorld)
      case dutchFlagWorld: DutchFlagWorld =>
         json = DutchFlagWorldToJson.dutchFlagWorldWrite(dutchFlagWorld)
      case pancakeWorld: PancakeWorld =>
        json = PancakeWorldToJson.pancakeWorldWrite(pancakeWorld)
      case baseballWorld: BaseballWorld =>
        json = BaseballWorldToJson.baseballWorldWrite(baseballWorld)
      case hanoiWorld: HanoiWorld =>
        json = HanoiWorldToJson.hanoiWorldWrite(hanoiWorld)
      case turtleWorld: TurtleWorld =>
        json = TurtleWorldToJson.turtleWorldWrite(turtleWorld)
        var entities = world.getEntities.toArray(Array[Entity]())
        json = json.as[JsObject] ++ Json.obj(
            "entities" -> EntityToJson.entitiesWrite(entities)
        )
      case _ =>
        throw NonImplementedWorldException.create;
    }
    
    return Json.obj( 
        world.getName -> json
    )
  }
}