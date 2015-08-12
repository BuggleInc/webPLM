(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('toggleApi', toggleApi);
	
	function toggleApi() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise/toggle-api.directive.html'
		};
	}
})();