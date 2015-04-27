(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('SignIn', SignIn);

	SignIn.$inject = ['userService'];

	function SignIn(userService) {
		var signIn = this;

		signIn.email = '';
		signIn.pwd = '';

		signIn.submit = submit;
		signIn.authenticate = authenticate;

		function submit() {
			userService.signInWithCredentials(signIn.email, signIn.pwd);
		}

		function authenticate(provider) {
			userService.signInWithProvider(provider);
		}
	}
})();