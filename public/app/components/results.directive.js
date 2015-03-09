(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('results', results);
	
	function results() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/results.directive.html'
		};
	}
})();