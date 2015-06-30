(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('signUpForm', signUpForm);
	
	function signUpForm() {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/sign-up/sign-up-form.directive.html'
		};
	}
})();