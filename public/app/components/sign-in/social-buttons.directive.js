(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('socialButtons', socialButtons);
	
	function socialButtons() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/sign-in/social-buttons.directive.html'
		};
	}
})();