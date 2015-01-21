(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeCellHasBaggle', ChangeCellHasBaggle);
	
	function ChangeCellHasBaggle () {
		
		var ChangeCellHasBaggle = function (x, y, newHasBaggle, oldHasBaggle) {
			this.x = x;
			this.y = y;
			this.newHasBaggle = newHasBaggle;
			this.oldHasBaggle = oldHasBaggle;
		};
		
		ChangeCellHasBaggle.prototype.apply = function (currentWorld) {
			var cell = currentWorld.cells[this.x][this.y];
			cell.hasBaggle = this.newHasBaggle;
		};
		
		ChangeCellHasBaggle.prototype.reverse = function (currentWorld) {
			var cell = currentWorld.cells[this.x][this.y];
			cell.hasBaggle = this.oldHasBaggle;
		};
	
		return ChangeCellHasBaggle;
	}
})();