(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('playerOptions', playerOptions);
	
	function playerOptions() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/player-options.directive.html'
		};
	}
})();