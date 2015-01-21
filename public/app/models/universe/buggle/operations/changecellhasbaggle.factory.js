(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeCellHasBaggle', ChangeCellHasBaggle);
	
	function ChangeCellHasBaggle () {
		
		var ChangeCellHasBaggle = function (data) {
			this.x = data.x;
			this.y = data.y;
			this.newHasBaggle = data.newHasBaggle;
			this.oldHasBaggle = data.oldHasBaggle;
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