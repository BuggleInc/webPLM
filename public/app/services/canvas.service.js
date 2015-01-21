(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('canvas', canvas);
	
	function canvas () {
		var canvas;
		var ctx;
		var currentWorld;
		
		var bw;
		var bh;
		var p;
		
		var service = {
				init: init,
				setWorld: setWorld,
				update: update
		};
		
		return service;
		
		function init() {
			canvas = document.getElementById('worldView');
			ctx = canvas.getContext('2d');
			p = 0;
		}
		
		function setWorld (world) {
			currentWorld = world;
			update();
		}
		
		function update() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			currentWorld.draw(ctx, canvas.width, canvas.height);
		}
	}
})();