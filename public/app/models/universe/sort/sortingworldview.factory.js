(function()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('SortingWorldView', SortingWorldView);


	function SortingWorldView()
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
			ctx.beginPath();
			drawColumn(sortingWorld);

			//draws egde of our drawArena
			ctx.strokeRect(0,0,canvasWidth,canvasHeight);
			
			drawText(sortingWorld);
			ctx.closePath();
		}

		//draws write and read counts
		function drawText(sortingWorld)
		{
			ctx.fillStyle = 'rgb(0,0,0)';
			ctx.font ='15px sans-serif';
			ctx.fillText('Functional test('+sortingWorld.writeCount+' write, '+sortingWorld.readCount+' read)',5,25);
		}


		function drawColumn(sortingWorld)
		{
			//canvasWidth divided by the number of values to know the width of each rectangle
			var widthUnit = canvasWidth / sortingWorld.values.length;
			
			var x;

			//an unit of canvasHeight, divided by the number of values
			var heightUnit = canvasHeight / sortingWorld.values.length;

			//String of letters
			var letters = 'ABCDEFGHIJKLMNOPQRSTWXYZ';

			for(var i=0; i<sortingWorld.values.length;i++)
			{
				//each rectangle takes place in the canvasWidth
				x = widthUnit * i;

				//To know if the rectangle has his good place, we verify that its value is equal to its position+1
				if(x === widthUnit*sortingWorld.values[i]) {
					ctx.fillStyle= 'rgb(0,255,0)';
				}
				else {
					ctx.fillStyle = 'rgb(255,0,0)';
				}

				//draws rectangles
				ctx.fillRect(x,canvasHeight,widthUnit,-(heightUnit*sortingWorld.values[i]));
				
				//draws egde of the rectangles
				ctx.fillStyle = 'rgb(0,255,0)';
				ctx.strokeRect(x,canvasHeight,widthUnit,-(heightUnit*sortingWorld.values[i]));

				//draws the letters if you have enough space
				if(sortingWorld.values.length<150)
				{
					ctx.fillStyle = 'rgb(0,0,0)';
					ctx.font='bold 15px sans-serif';
					ctx.fillText(letters.charAt(sortingWorld.values[i]),x+15,canvasHeight-20);
				}
			}
		} 
	}
})();