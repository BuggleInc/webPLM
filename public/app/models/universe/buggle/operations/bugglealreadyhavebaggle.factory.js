(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BuggleAlreadyHaveBaggle', BuggleAlreadyHaveBaggle);
	
	function BuggleAlreadyHaveBaggle () {
		
		var BuggleAlreadyHaveBaggle = function (data) {
			this.buggleID = data.buggleID;
			this.msg = data.msg;
			this.firstApply = true;
		};
		
		BuggleAlreadyHaveBaggle.prototype.apply = function (currentWorld) {
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: this.msg
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