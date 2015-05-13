(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('drawWithDOM', drawWithDOM);

	function drawWithDOM () {
		var drawingArea;
		var currentWorld;

		var draw;

		var service = {
				init: init,
				setWorld: setWorld,
				update: update,
				getWorld: getWorld,
				setDraw: setDraw
		};
		
		return service;
		
		function init(domElt, fnctDraw) {
			drawingArea = domElt;
			draw = fnctDraw;
		}

		function setWorld(world) {
			currentWorld = world;
			if(currentWorld !== null) {
				update();
			}
		}

		function getWorld() {
			return currentWorld;
		}

		function update() {
			draw(drawingArea, currentWorld);
		}

		function setDraw(drawFnct)
		{
			draw = drawFnct;
		}
	}
})();