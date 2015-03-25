(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BuggleWorldCell', BuggleWorldCell);
	
	function BuggleWorldCell () {
		
		var BuggleWorldCell = function(cell) {
			this.x = cell.x;
			this.y = cell.y;
			this.color = cell.color;
			this.hasBaggle = cell.hasBaggle;
			this.hasContent = cell.hasContent;
			this.content = cell.content;
			this.hasLeftWall = cell.hasLeftWall;
			this.hasTopWall = cell.hasTopWall;
		};
		
		return BuggleWorldCell;
	}
})();