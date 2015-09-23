(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('MoveTurtle', MoveTurtle);
	
	function MoveTurtle() {
		
		var MoveTurtle = function (data) {
			this.turtleID = data.turtleID;
			this.newX = data.newX;
			this.newY = data.newY;
			this.oldX = data.oldX;
			this.oldY = data.oldY;
		};
		
		MoveTurtle.prototype.apply = function (currentWorld) {
			var turtle = currentWorld.getEntity(this.turtleID);
			turtle.x = this.newX;
			turtle.y = this.newY;
		};
		
		MoveTurtle.prototype.reverse = function (currentWorld) {
			var turtle = currentWorld.getEntity(this.turtleID);
			turtle.x = this.oldX;
			turtle.y = this.oldY;
		};
	
		return MoveTurtle;
	}
}());