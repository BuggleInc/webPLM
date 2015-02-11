(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('canvas', canvas);
	
	function canvas () {
		var canvas;
		var ctx;
		var currentWorld;
				
		var service = {
				init: init,
				setWorld: setWorld,
				update: update,
				resize: resize,
				getCanvasElt: getCanvasElt,
				getContext: getContext,
				getWorld: getWorld
		};
		
		return service;
		
		function init(canvasElt, canvasWidth, canvasHeight) {
			canvas = canvasElt;
			ctx = canvas.getContext('2d');
			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
		}
		
		function resize(canvasWidth, canvasHeight) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
			update();
		}

		function setWorld (world) {
			currentWorld = world;
			update();
		}
		
		function update() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			currentWorld.draw(ctx, canvas.width, canvas.height);
		}

		function getCanvasElt () {
			return canvas;
		}

		function getContext () {
			return ctx;
		}

		function getWorld () {
			return currentWorld;
		}
	}
})();