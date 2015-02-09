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
			this.direction = buggle.direction;
			this.carryBaggle = buggle.carryBaggle;
			this.brushDown = false;
		};

		Buggle.prototype.draw = function (ctx, canvasWidth, canvasHeight, width, height) {
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