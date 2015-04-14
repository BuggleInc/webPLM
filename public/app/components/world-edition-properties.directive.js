(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('worldEditionProperties', worldEditionProperties);
	
	function worldEditionProperties() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/world-edition-properties.directive.html'
		};
	}
})();