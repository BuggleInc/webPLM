(function(){
	'use strict';
	angular
		.module('PLMApp')
		.factory('BuggleAlreadyHaveBaggle', BuggleAlreadyHaveBaggle);
	
	function BuggleAlreadyHaveBaggle () {
		
		var BuggleAlreadyHaveBaggle = function (data) {
			this.buggleID = data.buggleID;
			this.firstApply = true;
		};
		
		BuggleAlreadyHaveBaggle.prototype.apply = function (currentWorld) {
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: 'Buggle '+this.buggleID+' tried to pick up a baggle while he had already one...'
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}		
		};
		
		BuggleAlreadyHaveBaggle.prototype.reverse = function (currentWorld) {
			
		};
	
		return BuggleAlreadyHaveBaggle;
	}
})();