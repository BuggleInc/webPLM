(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('Buggle', Buggle);
	
	Buggle.$inject = ['Direction'];
	
	function Buggle (Direction) {
		
		var Buggle = function (buggle) {
			this.x = buggle.x;
			this.y = buggle.y;
			this.color = buggle.color;
			this.setDirection(buggle.direction);
			this.carryBaggle = buggle.carryBaggle;
			this.brushDown = false;
		};
		
		Buggle.prototype.setDirection = function (direction) {
			this.direction = direction;
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
				buggle.drawBuggle(ctx, img, canvasWidth, canvasHeight, width, height);
			};
			img.src = this.src;
		};
		
		Buggle.prototype.drawBuggle = function (ctx, img, canvasWidth, canvasHeight, width, height) {
			var dx, dy;

			var scaleFactor = 0.6;
			var cellWidth = canvasWidth / width;
			var cellHeight = canvasHeight / height;
			var pixW = scaleFactor * cellWidth / INVADER_SPRITE_SIZE;
			var pixY = scaleFactor * cellHeight / INVADER_SPRITE_SIZE;
			var padX = 0.5*(1-scaleFactor)*cellWidth;
			var padY = 0.5*(1-scaleFactor)*cellHeight;

			var ox = this.x * cellWidth;
			var oy = this.y * cellHeight;

			ctx.beginPath();
			ctx.fillStyle = 'rgba('+this.color.join(',')+')';

			for(dy=0; dy<INVADER_SPRITE_SIZE; dy++) {
				for(dx=0; dx<INVADER_SPRITE_SIZE; dx++) {
					if(INVADER_SPRITE[this.direction][dy][dx] === 1) {
						ctx.fillRect(padX+ox+dx*pixW, padY+oy+dy*pixY, pixW, pixY);
					}
				}
			}
			ctx.closePath();
		};
		
		return Buggle;
	}

	var INVADER_SPRITE_SIZE = 11;
	var INVADER_SPRITE = [
		[
			[ 0,0,0,0,0,0,0,0,0,0,0 ],
			[ 0,0,1,0,0,0,0,0,1,0,0 ],
			[ 0,0,0,1,0,0,0,1,0,0,0 ],
			[ 0,0,1,1,1,1,1,1,1,0,0 ],
			[ 0,1,1,0,1,1,1,0,1,1,0 ],
			[ 1,1,1,1,1,1,1,1,1,1,1 ],
			[ 1,0,1,1,1,1,1,1,1,0,1 ],
			[ 1,0,1,0,0,0,0,0,1,0,1 ],
			[ 0,0,0,1,1,0,1,1,0,0,0 ],
			[ 0,0,0,0,0,0,0,0,0,0,0 ],
			[ 0,0,0,0,0,0,0,0,0,0,0 ],
		],
		[
		    [ 0,0,0,1,1,1,0,0,0,0,0 ],
			[ 0,0,0,0,0,1,1,0,0,0,0 ],
			[ 0,0,0,1,1,1,1,1,0,1,0 ],
			[ 0,0,1,0,1,1,0,1,1,0,0 ],
			[ 0,0,1,0,1,1,1,1,0,0,0 ],
			[ 0,0,0,0,1,1,1,1,0,0,0 ],
			[ 0,0,1,0,1,1,1,1,0,0,0 ],
			[ 0,0,1,0,1,1,0,1,1,0,0 ],
			[ 0,0,0,1,1,1,1,1,0,1,0 ],
			[ 0,0,0,0,0,1,1,0,0,0,0 ],
			[ 0,0,0,1,1,1,0,0,0,0,0 ]
		],
		[
			[ 0,0,0,0,0,0,0,0,0,0,0 ],
			[ 0,0,0,0,0,0,0,0,0,0,0 ],
			[ 0,0,0,1,1,0,1,1,0,0,0 ],
			[ 1,0,1,0,0,0,0,0,1,0,1 ],
			[ 1,0,1,1,1,1,1,1,1,0,1 ],
			[ 1,1,1,1,1,1,1,1,1,1,1 ],
			[ 0,1,1,0,1,1,1,0,1,1,0 ],
			[ 0,0,1,1,1,1,1,1,1,0,0 ],
			[ 0,0,0,1,0,0,0,1,0,0,0 ],
			[ 0,0,1,0,0,0,0,0,1,0,0 ],
			[ 0,0,0,0,0,0,0,0,0,0,0 ],
		],
		[
			[ 0,0,0,0,0,1,1,1,0,0,0 ],
			[ 0,0,0,0,1,1,0,0,0,0,0 ],
			[ 0,1,0,1,1,1,1,1,0,0,0 ],
			[ 0,0,1,1,0,1,1,0,1,0,0 ],
			[ 0,0,0,1,1,1,1,0,1,0,0 ],
			[ 0,0,0,1,1,1,1,0,0,0,0 ],
			[ 0,0,0,1,1,1,1,0,1,0,0 ],
			[ 0,0,1,1,0,1,1,0,1,0,0 ],
			[ 0,1,0,1,1,1,1,1,0,0,0 ],
			[ 0,0,0,0,1,1,0,0,0,0,0 ],
			[ 0,0,0,0,0,1,1,1,0,0,0 ]
		]
	];
})();