(function(){
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
			this.msg = data.msg;
			this.firstApply = true;
		};
		
		MoveBuggleOperation.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.getEntity(this.buggleID);
			buggle.x = this.newX;
			buggle.y = this.newY;
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: this.msg
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}
		};
		
		MoveBuggleOperation.prototype.reverse = function (currentWorld) {
			var buggle = currentWorld.getEntity(this.buggleID);
			buggle.x = this.oldX;
			buggle.y = this.oldY;
		};
	
		return MoveBuggleOperation;
	}
})();