package json.world

import play.api.libs.json._
import plm.universe.World
import plm.universe.GridWorld
import plm.universe.Entity
import json.entity.EntityToJson
import play.api.libs.json.Json.toJsFieldJsValueWrapper

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
    }
    
    var entities = world.getEntities.toArray(Array[Entity]())
    json = json.as[JsObject] ++ Json.obj(
        "entities" -> EntityToJson.entitiesWrite(entities)
    )
    
    return Json.obj( 
        world.getName -> json
    )
  }
}