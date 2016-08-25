(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('oauthButtons', oauthButtons);
	
	function oauthButtons() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/sign-in/oauth-buttons.directive.html'
		};
	}
})();