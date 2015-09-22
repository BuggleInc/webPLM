(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('AddCircle', AddCircle);
	
  AddCircle.$inject = ['Circle'];
  
	function AddCircle(Circle) {
		
		var AddCircle = function (data) {
      this.circle = new Circle(data);
		};
		
		AddCircle.prototype.apply = function (currentWorld) {
			currentWorld.shapes.push(this.circle);
		};
		
		AddCircle.prototype.reverse = function (currentWorld) {
			currentWorld.shapes.pop();
		};
	
		return AddCircle;
	}
}());