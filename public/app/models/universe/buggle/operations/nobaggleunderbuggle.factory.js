(function(){
	'use strict';
	angular
		.module('PLMApp')
		.factory('NoBaggleUnderBuggle', NoBaggleUnderBuggle);
	
	function NoBaggleUnderBuggle () {
		
		var NoBaggleUnderBuggle = function (data) {
			this.buggleID = data.buggleID;
			this.firstApply = true;
		};
		
		NoBaggleUnderBuggle.prototype.apply = function (currentWorld) {
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: 'Buggle '+this.buggleID+' tried to pick up a baggle while there were none...'
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