(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('applicationHeader', applicationHeader);
	
	function applicationHeader() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/application-header.directive.html'
		};
	}
})();