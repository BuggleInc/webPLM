package spies

import java.util.Locale;
import models.PLM
import play.api.libs.json._
import actors.PLMActor
import plm.core.HumanLangChangesListener
import plm.core.lang.ProgrammingLanguage
import json.LectureToJson
import json.LessonToJson
import json.LangToJson

class HumanLangListener(plmActor: PLMActor, plm: PLM) extends HumanLangChangesListener {  
  
  def currentHumanLanguageHasChanged(newLang: Locale) {
    var mapArgs: JsObject = Json.obj(
      "newHumanLang" -> LangToJson.langWrite(plm._currentLang),
      "lessons" -> LessonToJson.lessonsWrite(plm.lessons)
    )
    if(plm.currentExercise != null)
      mapArgs = mapArgs ++ LectureToJson.instructionsWrite(plm.currentExercise, plm.programmingLanguage, plm.getInitialWorlds).as[JsObject]
    plmActor.sendMessage("newHumanLang", mapArgs)
  }
}