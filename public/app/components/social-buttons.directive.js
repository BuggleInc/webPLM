(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('socialButtons', socialButtons);
	
	function socialButtons() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/social-buttons.directive.html'
		};
	}
})();