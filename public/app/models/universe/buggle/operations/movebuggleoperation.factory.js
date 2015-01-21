(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('MoveBuggleOperation', MoveBuggleOperation);
	
	function MoveBuggleOperation (BuggleWorldCell) {
		
		var MoveBuggleOperation = function (buggleID, newX, newY, oldX, oldY) {
			this.buggleID = buggleID;
			this.newX = newX;
			this.newY = newY;
			this.oldX = oldX;
			this.oldY = oldY;
		};
		
		MoveBuggleOperation.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.buggles[this.buggleID];
			buggle.x = this.newX;
			buggle.y = this.newY;
		};
		
		MoveBuggleOperation.prototype.reverse = function (currentWorld) {
			var buggle = currentWorld.buggles[this.buggleID];
			buggle.x = this.oldX;
			buggle.y = this.oldY;
		};
	
		return MoveBuggleOperation;
	}
})();