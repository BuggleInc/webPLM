(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('DefaultColors', DefaultColors);
	
	function DefaultColors() {
		var model = {
				BAGGLE: 'rgb(209, 105, 31);'
		};
		return model;
	}
})();