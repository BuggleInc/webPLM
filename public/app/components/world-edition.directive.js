(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('worldEdition', worldEdition);
	
	function worldEdition() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/world-edition.directive.html'
		};
	}
})();