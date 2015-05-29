(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('worldEditionWorlds', worldEditionWorlds);
	
	function worldEditionWorlds() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/world-edition-worlds.directive.html'
		};
	}
})();