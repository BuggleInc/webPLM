(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('animationSpeed', animationSpeed);
	
	function animationSpeed() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise/animation-speed.directive.html'
		};
	}
})();