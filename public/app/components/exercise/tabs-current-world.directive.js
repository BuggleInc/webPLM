(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('tabsCurrentWorld', tabsCurrentWorld);
	
	function tabsCurrentWorld () {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise/tabs-current-world.directive.html'
		};
	}
})();