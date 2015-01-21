(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeCellColor', ChangeCellColor);
	
	function ChangeCellColor () {
		
		var ChangeCellColor = function (x, y, newColor, oldColor) {
			this.x = x;
			this.y = y;
			this.newColor = newColor;
			this.oldColor = oldColor;
		};
		
		ChangeCellColor.prototype.apply = function (currentWorld) {
			var cell = currentWorld.cells[this.x][this.y];
			cell.color = this.newColor;
		};
		
		ChangeCellColor.prototype.reverse = function (currentWorld) {
			var cell = currentWorld.cells[this.x][this.y];
			cell.color = this.oldColor;
		};
	
		return ChangeCellColor;
	}
})();