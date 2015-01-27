(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('OutcomeKind', OutcomeKind);
	
	function OutcomeKind() {
		var model = {
				FAIL: 0,
				PASS: 1
		};
		return model;
	}
})();