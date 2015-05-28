(function()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('DutchFlagSecondView', DutchFlagSecondView);

	DutchFlagSecondView.$inject = [ 'DutchFlagSwap' ];

	function DutchFlagSecondView(DutchFlagSwap)
	{
		var ctx;
		var canvasWidth;
		var canvasHeight;
		var colors = [ '#0000FF', '#FFFFFF', '#FF0000'];

		var service = {
			draw: draw,
		};

		return service;

		function initUtils(canvas, dutchFlagWorld)
		{
			ctx = canvas.getContext('2d');
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
		}

		function draw(canvas, dutchFlagWorld)
		{
			initUtils(canvas, dutchFlagWorld);

			//draws edges of the drawArena
			ctx.beginPath();
			ctx.fillStyle = '#000000';
			ctx.fillRect(0,0,canvasWidth, canvasHeight);
			ctx.closePath();

			//initial state
			if(dutchFlagWorld.operations.length === 0)
				drawInitial(dutchFlagWorld);
			//case with operations
			else
				drawSteps(dutchFlagWorld);
		}

		function drawInitial(dutchFlagWorld)
		{
			var length = dutchFlagWorld.content.length;
			var x,y,space;
			var height = 5, width = canvasWidth - 15;

			

			for(var i=0;i<length;i++)
			{
				space = (canvasHeight - (height * length)) / (length + 1);
				x = 10;
				y = space + (space + height) * i ;

				ctx.beginPath();
				ctx.moveTo(x,y);
				ctx.lineTo(canvasWidth-15,y);
				//to know the color of each line, we are looking its value
				ctx.strokeStyle = colors[dutchFlagWorld.content[i]];
				ctx.lineWidth = height ;
				ctx.stroke();
				ctx.closePath();
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000000';
			}
		}

		function drawSteps(dutchFlagWorld)
		{
			var x,y,space;
			var dim = 5;
			
			for(var i=0;i<dutchFlagWorld.memory.length;i++)
			{
				
			}
		}
	}
})();