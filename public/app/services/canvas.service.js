(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('canvas', canvas);
	
	function canvas () {
		var canvas;
		var ctx;
		var currentWorld;
		
		var p;
		
		var service = {
				init: init,
				setWorld: setWorld,
				update: update,
				resize: resize
		};
		
		return service;
		
		function init() {
			canvas = document.getElementById('worldView');
			ctx = canvas.getContext('2d');
			p = 0;
		}
		
		function resize() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			canvas.width = $('#worldView').parent().width() * 0.74;
			canvas.height = $('#worldView').parent().width() * 0.74;
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
	}
})();