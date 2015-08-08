package json

import exceptions.NonImplementedWorldException

import play.api.libs.json._
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.Lecture
import plm.core.lang.ProgrammingLanguage
import plm.universe.World
import json.world.WorldToJson
import models.PLM

object LectureToJson {
  
  def lectureWrites(plm : PLM, lecture: Lecture, progLang: ProgrammingLanguage, code: String, initialWorlds: Array[World], selectedWorldID: String): JsValue = {
    var progLangArray = lecture.asInstanceOf[Exercise].getProgLanguages.toArray(Array[ProgrammingLanguage]())
    
    var json = Json.obj(
      "id" -> lecture.getId,
      "instructions" -> plm.getMission(progLang),
      "code" -> code,
      "selectedWorldID" -> selectedWorldID,
      "api" -> initialWorlds.head.getAbout,
      "programmingLanguages" -> ProgrammingLanguageToJson.programmingLanguagesWrite(progLangArray),
      "currentProgrammingLanguage" -> progLang.getLang,
      "toolbox" -> lecture.getToolbox
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

  def instructionsWrite(lecture: Lecture, progLang: ProgrammingLanguage, initialWorlds: Array[World]): JsValue = {    
    return Json.obj(
      "instructions" -> lecture.getMission(progLang),
      "api" -> initialWorlds.head.getAbout
    )
  }
}
