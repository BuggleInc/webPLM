(function ()
{
	'use strict';
	angular
		.module('PLMApp')
		.factory('HanoiView', HanoiView);

	function HanoiView()
	{
		var ctx;
		var canvasWidth;
		var canvasHeight;

		var service = {
			draw: draw,
		};

		return service;

		function initUtils(canvas, hanoiWorld)
		{
			ctx = canvas.getContext('2d');
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
		}

		function draw(canvas, hanoiWorld)
		{
			initUtils(canvas, hanoiWorld);
			ctx.beginPath();

			//draws edge of our drawArena
			ctx.strokeRect(0,0,canvasWidth,canvasHeight);

			//draws the amount of move
			drawText(hanoiWorld);

			drawColumn(hanoiWorld);

			drawDiscs(hanoiWorld);

			ctx.closePath();
		}

		function drawText(hanoiWorld)
		{
			ctx.beginPath();

			ctx.fillStyle = 'rgb(0,0,0)';
			ctx.font = '15px sans-serif';

			if(hanoiWorld.moveCount <= 1)
			ctx.fillText(hanoiWorld.moveCount+' Move',5,25);
			else ctx.fillText(hanoiWorld.moveCount+ ' Moves',5,25);
			ctx.closePath();
		}

		function drawColumn(hanoiWorld)
		{
			var slots = hanoiWorld.slotVal;
			var height = 200;
			var border = 65;
			var y = (canvasHeight - height) / 2;

			for(var i=0;i<slots.length;i++)
			{
				var x = border + (i * ((canvasWidth - border*2) / (slots.length-1)));
				ctx.beginPath();
				ctx.fillStyle = '#000000';
				ctx.fillRect(x, y, 5, height);
			}	ctx.closePath();
		}

		function drawDiscs(hanoiWorld)
		{
			var slots = hanoiWorld.slotVal;
			var height = 18, coef = 15, borderHeight = 200, borderWidth = 65, space = (borderHeight - (height * 8)) / 9;

			var x, y, width;
			
			for(var i=0;i<slots.length;i++)
			{
				for(var j=0;j<slots[i].length;j++)
				{
					width = slots[i][j] * coef;
					x = (borderWidth + (i * ((canvasWidth - borderWidth*2) / (slots.length-1))) + 2.5) - (width / 2);
					y = canvasHeight - ((canvasHeight - borderHeight) / 2) - ((space + height) * (j+1))
					ctx.beginPath();
					ctx.fillStyle = '#FFFF00';
					ctx.fillRect(x,y,width,height);
					ctx.strokeRect(x,y,width,height);
					ctx.closePath();
				}
			}
		}
	}
})();