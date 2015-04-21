(function ()
{
	'use strict';
	angular
		.module('PLMApp')
		.factory('PancakeView', PancakeView);

	function PancakeView()
	{
		var ctx;
		var canvasWidth;
		var canvasHeight;

		var service = {
			draw: draw,
		};

		return service;

		function initUtils(canvas, pancakeWorld)
		{
			ctx=canvas.getContext('2d');
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
		};

		function draw(canvas, pancakeWorld)
		{
			initUtils(canvas, pancakeWorld);
			ctx.beginPath();

			//draws edge of our drawArena
			ctx.strokeRect(0,0,canvasWidth,canvasHeight);
			ctx.closePath();

			
			drawPancake(pancakeWorld);

			drawText(pancakeWorld);
		};

		function drawText(pancakeWorld)
		{
			ctx.beginPath();

			ctx.fillStyle = "rgb(0,0,0)";
			ctx.font = "15px sans-serif";

			if(pancakeWorld.moveCount === 0)
			ctx.fillText(pancakeWorld.moveCount+" Move",5,25);
			else ctx.fillText(pancakeWorld.moveCount+ " Moves",5,25);
			ctx.closePath();
		};

		function drawPancake(pancakeWorld)
		{
			ctx.beginPath();

			//each pancake has its height
			var heightUnit = canvasHeight / pancakeWorld.pancakeStack.length;


			

			//each pancake has a radius between 1 and 1 * the number of pancakes
			var widthUnit = canvasWidth / (pancakeWorld.pancakeStack.length + 1); //+1 for the edges
			

			for(var i=0;i<pancakeWorld.pancakeStack.length;i++)
			{
				//each pancake has its radius
				var radius = pancakeWorld.pancakeStack[i].radius;

				//the width depends of the radius
				var x = (canvasWidth / 2) - ((widthUnit * radius) / 2);

				//each pancake takes place in the canvasHeight
				var y = heightUnit * i;

				var width = widthUnit * radius;


				ctx.fillStyle = "#FFFF00";

				//draws pancakes
				ctx.fillRect(x, y, width, heightUnit);

				//draws edges of the pancakes
				ctx.beginPath();
				ctx.fillStyle = "#F00000";
				ctx.strokeRect(x,y,width,heightUnit);
				ctx.closePath();
			}

			ctx.closePath();
		};
	};
})();