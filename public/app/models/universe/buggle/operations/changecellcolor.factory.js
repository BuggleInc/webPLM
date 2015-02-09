(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeCellColor', ChangeCellColor);
	
	function ChangeCellColor () {
		
		var ChangeCellColor = function (data) {
			this.x = data.cell.x;
			this.y = data.cell.y;
			this.newColor = data.newColor;
			this.oldColor = data.oldColor;
		};
		
		ChangeCellColor.prototype.apply = function (currentWorld) {
			var cell = currentWorld.getCell(this.x, this.y);
			cell.color = this.newColor;
		};
		
		ChangeCellColor.prototype.reverse = function (currentWorld) {
			var cell = currentWorld.getCell(this.x, this.y);
			cell.color = this.oldColor;
		};
	
		return ChangeCellColor;
	}
})();