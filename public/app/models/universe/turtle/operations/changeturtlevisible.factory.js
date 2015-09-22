(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('ChangeTurtleVisible', ChangeTurtleVisible);
	
	function ChangeTurtleVisible() {
		
		var ChangeTurtleVisible = function (data) {
			this.turtleID = data.turtleID;
			this.newVisible = data.newVisible;
			this.oldVisible = data.oldVisible;
		};
		
		ChangeTurtleVisible.prototype.apply = function (currentWorld) {
			var turtle = currentWorld.getEntity(this.turtleID);
			turtle.visible = this.newVisible;
		};
		
		ChangeTurtleVisible.prototype.reverse = function (currentWorld) {
			var turtle = currentWorld.getEntity(this.turtleID);
			turtle.visible = this.oldVisible;
		};
	
		return ChangeTurtleVisible;
	}
}());