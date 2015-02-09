(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeCellHasBaggle', ChangeCellHasBaggle);
	
	function ChangeCellHasBaggle () {
		
		var ChangeCellHasBaggle = function (data) {
			this.x = data.cell.x;
			this.y = data.cell.y;
			this.newHasBaggle = data.newHasBaggle;
			this.oldHasBaggle = data.oldHasBaggle;
		};
		
		ChangeCellHasBaggle.prototype.apply = function (currentWorld) {
			var cell = currentWorld.getCell(this.x, this.y);
			cell.hasBaggle = this.newHasBaggle;
		};
		
		ChangeCellHasBaggle.prototype.reverse = function (currentWorld) {
			var cell = currentWorld.getCell(this.x, this.y);
			cell.hasBaggle = this.oldHasBaggle;
		};
	
		return ChangeCellHasBaggle;
	}
})();