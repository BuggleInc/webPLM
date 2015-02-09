(function(){
	'use strict';
	angular
		.module('PLMApp')
		.factory('BuggleDontHaveBaggle', BuggleDontHaveBaggle);
	
	function BuggleDontHaveBaggle () {
		
		var BuggleDontHaveBaggle = function (data) {
			this.buggleID = data.buggleID;
			this.firstApply = true;
		};
		
		BuggleDontHaveBaggle.prototype.apply = function (currentWorld) {
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: 'Buggle '+this.buggleID+' tried to drop a baggle but he doesn\'t have one...'
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}		
		};
		
		BuggleDontHaveBaggle.prototype.reverse = function (currentWorld) {
			
		};
	
		return BuggleDontHaveBaggle;
	}
})();