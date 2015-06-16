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
			var height = 5, width = canvasWidth - 15, dim = 10, location = dim / 2;

			for(var i=0;i<length;i++)
			{
				space = (canvasHeight - (height * length)) / (length + 1);
				x = 10;
				y = space + (space + height) * i;

				ctx.beginPath();
				ctx.moveTo(x,y);
				ctx.lineTo(canvasWidth-15,y);
				//to know the color of each line, we are looking its value
				ctx.strokeStyle = colors[dutchFlagWorld.content[i]];
				ctx.fillStyle = colors[dutchFlagWorld.content[i]];
				ctx.fillRect(x-location,y-location, dim, dim);
				ctx.fillRect(canvasWidth-15-location, y-location, dim, dim);
				ctx.lineWidth = height;
				ctx.stroke();
				ctx.closePath();
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000000';
			}
		}

		function drawSteps(dutchFlagWorld)
		{
			var memory = dutchFlagWorld.memory;
			var mem = [];
			var x, y, x2, y2, space;
			var dim = 10, widthUnit = canvasWidth / (dutchFlagWorld.operations.length+1), location = dim / 2;
			
			for(var i=0;i<memory.length;i++)
			{
				space = (canvasHeight - (dim * memory[0].length)) / (memory[0].length+1);
				x = widthUnit/2 + widthUnit * i;
				for(var j=0;j<dutchFlagWorld.memory[i].length;j++)
				{
					y = space + (space + dim) * j;
					ctx.beginPath();
					ctx.strokeStyle = colors[dutchFlagWorld.memory[i][j]];
					ctx.fillStyle = colors[dutchFlagWorld.memory[i][j]];
					if(i != memory.length-1)
					{
						if(memory[i+1][j] === memory[i][j])
						{
							ctx.moveTo(x,y);

							if(i === 0)
								ctx.fillRect(x-location, y-location, dim, dim);

							x2 = widthUnit/2 + widthUnit * (i+1);
							ctx.lineTo(x2,y);
							ctx.lineWidth = 5;
							ctx.stroke();
							ctx.lineWidth = 1;
						}else
						{
							if(dutchFlagWorld.operations[i][0].src === j)
							{
								ctx.moveTo(x,y);
								x2 = widthUnit/2 + widthUnit * (i+1);
								y2 = space + (space + dim) * (dutchFlagWorld.operations[i][0].dest)
								ctx.lineTo(x2,y2);
								ctx.lineWidth = 5;
								ctx.stroke();
								ctx.fillRect(x2-location, y2-location, dim, dim);
								ctx.fillRect(x-location, y-location, dim, dim);
								ctx.fill();
								ctx.lineWidth = 1;
							}else
							{
								ctx.moveTo(x,y);
								x2 = widthUnit/2 + widthUnit * (i+1);
								y2 = space + (space + dim) * (dutchFlagWorld.operations[i][0].src);
								ctx.moveTo(x,y);
								ctx.lineTo(x2,y2);
								ctx.lineWidth = 5;
								ctx.stroke();
								ctx.fillRect(x2-location, y2-location, dim, dim);
								ctx.fillRect(x-location, y-location, dim, dim);
								ctx.fill();
								ctx.lineWidth = 1;
							}
						}
					}

					if(i === memory.length-1 && memory.length != 1)
					{
						ctx.fillRect(x-location, y-location, dim, dim);
					}

					ctx.strokeStyle = '#000000';
					ctx.closePath();
				}
			}

			if(memory.length === 1)
			{
				drawInitial(dutchFlagWorld);
			}
		}
	}
})();