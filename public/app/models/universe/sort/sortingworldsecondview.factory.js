(function()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('SortingWorldSecondView', SortingWorldSecondView);

			SortingWorldSecondView.$inject = [ 'SetValOperation', 'SwapOperation','CopyOperation', 'CountOperation'
	];

	function SortingWorldSecondView(SetValOperation, SwapOperation, CopyOperation, CountOperation)
	{
		var ctx;
		var canvasWidth;
		var canvasHeight;

		var service = {
			draw: draw,
		};

		return service;

		function initUtils(canvas, sortingWorld)
		{
			ctx = canvas.getContext('2d');
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
		}


		function draw(canvas, sortingWorld)
		{
			
			initUtils(canvas, sortingWorld);
			ctx.strokeRect(0,0,canvasWidth,canvasHeight);
			drawInitial(sortingWorld);
		}



		
		function drawInitial(sortingWorld)
		{
			//allows you to know if you have to divided the width
			var amountOperations = sortingWorld.operations.length;

			console.log(amountOperations);

			//String of letters
			var letters = "ABCDEFGHIJKLMNOPQRSTWXYZ";

			//an unit of canvasHeight, divided by the number of values
			var unit = canvasHeight / sortingWorld.values.length;


			//canvasWidth divided by the number of values to know the width of each rectangle
			var timeUnit = (canvasWidth-9)/ Math.max(amountOperations,1);

			var colors = ["#000000","#ff0000","#ff00d0","#1200ff","#00ffec","#00ff24","#663300","#ff5d00","#999966","#6600CC"];
			
			var colorsLine = ["#000","#F00","#F0C","#10F"," #0FE","#0F2","#630","#F50","#996","#60C"];

			
			
			//if the array is small enough, we display the letters
			var drawLetters = sortingWorld.values.length<=12;
			

			//2 coordinates to display the lines
			var x1,x2,y1,y2;


			//case with 0 operations to display
			if (amountOperations == 0)
			{
				for(var i = 0; i < sortingWorld.values.length;i++)
				{

					//draws letters
					ctx.beginPath();
					y1 = i * unit + 25;
					
					ctx.fillStyle = colors[i];
					if(drawLetters)
					{
						ctx.font = "30 px sans-serif";
						ctx.fillText(letters.charAt(sortingWorld.values[i]),25,unit*i+20);
					}

					ctx.closePath();


					//draws line
					ctx.beginPath();
					ctx.moveTo(25,y1);
					ctx.lineTo(canvasWidth-30,y1);
					ctx.strokeStyle = colorsLine[i];
					ctx.stroke();
					ctx.closePath();

					



				}

				return
			}



			
			
			//case initial if there are operations
			for(var i = 0; i < sortingWorld.memory.length;i++)
			{
				for(var j=0;j<sortingWorld.memory[i].length;j++)
				{

					//draws letter
					ctx.beginPath();
					ctx.fillStyle = colors[sortingWorld.values[j]];
					if(drawLetters)
					{
						ctx.font = "20 px sans-serif";
						ctx.fillText(letters.charAt(sortingWorld.memory[i][j]),timeUnit*i,unit*j+20);
					}
					ctx.closePath();
				}

			}



			var lineInd = 0;
			//draws lines for the unmodified values
			for(var i = 1; i<sortingWorld.memory.length;i++)
			{
				for(var j=0;j<sortingWorld.memory[i].length;j++)
				{
					if(sortingWorld.memory[i-1][j] == sortingWorld.memory[i][j])
					{
						ctx.beginPath();
						y1 = j * unit + 25;
						ctx.moveTo((timeUnit*lineInd)+10,y1);
						ctx.lineTo(canvasWidth-10,y1);
						ctx.strokeStyle = colorsLine[sortingWorld.values[j]];
						ctx.stroke();
						ctx.closePath();
					}
				}
				lineInd++;
			}

			

			//draws the lines for the operations
			for(var i=0; i<sortingWorld.operations.length;i++)
			{
				for(var j=0;j<sortingWorld.operations[0].length;j++)
				{
		
					
					if(sortingWorld.operations[i][j] instanceof SwapOperation)
					{
						
						
						//draw source->dest
						ctx.beginPath();
						y1 = sortingWorld.operations[i][j].src * unit + 25;
						y2 = sortingWorld.operations[i][j].dest * unit + 25;
						ctx.moveTo(10,y1);
						ctx.lineTo(canvasWidth-10,y2);
						ctx.strokeStyle = colorsLine[sortingWorld.operations[i][j].src];
						ctx.stroke();
						ctx.closePath();

						//draw dest->source
						ctx.beginPath();
						y1 = sortingWorld.operations[i][j].dest * unit + 25;
						y2 = sortingWorld.operations[i][j].src * unit + 25;
						ctx.moveTo(10,y1);
						ctx.lineTo(canvasWidth-10,y2);
						ctx.strokeStyle = colorsLine[sortingWorld.operations[i][j].dest];
						ctx.stroke();
						ctx.closePath();
					}else if(sortingWorld.operations[i][j] instanceof CopyOperation)
					{
						//draws the values copied
						ctx.beginPath();
						y1 = sortingWorld.operations[i][j].src * unit + 25;
						y2 = sortingWorld.operations[i][j].dest * unit +25;
						ctx.strokeStyle = colorsLine[sortingWorld.operations[i][j].src];
						ctx.moveTo(10,y1);
						ctx.lineTo(canvasWidth-10,y2);
						ctx.stroke();
						ctx.closePath();
					}


				}		
			}
		}
	}
})();

