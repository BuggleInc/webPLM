(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('animationPlayer', animationPlayer);
	
	function animationPlayer() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/animation-player.directive.html'
		};
	}
})();