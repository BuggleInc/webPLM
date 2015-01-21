(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeBuggleDirection', ChangeBuggleDirection);
	
	function ChangeBuggleDirection () {
		
		var ChangeBuggleDirection = function (buggleID, newDirection, oldDirection) {
			this.buggleID = buggleID;
			this.newDirection = newDirection;
			this.oldDirection = oldDirection;
		};
		
		ChangeBuggleDirection.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.buggles[this.buggleID];
			buggle.setDirection(this.newDirection);
		};
		
		ChangeBuggleDirection.prototype.reverse = function (currentWorld) {
			var buggle = currentWorld.buggles[this.buggleID];
			buggle.setDirection(this.oldDirection);
		};
	
		return ChangeBuggleDirection;
	}
})();