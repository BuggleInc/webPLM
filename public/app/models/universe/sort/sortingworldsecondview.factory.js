(function()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('SortingWorldSecondView', SortingWorldSecondView);

			SortingWorldSecondView.$inject = [ 'SetValOperation', 'SwapOperation','CopyOperation', 'CountOperation', 'GetValueOperation'
	];

	function SortingWorldSecondView(SetValOperation, SwapOperation, CopyOperation, CountOperation, GetValueOperation)
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
			drawChrono(sortingWorld);
		}

		function drawChrono(sortingWorld)
		{ 
			//allows you to know if you have to divided the width
			var amountOperations = sortingWorld.operations.length;

			for(var i=0; i<sortingWorld.operations.length;i++)
			{
				if(sortingWorld.operations[i].length ===  1)
					amountOperations--;
			}
			
			//String of letters
			var letters = 'ABCDEFGHIJKLMNOPQRSTWXYZ';

			//an unit of canvasHeight, divided by the number of values
			var heightUnit = canvasHeight / sortingWorld.values.length;

			//canvasWidth divided by the number of values to know the width of each rectangle
			var widthUnit = (canvasWidth-9)/ Math.max(amountOperations,1);
			
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
					ctx.strokeStyle = '#000000'
					ctx.strokeRect(0,0,canvasWidth,canvasHeight);
					ctx.closePath();
					ctx.beginPath();
					ctx.fillStyle = sortingWorld.colors[sortingWorld.values[i]];
					if(drawLetters)
					{
						ctx.closePath();
						y1 = i * heightUnit + 25;
						ctx.font = '30 px sans-serif';
						ctx.fillText(letters.charAt(sortingWorld.values[i]),25,heightUnit*i+20);
						ctx.closePath();
					}
					else
						y1 = i * heightUnit + 5;
					
					ctx.closePath();

					//draws line
					ctx.beginPath();
					ctx.moveTo(25,y1);
					ctx.lineTo(canvasWidth-30,y1);
					ctx.strokeStyle = sortingWorld.colors[sortingWorld.values[i]];
					ctx.stroke();
					ctx.closePath();
				}
				return
			}

			//case initial if there are operations
			if(drawLetters)
			{
				for(var i = 0; i < sortingWorld.memory.length;i++)
				{
					for(var j=0;j<sortingWorld.memory[i].length;j++)
					{
						ctx.beginPath();
						ctx.fillStyle = sortingWorld.colors[sortingWorld.memory[i][j]];
						ctx.font = '10px sans-serif';
						ctx.fillText(letters.charAt(sortingWorld.memory[i][j]),widthUnit*i,heightUnit*j+20);
						ctx.closePath();
					}
				}
			}
			
			//indicates which line we are drawing
			var lineInd = 0;
			//draws lines for the unmodified values
			for(var i = 1; i<sortingWorld.memory.length;i++)
			{
				for(var j=0;j<sortingWorld.memory[i].length;j++)
				{
					if(sortingWorld.memory[i-1][j] == sortingWorld.memory[i][j])
					{
						ctx.beginPath();

						if(drawLetters)
							y1 = j * heightUnit + 25;
						else
							y1 = j * heightUnit + 5;
						
						ctx.strokeStyle = sortingWorld.colors[sortingWorld.memory[i-1][j]];
						ctx.moveTo((widthUnit*lineInd)+10,y1);
						ctx.lineTo(widthUnit*i,y1);
						ctx.stroke();
						ctx.closePath();
					}
				}
				lineInd++;
			}
			
			//indicates which operation we are drawing
			var opInd = 0;

			//indicates which copy we are drawing
			var copyInd = 0;

			var clearX;
			var clearY;

			//draws the lines for the operations
			for(var i=0; i<sortingWorld.operations.length;i++)
			{
				for(var j=0;j<sortingWorld.operations[0].length;j++)
				{
					//draws a clear rectangle erasing some elements which appear before they should 
					ctx.beginPath();
					clearX=9+((sortingWorld.memory.length-1)*widthUnit);
					clearY=2;
					ctx.clearRect(clearX,clearY,canvasWidth,canvasHeight-50);
					ctx.strokeStyle = '#000000' ;
					ctx.strokeRect(0,0, canvasWidth, canvasHeight);
					ctx.moveTo(canvasWidth,0);
					ctx.lineTo(canvasWidth, canvasHeight);
					ctx.stroke();
					ctx.closePath(); 

					if(sortingWorld.operations[i][j] instanceof SetValOperation)
					{
						ctx.beginPath();
						y1 = sortingWorld.operations[i][j].position * heightUnit + 20;
						ctx.fillStyle = '#FF0000';
						if(drawLetters)
						{
							ctx.beginPath();
							ctx.font = 'bold 12px sans-serif';
							ctx.clearRect((widthUnit*(opInd+1)),y1,10,-15);
							ctx.fillText(letters.charAt(sortingWorld.operations[i][j].value)+'!',(widthUnit*(opInd+1))-2,y1);
							ctx.closePath();
						}
						ctx.closePath();
					}
					else if(sortingWorld.operations[i][j] instanceof GetValueOperation)
					{
						ctx.beginPath();
						y1 = sortingWorld.operations[i][j].position * heightUnit + 20;
						ctx.fillStyle = '#FF00FF';
						if(drawLetters)
						{
							ctx.beginPath();
							ctx.font = 'bold 12px sans-serif';
							ctx.clearRect((widthUnit*(opInd+1)),y1,10,-15);
							ctx.fillText(letters.charAt(sortingWorld.values[sortingWorld.operations[i][j].position])+'?',(widthUnit*(opInd+1))-5,y1);
							ctx.closePath();
						}
						ctx.closePath();
					}
					else if(sortingWorld.operations[i][j] instanceof SwapOperation)
					{ 	 
						if(opInd<sortingWorld.memory.length)
						{
							//draw source->dest
							ctx.beginPath();
							y1 = sortingWorld.operations[i][j].src * heightUnit + 25;
							y2 = sortingWorld.operations[i][j].dest * heightUnit + 25;
							ctx.strokeStyle = sortingWorld.colors[sortingWorld.memory[opInd][sortingWorld.operations[i][j].src]];
							ctx.moveTo((widthUnit*opInd)+10,y1); 
							ctx.lineTo(widthUnit*(opInd+1),y2);
							ctx.stroke();
							ctx.closePath(); 
							
							//draw dest->source
							ctx.beginPath();
							y1 = sortingWorld.operations[i][j].dest * heightUnit + 25;
							y2 = sortingWorld.operations[i][j].src * heightUnit + 25;
							ctx.strokeStyle = sortingWorld.colors[sortingWorld.memory[opInd][sortingWorld.operations[i][j].dest]];
							ctx.moveTo((widthUnit*opInd)+10,y1);
							ctx.lineTo((widthUnit*(opInd+1)), y2);
							ctx.stroke();
							ctx.closePath();
						}
					}
					else if(sortingWorld.operations[i][j] instanceof CopyOperation)
					{
						if(copyInd<sortingWorld.memory.length)
						{
							//draws the values copied
							ctx.beginPath();
							y1 = sortingWorld.operations[i][j].src * heightUnit + 25;
							y2 = sortingWorld.operations[i][j].dest * heightUnit +25;
							ctx.strokeStyle = sortingWorld.colors[sortingWorld.memory[copyInd][sortingWorld.operations[i][j].src]];
							ctx.moveTo((widthUnit*opInd)+10,y1);
							ctx.lineTo((widthUnit*(opInd+1)),y2);
							ctx.stroke();
							ctx.closePath();
						}
					}
				}
				if(sortingWorld.operations[i].length != 1)
				{
					opInd++;
					copyInd++;
				}
			}
		}
	}
})();

