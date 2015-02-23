package json

import play.api.libs.json._
import plm.core.model.lesson.Exercise
import plm.core.model.lesson.Lecture
import plm.core.lang.ProgrammingLanguage
import plm.universe.World
import json.world.WorldToJson

object LectureToJson {
  
  def lectureWrites(lecture: Lecture, progLang: ProgrammingLanguage, code: String, initialWorlds: Array[World], selectedWorldID: String): JsValue = {
    var progLangArray = lecture.asInstanceOf[Exercise].getProgLanguages.toArray(Array[ProgrammingLanguage]())
    Json.obj(
      "id" -> lecture.getId,
      "instructions" -> lecture.getMission(progLang),
      "code" -> code,
      "initialWorlds" -> WorldToJson.worldsWrite(initialWorlds),
      "selectedWorldID" -> selectedWorldID,
      "api" -> initialWorlds.head.getAbout,
      "programmingLanguages" -> ProgrammingLanguageToJson.programmingLanguagesWrite(progLangArray),
      "currentProgrammingLanguage" -> progLang.getLang
    )
  }
}