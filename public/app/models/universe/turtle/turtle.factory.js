(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('Turtle', Turtle);
	
	function Turtle() {
		
		var Turtle = function (turtle) {
			this.x = turtle.x;
			this.y = turtle.y;
			this.direction = turtle.direction;
      this.visible = true;
		};
		
		return Turtle;
	}
}());