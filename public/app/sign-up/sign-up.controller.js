(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('SignUp', SignUp);

	SignUp.$inject = ['userService'];

	function SignUp(userService) {
		var signUp = this;

		signUp.email = '';
		signUp.pwd = '';
		signUp.firstName = '';
		signUp.lastName = '';

		signUp.submit = submit;

		function submit() {
			userService.signUp(signUp.email, signUp.pwd, signUp.firstName, signUp.lastName);
		}
	}
})();