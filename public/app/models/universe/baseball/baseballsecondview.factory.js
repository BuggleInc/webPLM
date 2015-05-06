(function ()
{
	'use strict';
	angular
		.module('PLMApp')
		.factory('BaseballSecondView', BaseballSecondView);

	function BaseballSecondView()
	{
		var ctx;
		var canvasWidth;
		var canvasHeight;

		var service = {
			draw: draw,
		};

		return service;

		function initUtils(canvas, baseballWorld)
		{
			ctx = canvas.getContext('2d');
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
		}

		function draw(canvas, baseballWorld)
		{
			initUtils(canvas, baseballWorld);
			ctx.beginPath();
			ctx.strokeStyle = '#000000';
			//draws edges of our drawArena
			ctx.strokeRect(0,0, canvasWidth, canvasHeight);
			drawBases(baseballWorld);
			ctx.closePath();
		}

		function drawBases(baseballWorld)
		{
			var nb = baseballWorld.baseAmount;
			var nbPos = baseballWorld.posAmount;
			
			var width = 15;
			var height = 60 + (5 * nbPos) - (3.5 * nb);
			var spacing = (canvasHeight - (height * nb)) / nb;

			var x, y;

			for(var i = 0; i < nb; i++)
			{
				y = i * (spacing + height);
				x = canvasWidth - width;
				ctx.beginPath();
				ctx.fillStyle = baseballWorld.colors[i];
				ctx.fillRect(0, y, width, height);
				ctx.fillRect(x,y,width,height);
				ctx.closePath();
			}
		}

		


	};


})();