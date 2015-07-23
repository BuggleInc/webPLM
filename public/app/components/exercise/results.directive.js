(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('results', results);
	
	function results() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise/results.directive.html'
		};
	}
})();