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
			ctx = canvas.getContext('2d');
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
		}

		function draw(canvas, pancakeWorld)
		{
			initUtils(canvas, pancakeWorld);
			ctx.beginPath();

			//draws edge of our drawArena
			ctx.strokeRect(0,0,canvasWidth,canvasHeight);
			ctx.closePath();

			
			drawPancake(pancakeWorld);
			
			if(pancakeWorld.moveCount != 0)
				drawSpatula(pancakeWorld);
			
			if(pancakeWorld.burnedWorld)
				drawBurned(pancakeWorld);
			
			drawCircle(pancakeWorld);
			drawText(pancakeWorld);
		}

		function drawText(pancakeWorld)
		{
			ctx.beginPath();

			ctx.fillStyle = 'rgb(0,0,0)';
			ctx.font = '15px sans-serif';

			if(pancakeWorld.moveCount <= 1)
			ctx.fillText(pancakeWorld.moveCount+' Move',5,25);
			else ctx.fillText(pancakeWorld.moveCount+ ' Moves',5,25);
			ctx.closePath();
		}

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

				//each pancake takes place in the canvasWidth
				var x = (canvasWidth / 2) - ((widthUnit * radius) / 2);

				//each pancake takes place in the canvasHeight
				var y = canvasHeight - (heightUnit * i);

				//the width depends of the radius
				var width = widthUnit * radius;

				ctx.fillStyle = '#FFFF00';

				//draws pancakes
				ctx.fillRect(x, y, width, -heightUnit);

				//draws edges of the pancakes
				ctx.beginPath();
				ctx.fillStyle = '#F00000';
				ctx.strokeRect(x,y,width,-heightUnit);
				ctx.closePath();
			}

			ctx.closePath();
		}

		function drawBurned(pancakeWorld)
		{
			var length = pancakeWorld.pancakeStack.length;
			var widthUnit = canvasWidth / (length + 1);
			var heightUnit = canvasHeight / length ;
			var x;
			var y;
			var x2;
			var adjustment;
			for(var i=0;i<length;i++)
			{
				//if the pancake looks the sky
				if(pancakeWorld.pancakeStack[i].upsideDown)
				{
					ctx.beginPath();
					if(length > 19)
					{
						adjustment = 3;
						ctx.lineWidth = 5;
					}
					else 
					{
						adjustment = 6;
						ctx.lineWidth = 10;
						
					}
					
					x = (canvasWidth /2 ) - ((widthUnit * pancakeWorld.pancakeStack[i].radius) / 2);
					x2 = x + (widthUnit * pancakeWorld.pancakeStack[i].radius);
					y = canvasHeight - (heightUnit * (i+1)) + adjustment;
					
					
					ctx.moveTo(x,y);
					ctx.lineTo(x2,y);
					ctx.strokeStyle = '#663300';

					ctx.stroke();
					ctx.lineWidth = 1;
					ctx.closePath();
				} 
				else
				{ 
					x = (canvasWidth /2 ) - ((widthUnit * pancakeWorld.pancakeStack[i].radius) / 2);
					x2 = x + (widthUnit * pancakeWorld.pancakeStack[i].radius);
					if(length > 19)
					{
						adjustment = 0;
						ctx.lineWidth = 5;
					}
					else 
					{
						adjustment = 0;
						ctx.lineWidth = 10;
					}
					y = canvasHeight - (heightUnit * i) - adjustment;
					ctx.beginPath();
					
					ctx.moveTo(x,y);
					ctx.lineTo(x2,y);
					ctx.strokeStyle = '#663300';
					
					ctx.stroke();
					ctx.lineWidth = 1;
					ctx.closePath();
				} 
			}
		}

		function drawSpatula(pancakeWorld)
		{
			var radius = 1;
			for(var i=0;i<pancakeWorld.pancakeStack.length;i++)
			{
				if(radius < pancakeWorld.pancakeStack[i].radius)
					radius = pancakeWorld.pancakeStack[i].radius;
			}

			var widthUnit = canvasWidth / (pancakeWorld.pancakeStack.length + 1);
			var x = (canvasWidth/2) - ((widthUnit * radius) / 2);
			var heightUnit = canvasHeight / pancakeWorld.pancakeStack.length;
			var y = (heightUnit * pancakeWorld.numberFlip) -20;

			var x2 = x + (widthUnit * radius);
			

			//draws the handle
			ctx.beginPath();
			ctx.moveTo(1,y+50);
			ctx.lineTo(x,y+21);
			ctx.lineWidth = 5;
			ctx.strokeStyle = 'rgb(0,0,0)';
			ctx.stroke();
			ctx.lineWidth = 1;
			ctx.closePath();

			//draws the spatula
			ctx.beginPath();
			ctx.moveTo(x-2,y+21);
			ctx.lineTo(x2,y+21);
			ctx.lineWidth = 5;
			ctx.strokeStyle = 'rgb(0,0,0)';
			ctx.stroke();
			ctx.lineWidth = 1;
			ctx.closePath();
		}

		function drawCircle(pancakeWorld)
		{
			var heightUnit = canvasHeight / pancakeWorld.pancakeStack.length;
			var x = canvasWidth / 2;
			var radius;
			if(pancakeWorld.pancakeStack.length > 19) {
				radius = 5;
			}
			else {
				radius = 10;
			}
			var j = 1;

			for(var i=0;i<pancakeWorld.pancakeStack.length;i++)
			{
				var y = canvasHeight - (heightUnit * j);

				//if two neighbour pancakes has just 1 cm of difference 
				var up = pancakeWorld.pancakeStack[i].radius === (pancakeWorld.pancakeStack[j].radius)+1;
				var down = pancakeWorld.pancakeStack[i].radius === (pancakeWorld.pancakeStack[j].radius)-1;
				if(up || down)
				{
					ctx.beginPath();
					ctx.fillStyle = '#FF00FF';

					ctx.arc(x,y,radius,0,2 * Math.PI,false);
					ctx.fill();
					ctx.closePath();
				}
				if(j<pancakeWorld.pancakeStack.length-1) {
					j++;
				}
			}
		}
	}
})();