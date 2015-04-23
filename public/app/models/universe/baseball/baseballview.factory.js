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

		function drawField(baseballWorld)
		{
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

			


			
		}





	}


})();