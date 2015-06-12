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
            this.isSelected = false;
		};
        
        BuggleWorldCell.prototype.isColored = function() {
            var isColored = false;
            var i = 0;
            while(!isColored && i < this.color.length) {
                isColored = (this.color[i] !== 255);
                i++;
            }
            return isColored;
        };
        
        BuggleWorldCell.prototype.isEmpty = function() {
            return !(this.isColored() || this.hasBaggle || this.hasContent || this.hasLeftWall || this.hasTopWall);
        };
        
        BuggleWorldCell.prototype.toLightJSON = function() {
            var cell = {}
            cell.x = this.x;
            cell.y = this.y;
            if(this.isColored()) cell.color = this.color;
            if(this.hasBaggle)   cell.hasBaggle = this.hasBaggle;
            if(this.hasLeftWall) cell.hasLeftWall = this.hasLeftWall;
            if(this.hasTopWall)  cell.hasTopWall = this.hasTopWall;
            if(this.hasContent) {
                cell.hasContent = this.hasContent;
                cell.content = this.content;
            }
            
            return cell;
        };
        
		return BuggleWorldCell;
	}
})();