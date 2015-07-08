(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('testCases', testCases);
	
	function testCases () {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise/test-cases.directive.html'
		};
	}
})();