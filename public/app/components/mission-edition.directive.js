(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('missionEdition', missionEdition);
    
	function missionEdition() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/mission-edition.directive.html'
		};
	}
})();