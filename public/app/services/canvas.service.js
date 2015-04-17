(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('canvas', canvas);
	
	function canvas () {
		var canvas;
		var ctx;
		var currentWorld;
		
		var draw;

		var service = {
				init: init,
				setWorld: setWorld,
				update: update,
				resize: resize,
				getWorld: getWorld,
				getCanvasElt: getCanvasElt,
				getContext: getContext,
				getDraw: getDraw,
				setDraw: setDraw
		};
		
		return service;
		
		function init(canvasElt, canvasWidth, canvasHeight, fnctDraw) {
			canvas = canvasElt;
			ctx = canvas.getContext('2d');
			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
			draw = fnctDraw;
		}
		
		function resize(canvasWidth, canvasHeight) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
			update();
		}

		function setWorld (world) {
			currentWorld = world;
			if(currentWorld !== null) {
				update();
			}
		}

		function getWorld () {
			return currentWorld;
		}

		function update() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			draw(canvas, currentWorld);
		}

		function getCanvasElt() {
			return canvas;
		}

		function setDraw(fnctDraw)
		{
			draw = fnctDraw;
		}

		function getContext() {
			return ctx;
		}

		function getDraw() {
			return draw;
		}
	}
})();