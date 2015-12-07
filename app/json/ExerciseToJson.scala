package json

import play.api.libs.json._
import plm.core.model.lesson.Lecture
import plm.core.model.lesson.Exercise
import plm.core.lang.ProgrammingLanguage
import plm.universe.World
import exceptions.NonImplementedWorldException
import plm.core.model.lesson.Exercise.WorldKind
import json.world.WorldToJson
import java.util.Locale

object ExerciseToJson {

  def exerciseWrites(exercise: Exercise, progLang: ProgrammingLanguage, code: String, currentLocale: Locale): JsObject = {
    var progLangArray = exercise.getProgLanguages.toArray(Array[ProgrammingLanguage]())

    var json: JsObject = Json.obj(
      "id" -> exercise.getId,
      "instructions" -> exercise.getMission(currentLocale.getLanguage, progLang),
      "code" -> code,
      "selectedWorldID" -> exercise.getWorld(0).getName,
      "api" -> "",
      "programmingLanguages" -> ProgrammingLanguageToJson.programmingLanguagesWrite(progLangArray),
      "currentProgrammingLanguage" -> progLang.getLang,
      "toolbox" -> ""
    )

    try {
      json = json ++ Json.obj(
          "initialWorlds" -> WorldToJson.worldsWrite(exercise.getWorlds(WorldKind.INITIAL).toArray(Array[World]()))
      )
    }
    catch {
      case e: NonImplementedWorldException =>
        json = json ++ Json.obj(
          "exception" -> "nonImplementedWorldException"
        )
    }

    json
  }
}