(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ClearCanvas', ClearCanvas);
	
	function ClearCanvas() {
		
		var ClearCanvas = function (data) {
			this.turtleID = data.turtleID;
			this.shapes = [];
		};
		
		ClearCanvas.prototype.apply = function (currentWorld) {
			this.shapes = currentWorld.shapes.splice(0, currentWorld.shapes.length);
		};

		ClearCanvas.prototype.reverse = function (currentWorld) {
			currentWorld.shapes = this.shapes.splice(0, this.shapes.length);
		};
	
		return ClearCanvas;
	}
}());