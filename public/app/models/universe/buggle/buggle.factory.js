(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('Buggle', Buggle);
	
	Buggle.$inject = ['Direction'];
	
	function Buggle (Direction) {
		
		var Buggle = function (x, y, color, direction, carryBaggle) {
			this.x = x;
			this.y = y;
			this.color = color;
			this.setDirection(direction)
			this.carryBaggle = carryBaggle;
		};
		
		Buggle.prototype.setDirection = function (direction) {
			switch(direction) {
				case Direction.NORTH_VALUE:
					this.src = '/assets/images/buggle-top.svg';
					break;
				case Direction.EAST_VALUE:
					this.src = '/assets/images/buggle-right.svg';
					break;
				case Direction.SOUTH_VALUE:
					this.src = '/assets/images/buggle-bot.svg';
					break;
				case Direction.WEST_VALUE:
					this.src = '/assets/images/buggle-left.svg';
					break;
				default:
					this.src = '/assets/images/buggle-top.svg';
			}
		};
		
		Buggle.prototype.draw = function (ctx, canvasWidth, canvasHeight, width, height) {
			var buggle = this;
			var img = new Image();
			img.onload = function() {
				buggle.drawBuggleImage(ctx, img, canvasWidth, canvasHeight, width, height);
			};
			img.src = this.src;
		};
		
		Buggle.prototype.drawBuggleImage = function (ctx, img, canvasWidth, canvasHeight, width, height) {
			var imgWidth = canvasWidth/width*0.7;
			var imgHeight = canvasHeight/height*0.7;
			
			var xLeft = canvasWidth/width*this.x +imgWidth/width;
			var yTop = canvasHeight/height*this.y +imgHeight/height;
			
			ctx.drawImage(img, xLeft, yTop, imgWidth, imgHeight);
			var imgData = ctx.getImageData(xLeft, yTop, imgWidth, imgHeight);
			var data = imgData.data;
			for(var i=0; i<data.length; i += 4) {
				// Only update buggle's pixels
				if(data[i] === 0 && data[i+1] === 0 && data[i+2] === 0) {
					data[i] = this.color[0];
					data[i+1] = this.color[1];
					data[i+2] = this.color[2];
					data[i+3] = this.color[3];
				}
			};
			ctx.putImageData(imgData, xLeft, yTop);
		};
		
		return Buggle;
	}
})();