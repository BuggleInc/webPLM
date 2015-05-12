(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('solutionEdition', solutionEdition);
    
	function solutionEdition() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/solution-edition.directive.html'
		};
	}
})();