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
			this.firstApply = true;
		};
		
		MoveBuggleOperation.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.x = this.newX;
			buggle.y = this.newY;
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: 'Buggle '+this.buggleID+' moved from ('+this.oldX+','+
						this.oldY+') to ('+this.newX+','+this.newY+')'
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}
		};
		
		MoveBuggleOperation.prototype.reverse = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.x = this.oldX;
			buggle.y = this.oldY;
		};
	
		return MoveBuggleOperation;
	}
})();