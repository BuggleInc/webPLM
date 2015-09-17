(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('Line', Line);
	
	function Line() {
		
		var Line = function (line) {
      this.type = 'line';
			this.x1 = line.x1;
			this.y1 = line.y1;
      this.x2 = line.x2;
			this.y2 = line.y2;
			this.color = line.color;
		};
		
		return Line;
	}
}());