(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('exerciseLeftMenu', exerciseLeftMenu);

	function exerciseLeftMenu () {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/exercise-left-menu.directive.html'
		};
	}
})();