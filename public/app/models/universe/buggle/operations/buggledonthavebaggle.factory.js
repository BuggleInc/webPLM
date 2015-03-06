(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BuggleDontHaveBaggle', BuggleDontHaveBaggle);
	
	function BuggleDontHaveBaggle () {
		
		var BuggleDontHaveBaggle = function (data) {
			this.buggleID = data.buggleID;
			this.msg = data.msg;
			this.firstApply = true;
		};
		
		BuggleDontHaveBaggle.prototype.apply = function (currentWorld) {
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: this.msg
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