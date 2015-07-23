(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('instructions', instructions);
	
	function instructions() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise/instructions.directive.html'
		};
	}
})();