(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BuggleEncounterWall', BuggleEncounterWall);
	
	function BuggleEncounterWall () {
		
		var BuggleEncounterWall = function (data) {
			this.buggleID = data.buggleID;
			this.firstApply = true;
		};
		
		BuggleEncounterWall.prototype.apply = function (currentWorld) {
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: 'Buggle '+this.buggleID+' encountered a wall...'
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