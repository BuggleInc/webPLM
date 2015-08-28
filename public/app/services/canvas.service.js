(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('canvas', canvas);
	
	function canvas () {
		var canvas;
		var ctx;
		var currentWorld;
		
    var defaultHeight;
    var defaultWidth;
    
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
      setSize(canvasWidth, canvasHeight);
      setDefaultSize(canvas.width, canvas.height);
			draw = fnctDraw;
		}
		
		function resize(canvasWidth, canvasHeight) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
			setSize(canvasWidth, canvasHeight);
      setDefaultSize(canvas.width, canvas.height);
			update();
		}

    function setDefaultSize(width, height) {
      defaultWidth = width;
      defaultHeight = height;
    }
    
    function setSize(canvasWidth, canvasHeight) {
      canvas.width = Math.min(canvasWidth, 400);
			canvas.height = Math.min(canvasHeight, 400);
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
      setSize(defaultWidth, defaultHeight);
			draw(canvas, currentWorld);
		}

		function getCanvasElt() {
			return canvas;
		}

		function getContext() {
			return ctx;
		}

		function getDraw() {
			return draw;
		}

		function setDraw(fnctDraw)
		{
			draw = fnctDraw;
		}
	}
})();