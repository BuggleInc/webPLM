package models

import play.api.libs.json._

class UserData(UserUUID : String) { 
	var currentExercise : String = _;
	var lastResult : JsValue = _;
	var code : String = _;
	var ProgrammingLanguage : String = _;
	var Localization : String = _;
	
	
}
