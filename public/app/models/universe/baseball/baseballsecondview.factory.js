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
			
			//draws the initial stage or the different steps
			if(baseballWorld.operations.length === 0)
				drawInitial(baseballWorld);
			else
				drawSteps(baseballWorld);

			//draws rectangles(bases)
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

			//draws bases(rectangles)
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

		//initial view, any operations to draw
		function drawInitial(baseballWorld)
		{	
			var nb = baseballWorld.baseAmount;
			var nbPos = baseballWorld.posAmount;
			var x = canvasWidth-15;
			var y;
			var height = 60 + (5 * nbPos) - (3.5 * nb);
			var spacing = (canvasHeight - (height * nb)) / nb;
			var unit = height / (nbPos*2);
			var nbUnit;

			for(var i=0;i<nb;i++)
			{
				nbUnit = 1;
				for(var j=0;j<nbPos;j++)
				{
					y = (unit * nbUnit) + (i * (spacing + height));
					ctx.beginPath();

					//for the hole line
					if(baseballWorld.field[i*nbPos+j] === -1)
					{
						ctx.setLineDash([15,10]);
						ctx.strokeStyle = '#000000';
					}
					else
					{
						ctx.strokeStyle = baseballWorld.colors[baseballWorld.field[i*baseballWorld.posAmount+j]];
					}

					ctx.moveTo(15,y);
					ctx.lineTo(x,y);
					ctx.stroke();
					ctx.closePath();
					ctx.setLineDash([0,0]);
					nbUnit += 2;
				}
			}
		}

		//several operations
		function drawSteps(baseballWorld)
		{
			var nb = baseballWorld.baseAmount;
			var nbPos = baseballWorld.posAmount;
			var memory = baseballWorld.memory;
			var x, y, x2, y2, nbUnitMemo;
			var height = 60 + (5 * nbPos) - (3.5 * nb);
			var spacing = (canvasHeight - (height * nb)) / nb;
			var heightUnit = height / (nbPos*2);
			var widthUnit = (canvasWidth-30) / (memory.length-1);
			var nbUnit;
			var memo = [];

			//stock the base and the position of each hole
			for(var i=0;i<memory.length;i++)
			{
				for(var j=0;j<nb;j++)
				{
					nbUnitMemo = 1;
					for(var k=0;k<nbPos;k++)
					{
						
						if(memory[i][j*nbPos + k] === -1)
						{
							memo.push([j,nbUnitMemo]);
						}

						nbUnitMemo += 2;
					}
				}
			}

			//draws the hole line, its partner and the others
			for(var i=0;i<memory.length-1;i++)
			{
				for(var j=0;j<nb;j++)
				{
					nbUnit = 1;
					for(var k=0;k<nbPos;k++)
					{
						if((memory[i+1][j*nbPos + k] === -1))
						{
							ctx.beginPath();
							ctx.setLineDash([0,0]);
							x = widthUnit * i + 15;
							y = (heightUnit * memo[i+1][1]) + (memo[i+1][0] * (spacing + height));
							x2 = widthUnit * (i+1) + 15;
							y2 = heightUnit * memo[i][1] + memo[i][0] * (spacing + height);
							ctx.moveTo(x2,y2);
							ctx.lineTo(x,y);
							ctx.strokeStyle = baseballWorld.colors[memory[i][j*nbPos+k]];
							ctx.stroke();
							ctx.closePath();
							nbUnit += 2;
						}else if(memory[i][j*nbPos + k] === -1){
							ctx.beginPath();
							ctx.setLineDash([2,10]);
							x = widthUnit * i + 15;
							y = heightUnit * memo[i][1] + j * (spacing + height);
							x2 = widthUnit * (i+1)+15;
							y2 = heightUnit * memo[i+1][1] + memo[i+1][0] * (spacing + height);
							ctx.moveTo(x2,y2);
							ctx.lineTo(x,y);
							ctx.strokeStyle = '#000000';
							ctx.stroke();
							ctx.closePath();
							nbUnit += 2; 
							ctx.setLineDash([0,0]);
						}else
						{
							x = widthUnit * i + 15;
							y = heightUnit * nbUnit + j * (spacing + height);
							x2 = widthUnit * (i+1) + 15;
							y2 = heightUnit * nbUnit + j * (spacing + height);
							ctx.beginPath();
							ctx.setLineDash([0,0]);
							ctx.strokeStyle = baseballWorld.colors[baseballWorld.memory[i][j*nbPos+k]];
							ctx.moveTo(x,y);
							ctx.lineTo(x2,y2);
							ctx.strokeStyle = baseballWorld.colors[memory[i][j*nbPos+k]];
							ctx.stroke();
							ctx.closePath();
							nbUnit += 2;
						}
					}
				}
			}

			//draws the initial state for the player
			if(memory.length === 1)
			{
				drawInitial(baseballWorld);
			}
		}
	}
})();