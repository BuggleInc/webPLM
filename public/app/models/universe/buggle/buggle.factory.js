(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('Buggle', Buggle);
	
	function Buggle () {
		
		var Buggle = function (buggle) {
			this.x = buggle.x;
			this.y = buggle.y;
			this.color = buggle.color;
			this.direction = buggle.direction;
			this.carryBaggle = buggle.carryBaggle;
			this.brushDown = buggle.brushDown;
		};
		
		return Buggle;
	}
})();