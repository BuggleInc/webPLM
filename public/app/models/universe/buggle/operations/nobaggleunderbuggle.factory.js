(function(){
	'use strict';
	angular
		.module('PLMApp')
		.factory('NoBaggleUnderBuggle', NoBaggleUnderBuggle);
	
	function NoBaggleUnderBuggle () {
		
		var NoBaggleUnderBuggle = function (data) {
			this.buggleID = data.buggleID;
			this.msg = data.msg;
			this.firstApply = true;
		};
		
		NoBaggleUnderBuggle.prototype.apply = function (currentWorld) {
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: this.msg
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}		
		};
		
		NoBaggleUnderBuggle.prototype.reverse = function (currentWorld) {
			
		};
	
		return NoBaggleUnderBuggle;
	}
})();