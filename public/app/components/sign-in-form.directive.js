(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('signInForm', signInForm);
	
	function signInForm() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/sign-in-form.directive.html'
		};
	}
})();