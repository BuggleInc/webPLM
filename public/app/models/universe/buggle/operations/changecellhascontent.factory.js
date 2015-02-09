(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeCellHasContent', ChangeCellHasContent);
	
	function ChangeCellHasContent () {
		
		var ChangeCellHasContent = function (data) {
			this.x = data.cell.x;
			this.y = data.cell.y;
			this.newHasContent = data.newHasContent;
			this.oldHasContent = data.oldHasContent;
		};
		
		ChangeCellHasContent.prototype.apply = function (currentWorld) {
			var cell = currentWorld.getCell(this.x, this.y);
			cell.hasContent = this.newHasContent;
		};
		
		ChangeCellHasContent.prototype.reverse = function (currentWorld) {
			var cell = currentWorld.getCell(this.x, this.y);
			cell.hasContent = this.oldHasContent;
		};
	
		return ChangeCellHasContent;
	}
})();