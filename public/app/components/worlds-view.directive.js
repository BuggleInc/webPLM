(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('worldsView', worldsView);
	
	function worldsView() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/worlds-view.directive.html'
		};
	}
})();