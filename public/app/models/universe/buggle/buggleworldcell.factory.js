(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BuggleWorldCell', BuggleWorldCell);
	
	BuggleWorldCell.$inject = ['DefaultColors']
	
	function BuggleWorldCell (DefaultColors) {
		
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
		
		BuggleWorldCell.prototype.draw = function (ctx, canvasWidth, canvasHeight, width, height) {
			var xLeft = canvasWidth/width*this.x;
			var yTop = canvasHeight/height*this.y;
			
			var padX = canvasWidth/width/2;
			var padY = canvasHeight/height/2;
			
			var xRight = canvasWidth/width*(this.x+1);
			var yBottom = canvasHeight/height*(this.y+1);
			
			ctx.fillStyle = 'rgba('+this.color.join(',')+')';
			if(this.color[0] === 255 && this.color[1] === 255 && this.color[2] === 255 && this.color[3] === 255) {
				if((this.x+this.y)%2 === 0) {
					ctx.fillStyle = "rgb(230, 230, 230)";
				}
				else {
					ctx.fillStyle = "rgb(255, 255, 255)";
				}
			}
			ctx.fillRect(xLeft, yTop, xRight, yBottom);
			ctx.beginPath();
			ctx.lineWidth = 5;
			ctx.strokeStyle = 'SteelBlue';
			if(this.hasLeftWall) {
				ctx.moveTo(xLeft, yTop);
				ctx.lineTo(xLeft, yBottom);
			}
			if(this.hasTopWall) {
				ctx.moveTo(xLeft, yTop);
				ctx.lineTo(xRight, yTop);
			}
			
			ctx.stroke();
			ctx.closePath();
		
			if(this.hasBaggle) {
				ctx.beginPath(); 
				ctx.fillStyle=DefaultColors.BAGGLE;
				ctx.arc(xLeft+padX, yTop+padY, 30, 0, Math.PI*2, true);
				ctx.arc(xLeft+padX, yTop+padY, 15, 0, Math.PI*2, true);
				ctx.fill('evenodd');
				ctx.closePath();
			}
			if(this.hasContent) {
				ctx.fillStyle = DefaultColors.MESSAGE_COLOR;
				ctx.fillText(this.content, xLeft+1, yBottom-4);
			}
		};
		
		return BuggleWorldCell;
	}
})();