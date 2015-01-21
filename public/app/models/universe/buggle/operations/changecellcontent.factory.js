(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeCellContent', ChangeCellContent);
	
	function ChangeCellContent () {
		
		var ChangeCellContent = function (data) {
			this.x = data.cell.x;
			this.y = data.cell.y;
			this.newContent = data.newContent;
			this.oldContent = data.oldContent;
		};
		
		ChangeCellContent.prototype.apply = function (currentWorld) {
			var cell = currentWorld.cells[this.x][this.y];
			cell.content = this.newContent;
		};
		
		ChangeCellContent.prototype.reverse = function (currentWorld) {
			var cell = currentWorld.cells[this.x][this.y];
			cell.content = this.oldContent;
		};
	
		return ChangeCellContent;
	}
})();