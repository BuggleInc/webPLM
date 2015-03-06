(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeBuggleDirection', ChangeBuggleDirection);
	
	ChangeBuggleDirection.$inject = ['Direction'];

	function ChangeBuggleDirection (Direction) {
		
		var ChangeBuggleDirection = function (data) {
			this.buggleID = data.buggleID;
			this.newDirection = data.newDirection;
			this.oldDirection = data.oldDirection;
			this.msg = data.msg;
			this.firstApply = true;
		};
		
		ChangeBuggleDirection.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.getEntity(this.buggleID);
			buggle.direction = this.newDirection;
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: this.msg
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}
		};
		
		ChangeBuggleDirection.prototype.reverse = function (currentWorld) {
			var buggle = currentWorld.getEntity(this.buggleID);
			buggle.direction = this.oldDirection;
		};
	
		return ChangeBuggleDirection;
	}
})();