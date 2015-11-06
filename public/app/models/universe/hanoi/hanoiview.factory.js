(function () {
	'use strict';
	angular
		.module('PLMApp')
		.factory('HanoiView', HanoiView);

	function HanoiView() {
		var ctx, canvasWidth, canvasHeight;

		var service = {
			draw: draw
		};

		return service;

		function initUtils(canvas) {
			ctx = canvas.getContext('2d');
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
		}

		function draw(canvas, hanoiWorld) {
			initUtils(canvas);
			ctx.beginPath();

			//draws edge of our drawArena
			ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

			//draws the amount of move
			drawMoveCount(hanoiWorld.moveCount);

			//draws towers of Hanoi
			drawColumn(hanoiWorld.slots.length);

			//draws discs
			drawDisks(hanoiWorld.slots);
			ctx.closePath();
		}

		function drawMoveCount(moveCount) {
			ctx.beginPath();
			ctx.fillStyle = 'rgb(0,0,0)';
			ctx.font = '15px sans-serif';
			if (moveCount <= 1) {
        ctx.fillText(moveCount + ' Move', 5, 25);
      } else {
        ctx.fillText(moveCount + ' Moves', 5, 25);
      }
      ctx.closePath();
		}

		function drawColumn(nbColumns) {
      var height, border, x, y, i;

      height = 300;
			border = 65;
			y = (canvasHeight - height) / 2;

			for (i = 0; i < nbColumns; i += 1) {
				x = border + (i * ((canvasWidth - border * 2) / (nbColumns - 1)));
				ctx.beginPath();
				ctx.fillStyle = '#000000';
				ctx.fillRect(x, y, 5, height);
				ctx.closePath();
			}
		}

		function drawDisks(slots) {
      var x, y, width, height, coef, borderHeight, borderWidth, space, i, j, disk;

			height = 18;
      coef = 15;
      borderHeight = 300;
      borderWidth = 65;
      space = (borderHeight - (height * 15)) / 9;

			for (i = 0; i < slots.length; i += 1) {
				for (j = 0; j < slots[i].length; j += 1) {
          disk = slots[i][j];
					width = disk.size * coef;
					x = (borderWidth + (i * ((canvasWidth - borderWidth * 2) / (slots.length - 1))) + 2.5) - (width / 2);
					y = canvasHeight - ((canvasHeight - borderHeight) / 2) - ((space + height) * (j + 1));
					ctx.beginPath();
					ctx.fillStyle = getColorToRGBA(disk.color);
					ctx.fillRect(x, y, width, height);
					ctx.strokeRect(x, y, width, height);
					ctx.closePath();
				}
			}
		}

    function getColorToRGBA(color) {
      return 'rgba(' + color.join(',') + ')';
    }
	}
}());
