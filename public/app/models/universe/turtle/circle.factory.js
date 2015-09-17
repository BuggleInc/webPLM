(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('Circle', Circle);
	
	function Circle() {
		
		var Circle = function (circle) {
      this.type = 'circle';
			this.x = circle.x;
			this.y = circle.y;
      this.radius = circle.radius;
			this.color = circle.color;
		};
		
		return Circle;
	}
}());