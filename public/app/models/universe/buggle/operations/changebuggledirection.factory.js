(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeBuggleDirection', ChangeBuggleDirection);
	
	function ChangeBuggleDirection () {
		
		var ChangeBuggleDirection = function (data) {
			this.buggleID = data.buggleID;
			this.newDirection = data.newDirection;
			this.oldDirection = data.oldDirection;
		};
		
		ChangeBuggleDirection.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.setDirection(this.newDirection);
		};
		
		ChangeBuggleDirection.prototype.reverse = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.setDirection(this.oldDirection);
		};
	
		return ChangeBuggleDirection;
	}
})();