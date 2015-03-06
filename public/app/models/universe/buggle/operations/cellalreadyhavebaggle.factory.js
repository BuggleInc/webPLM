(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('CellAlreadyHaveBaggle', CellAlreadyHaveBaggle);
	
	function CellAlreadyHaveBaggle () {
		
		var CellAlreadyHaveBaggle = function (data) {
			this.x = data.cell.x;
			this.y = data.cell.y;
			this.msg = data.msg;
			this.firstApply = true;
		};
		
		CellAlreadyHaveBaggle.prototype.apply = function (currentWorld) {
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: this.msg
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