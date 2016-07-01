(function(){
	'use strict';

	angular
		.module('PLMApp')
		.factory('Buggle', Buggle);

	function Buggle () {

		var Buggle = function (buggle) {
			this.x = buggle.x;
			this.y = buggle.y;
			this.bodyColor = buggle.bodyColor;
			this.direction = buggle.direction;
			this.carryBaggle = buggle.carryBaggle;
			this.brushDown = buggle.brushDown;
		};

		return Buggle;
	}
})();
