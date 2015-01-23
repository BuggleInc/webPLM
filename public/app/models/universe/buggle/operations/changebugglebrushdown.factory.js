(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeBuggleBrushDown', ChangeBuggleBrushDown);
	
	function ChangeBuggleBrushDown () {
		
		var ChangeBuggleBrushDown = function (data) {
			this.buggleID = data.buggleID;
			this.newBrushDown = data.newBrushDown;
			this.oldBrushDown = data.oldBrushDown;
			this.firstApply = true;
		};
		
		ChangeBuggleBrushDown.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.BrushDown = this.newBrushDown;
			if(this.firstApply) {
				var msg = '';
				if(this.newBrushDown) {
					msg= 'Buggle '+this.buggleID+' is now painting the floor!';	
				}
				else {
					msg = 'Buggle '+this.buggleID+' put away its brush.';
				}
				var obj = {
					step: currentWorld.steps.length,
					msg: msg
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}
		};
		
		ChangeBuggleBrushDown.prototype.reverse = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.BrushDown = this.oldBrushDown;
		};
	
		return ChangeBuggleBrushDown;
	}
})();