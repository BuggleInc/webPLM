(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('animationPlayer', animationPlayer);
	
	function animationPlayer() {
		return {
			restrict: 'E',
            scope: {
                ctrl: '=ctrl'
            },
			templateUrl: '/assets/app/components/animation-player.directive.html'
		};
	}
})();