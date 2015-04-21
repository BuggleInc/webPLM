(function ()
{
	'use strict';
	angular
		.module('PLMApp')
		.factory('PancakeView', PancakeView);

	function PancakeView()
	{
		var ctx;
		var canvasWidth;
		var canvasheight;

		var service = {
			draw: draw,
		};

		return service;

		function initUtils(canvas, PancakeWorld)
		{
			ctx=canvas.getContext('2d');
			canvasWidth = canvas.width;
			canvasheight = canvas.height;
		};

		function draw(canvas, PancakeWorld)
		{
			initUtils(canvas, PancakeWorld);
			ctx.beginPath();

			//draws edge of our drawArena
			ctx.strokeRect(0,0,canvasWidth,canvasheight);
			ctx.closePath();
		};
	}
})();