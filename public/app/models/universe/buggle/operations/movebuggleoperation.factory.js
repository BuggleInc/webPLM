(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('MoveBuggleOperation', MoveBuggleOperation);
	
	function MoveBuggleOperation (BuggleWorldCell) {
		
		var MoveBuggleOperation = function (data) {
			this.buggleID = data.buggleID;
			this.newX = data.newX;
			this.newY = data.newY;
			this.oldX = data.oldX;
			this.oldY = data.oldY;
		};
		
		MoveBuggleOperation.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.x = this.newX;
			buggle.y = this.newY;
		};
		
		MoveBuggleOperation.prototype.reverse = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.x = this.oldX;
			buggle.y = this.oldY;
		};
	
		return MoveBuggleOperation;
	}
})();