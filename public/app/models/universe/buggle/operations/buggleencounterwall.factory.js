(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BuggleEncounterWall', BuggleEncounterWall);
	
	function BuggleEncounterWall () {
		
		var BuggleEncounterWall = function (data) {
			this.buggleID = data.buggleID;
		};
		
		BuggleEncounterWall.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			console.log('Buggle '+this.buggleID+' encountered a wall...');
		};
		
		BuggleEncounterWall.prototype.reverse = function (currentWorld) {
			
		};
	
		return BuggleEncounterWall;
	}
})();