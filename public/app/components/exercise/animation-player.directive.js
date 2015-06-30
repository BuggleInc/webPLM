(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('animationPlayer', animationPlayer);
	
	function animationPlayer() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise/animation-player.directive.html'
		};
	}
})();