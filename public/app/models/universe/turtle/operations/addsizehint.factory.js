(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('AddSizeHint', AddSizeHint);
	
  AddSizeHint.$inject = ['SizeHint'];
  
	function AddSizeHint(SizeHint) {
		
		var AddSizeHint = function (data) {
			this.turtleID = data.turtleID;
			this.sizeHint = new SizeHint(data);
		};
		
		AddSizeHint.prototype.apply = function (currentWorld) {
			currentWorld.sizeHints.push(this.sizeHint);
		};

		AddSizeHint.prototype.reverse = function (currentWorld) {
			currentWorld.sizeHints.pop();
		};
	
		return AddSizeHint;
	}
}());