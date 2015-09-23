(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('RotateTurtle', RotateTurtle);
	
	function RotateTurtle() {
		
		var RotateTurtle = function (data) {
			this.turtleID = data.turtleID;
			this.newHeading = data.newHeading;
			this.oldHeading = data.oldHeading;
		};
		
		RotateTurtle.prototype.apply = function (currentWorld) {
			var turtle = currentWorld.getEntity(this.turtleID);
			turtle.direction = this.newHeading;
		};
		
		RotateTurtle.prototype.reverse = function (currentWorld) {
			var turtle = currentWorld.getEntity(this.turtleID);
			turtle.direction = this.oldHeading;
		};
	
		return RotateTurtle;
	}
}());