(function ()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('DutchFlagView', DutchFlagView);

	function DutchFlagView()
	{
		var ctx;
		var canvasWidth;
		var canvasHeight;

		var service = {
			draw: draw,
		};

		return service;

		function initUtils(canvas, dutchFlagWorld)
		{
			ctx=canvas.getContext('2d');
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
		}

		function draw(canvas, dutchFlagWorld)
		{
			initUtils(canvas, dutchFlagWorld);
			ctx.beginPath();

			//draws egde of our drawArena
			ctx.strokeRect(0,0,canvasWidth,canvasHeight);
			ctx.closePath();

			
			drawRectangle(dutchFlagWorld);
			drawText(dutchFlagWorld);
			
		}


		function drawText(dutchFlagWorld)
		{
			ctx.beginPath();

			ctx.fillStyle = 'rgb(0,0,0)';
			ctx.font = '15px sans-serif';

			if(dutchFlagWorld.moveCount <= 1) {
				ctx.fillText(dutchFlagWorld.moveCount+' Move',5,25);
			}
			else {
				ctx.fillText(dutchFlagWorld.moveCount+ ' Moves',5,25);
			}
			ctx.closePath();
		}

		function drawRectangle(dutchFlagWorld)
		{
			//each rectangle has its height
			var heightUnit = canvasHeight / dutchFlagWorld.content.length;

			var width = canvasWidth;

			for(var i=0; i<dutchFlagWorld.content.length; i++)
			{
				//each rectangle takes place in the canvasHeight
				var y = heightUnit * i;

				ctx.beginPath();

				//to know the color of each rectangle, we are looking its value
				switch(dutchFlagWorld.content[i])
				{
					case 0 :
						ctx.fillStyle = '#0000FF';
						break;
					case 1 :
						ctx.fillStyle = '#FFFFFF';
						break;
					case 2 :
						ctx.fillStyle = '#FF0000';
						break;
				}

				//draws rectangles
				ctx.fillRect(0, y, width, heightUnit);
				ctx.closePath();

				ctx.beginPath();
				ctx.fillStyle = '#F00000';
				ctx.strokeRect(0,y,width,heightUnit);
				ctx.closePath();
			}
		}			
	}
})();