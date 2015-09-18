(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('AddLine', AddLine);
	
  AddLine.$inject = ['Line'];
  
	function AddLine(Line) {
		
		var AddLine = function (data) {
      console.log('new Line: ', data);
      this.line = new Line(data);
		};
		
		AddLine.prototype.apply = function (currentWorld) {
			currentWorld.shapes.push(this.line);
		};
		
		AddLine.prototype.reverse = function (currentWorld) {
			currentWorld.shapes.pop();
		};
	
		return AddLine;
	}
}());