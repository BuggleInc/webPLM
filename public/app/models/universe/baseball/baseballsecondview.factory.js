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
		};

		function draw(canvas, baseballWorld)
		{
			initUtils(canvas, baseballWorld);
			ctx.beginPath();
			ctx.strokeStyle = '#000000';
			//draws edge of our drawArena
			ctx.strokeRect(0,0, canvasWidth, canvasHeight);
			ctx.closePath();
		};

		


	};


})();