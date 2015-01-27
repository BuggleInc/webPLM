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
			this.firstApply = true;
		};
		
		ChangeBuggleDirection.prototype.apply = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.setDirection(this.newDirection);
			if(this.firstApply) {
				var direction = '';
				switch(this.newDirection) {
					case Direction.NORTH_VALUE:
						direction = 'north';
						break;
					case Direction.EAST_VALUE:
						direction = 'east';
						break;
					case Direction.SOUTH_VALUE:
						direction = 'south';
						break;
					case Direction.WEST_VALUE:
						direction = 'west';
						break;
				}
				var obj = {
					step: currentWorld.steps.length,
					msg: 'Buggle '+this.buggleID+' now faces the ' + direction
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}
		};
		
		ChangeBuggleDirection.prototype.reverse = function (currentWorld) {
			var buggle = currentWorld.entities[this.buggleID];
			buggle.setDirection(this.oldDirection);
		};
	
		return ChangeBuggleDirection;
	}
})();