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
			ctx = canvas.getContexte('2d');
			canvasWidth = canvas.width;
			canvasHeight = canvas.height;
		}

		function draw(canvas, sortingWorld)
		{
			initUtils(canvas, sortingWorld);
			ctx.fillStyle = "SteelBlue";
			ctx.strokeRect(0,0,canvasWidth,canvasHeight);
		}
	}

})();