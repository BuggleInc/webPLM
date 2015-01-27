(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('Direction', Direction);
	
	function Direction() {
		var model = {
				NORTH_VALUE: 0,
				EAST_VALUE: 1,
				SOUTH_VALUE: 2,
				WEST_VALUE: 3
		};
		return model;
	}
})();