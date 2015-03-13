(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BuggleInOuterSpace', BuggleInOuterSpace);
	
	function BuggleInOuterSpace () {
		
		var BuggleInOuterSpace = function (data) {
			this.buggleID = data.buggleID;
			this.msg = data.msg;
			this.firstApply = true;
		};
		
		BuggleInOuterSpace.prototype.apply = function (currentWorld) {
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: this.msg
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}		
		};
		
		BuggleInOuterSpace.prototype.reverse = function (currentWorld) {
			
		};
	
		return BuggleInOuterSpace;
	}
})();