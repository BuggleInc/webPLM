package json

import exceptions.NonImplementedWorldException

import play.api.libs.json._
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.Lecture
import plm.core.lang.ProgrammingLanguage
import plm.universe.World
import json.world.WorldToJson

object LectureToJson {
  
  def lectureWrites(lecture: Lecture, progLang: ProgrammingLanguage, code: String, initialWorlds: Array[World], selectedWorldID: String): JsValue = {
    var progLangArray = lecture.asInstanceOf[Exercise].getProgLanguages.toArray(Array[ProgrammingLanguage]())
    
    var json = Json.obj(
      "id" -> lecture.getId,
      "instructions" -> lecture.getMission(progLang),
      "code" -> code,
      "selectedWorldID" -> selectedWorldID,
      "api" -> initialWorlds.head.getAbout,
      "programmingLanguages" -> ProgrammingLanguageToJson.programmingLanguagesWrite(progLangArray),
      "currentProgrammingLanguage" -> progLang.getLang
    )

    try {
      json = json.as[JsObject] ++ Json.obj(
          "initialWorlds" -> WorldToJson.worldsWrite(initialWorlds)
      )
    }
    catch {
      case e: NonImplementedWorldException =>
        json = json.as[JsObject] ++ Json.obj(
          "exception" -> "nonImplementedWorldException"
        )
    }

    return json
  }
  
  def lectureWritesForEditor (lecture: Lecture, progLang: ProgrammingLanguage, code: String, 
                              initialWorlds: Array[World], selectedWorldID: String,
                              solutionCodes: Array[(String,String)]): JsValue = {
    
    var jsonSolutions = Json.obj()
    for(solution <- solutionCodes) {
      jsonSolutions = jsonSolutions.as[JsObject] ++ Json.obj(
        solution._1.toLowerCase -> solution._2
      )
    }
    
    var json = lectureWrites(lecture, progLang, code, initialWorlds, selectedWorldID)
    json = json.as[JsObject] ++ Json.obj(
      "missionHTML" -> lecture.getRawMission(),
      "solutionCodes" -> jsonSolutions
    )
    
    return json
  }

  def instructionsWrite(lecture: Lecture, progLang: ProgrammingLanguage, initialWorlds: Array[World]): JsValue = {    
    return Json.obj(
      "instructions" -> lecture.getMission(progLang),
      "api" -> initialWorlds.head.getAbout
    )
  }
}