(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('CellAlreadyHaveBaggle', CellAlreadyHaveBaggle);
	
	function CellAlreadyHaveBaggle () {
		
		var CellAlreadyHaveBaggle = function (data) {
			this.x = data.cell.x;
			this.y = data.cell.y;
			this.firstApply = true;
		};
		
		CellAlreadyHaveBaggle.prototype.apply = function (currentWorld) {
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: 'Tried to drop a baggle but there is already one in ('+ this.x +', '+ this.y +')...'
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}		
		};
		
		CellAlreadyHaveBaggle.prototype.reverse = function (currentWorld) {
			
		};
	
		return CellAlreadyHaveBaggle;
	}
})();