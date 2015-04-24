(function ()
{
	'use strict';
	angular
		.module('PLMApp')
		.factory('BaseballView', BaseballView);

	function BaseballView()
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
			drawField(baseballWorld);
			ctx.closePath();
		}

		function toRad(angle)
		{
			return angle * (Math.PI / 180);
		}



		function drawField(baseballWorld)
		{
			var nb = baseballWorld.baseAmount;
			var radius = canvasHeight / 2;

			//Firstly, we need a circle where take place the left top corner of our rectangles
			var dif = (radius-75) + (nb * 2);
			
			var height = 91 - (4 * nb);
			var width = 118 - (4 * nb);

			//we need a circle divided by the double number of bases
			var angle = toRad(360 / (nb * 2));

			var angleRotation = angle / nb;

			var firstX;
			var firstY;

			var XCenter = canvasWidth /2;
			var YCenter  = radius;

			var dX1;
			var dY1;

			var dX2;
			var dY2;


			firstX = canvasWidth / 2 - 60;
			firstY = canvasHeight / 2 + dif - 13;


			

			ctx.beginPath();
			ctx.fillStyle = "#006600";
			ctx.fillRect(0,0,canvasWidth,canvasHeight);
			ctx.closePath(); 

			
			ctx.beginPath();
			ctx.fillStyle = "#663300";
			ctx.arc(canvasWidth /2 ,canvasHeight /2, canvasWidth / 2 ,2 * Math.PI, false);
			ctx.fill();
			ctx.closePath();

			ctx.beginPath();
			ctx.strokeStyle = "rgb(0,0,0)";
			ctx.arc(canvasWidth /2 ,canvasHeight /2, canvasWidth / 2 ,2 * Math.PI, false);
			ctx.stroke();
			ctx.closePath(); 

			//draws a circle with a diam = diam - height
			ctx.beginPath();
			ctx.fillStyle = "#000000";
			ctx.arc(canvasWidth /2 ,canvasHeight /2, dif  ,2 * Math.PI, false);
			ctx.fill();
			ctx.closePath();




			for(var i=0; i<nb*2; i++)
			{
				dX1 = firstX - XCenter;
				dY1 = firstY - YCenter;

				
				ctx.beginPath();
				ctx.fillStyle = baseballWorld.colors[i];
				ctx.fillRect(firstX, firstY, 10, 10);
				ctx.closePath();  


				if(i % 2 == 0)
				{
				ctx.save();
			
				//translate context to center of canvas
    			ctx.translate(firstX, firstY);


				ctx.rotate(toRad(i*45));
				
				ctx.beginPath();
				ctx.fillStyle = baseballWorld.colors[i];
				ctx.fillRect(0, 0,width,height);

				ctx.strokeStyle = "#000000";
				ctx.strokeRect(0, 0, width, height);
				ctx.closePath();

				for (var j = 0; j<baseballWorld.posAmount; j++) {

						ctx.beginPath();
						ctx.fillStyle = "#FFFFFF";
						ctx.arc(width / (baseballWorld.posAmount * 2) + (width / baseballWorld.posAmount * (j)) , height / 2, 30 - (5*baseballWorld.posAmount) ,2 * Math.PI, false);
						ctx.fill();
						ctx.closePath();
				};

				

				ctx.beginPath();
				ctx.fillStyle = "#FFFFFF";
				ctx.arc(canvasWidth /3 + canvasWidth / 4, (canvasHeight / 6 * 4.8) + (canvasHeight / 6 * 4.8)/9 ,30, 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();
    			
				ctx.closePath(); 
				ctx.restore();


				} 
				dX2 = dX1 * Math.cos(angle) - dY1 * Math.sin(angle);
				dY2 = dX1 * Math.sin(angle) + dY1 * Math.cos(angle);

				firstX = dX2 + XCenter;
				firstY = dY2 + YCenter;



			} 



			/*
			ctx.beginPath();
			ctx.fillStyle = "#66FF33";
			ctx.fillRect(canvasWidth / 3, canvasHeight - 84, canvasWidth / 3, canvasHeight / 6);
			ctx.closePath();
			ctx.beginPath();
			ctx.strokeStyle = "rgb(0,0,0)";
			ctx.strokeRect(canvasWidth / 3, canvasHeight - 84 , canvasWidth / 3, canvasHeight / 6);
			ctx.closePath();

			ctx.beginPath();
			ctx.fillStyle = "#FF00FF";
			ctx.fillRect(canvasWidth / 3, 15, canvasWidth / 3, canvasHeight / 6);
			ctx.closePath();
			ctx.beginPath();
			ctx.strokeStyle = "rgb(0,0,0)";
			ctx.strokeRect(canvasWidth / 3, 15, canvasWidth / 3, canvasHeight / 6);
			ctx.closePath();

			ctx.beginPath();
			ctx.fillStyle = "#FFFF00";
			ctx.fillRect(15, canvasHeight / 3, canvasWidth / 6, canvasHeight / 3);
			ctx.closePath();
			ctx.beginPath();
			ctx.strokeStyle = "#000000";
			ctx.strokeRect(15, canvasHeight / 3, canvasWidth / 6, canvasHeight / 3);
			ctx.closePath();

			ctx.beginPath();
			ctx.fillStyle = "#0000FF";
			ctx.fillRect(canvasWidth - 84, canvasHeight / 3, canvasWidth / 6, canvasHeight / 3 );
			ctx.closePath();
			ctx.beginPath();
			ctx.strokeStyle = "#000000";
			ctx.strokeRect(canvasWidth - 84, canvasHeight / 3, canvasWidth / 6, canvasHeight / 3 );
			ctx.closePath();





			ctx.beginPath();
			ctx.fillStyle = "#FFFFFF";
			ctx.arc(canvasWidth /3 + canvasWidth / 9 -10 ,(canvasHeight / 6 * 4.8) + (canvasHeight / 6 * 4.8)/9, 30 ,2 * Math.PI, false);
			ctx.fill();
			ctx.closePath();

			ctx.beginPath();
			ctx.fillStyle = "#FFFFFF";
			ctx.arc(canvasWidth /3 + canvasWidth / 4, (canvasHeight / 6 * 4.8) + (canvasHeight / 6 * 4.8)/9 ,30, 2 * Math.PI, false);
			ctx.fill();
			ctx.closePath();

			*/


			
		}





	}


})();