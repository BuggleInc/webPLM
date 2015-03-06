(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BuggleEncounterWall', BuggleEncounterWall);
	
	function BuggleEncounterWall () {
		
		var BuggleEncounterWall = function (data) {
			this.buggleID = data.buggleID;
			this.msg = data.msg;
			this.firstApply = true;
		};
		
		BuggleEncounterWall.prototype.apply = function (currentWorld) {
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: this.msg
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}		
		};
		
		BuggleEncounterWall.prototype.reverse = function (currentWorld) {
			
		};
	
		return BuggleEncounterWall;
	}
})();