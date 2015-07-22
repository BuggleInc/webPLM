package spies

import models.PLM
import play.api.libs.json._
import actors.PLMActor
import plm.core.ProgLangChangesListener
import plm.core.lang.ProgrammingLanguage
import json.ProgrammingLanguageToJson

class ProgLangListener(plmActor: PLMActor, plm: PLM) extends ProgLangChangesListener {  
  
  def currentProgrammingLanguageHasChanged(newLang: ProgrammingLanguage) {
    var mapArgs: JsValue = Json.obj(
      "newProgLang" -> ProgrammingLanguageToJson.programmingLanguageWrite(newLang),
      "instructions" -> plm.getMission(newLang),
      "code" -> plm.getStudentCode,
      "api" -> plm.getAPI
    )
    plmActor.sendMessage("newProgLang", mapArgs)
  }
}