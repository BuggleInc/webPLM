(function(){
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
			this.msg = data.msg;
			this.firstApply = true;
		};
		
		ChangeCellContent.prototype.apply = function (currentWorld) {
			var cell = currentWorld.getCell(this.x, this.y);
			cell.content = this.newContent;
			if(this.firstApply) {
				var obj = {
					step: currentWorld.steps.length,
					msg: this.msg
				};
				currentWorld.steps.push(obj);
				this.firstApply = false;
			}	
		};
		
		ChangeCellContent.prototype.reverse = function (currentWorld) {
			var cell = currentWorld.getCell(this.x, this.y);
			cell.content = this.oldContent;
		};
	
		return ChangeCellContent;
	}
})();