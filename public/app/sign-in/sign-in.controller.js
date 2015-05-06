(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('SignIn', SignIn);

	SignIn.$inject = ['userService'];

	function SignIn(userService) {
		var signIn = this;
		var CREDENTIALS_ERROR_MESSAGE = 'Login failed; Invalid userID or password';
		var PROVIDER_ERROR_MESSAGE = 'Login failed; Authorization failed';
		
		signIn.email = '';
		signIn.pwd = '';

		signIn.showErrorMsg = false;
		signIn.errorMsg = '';

		signIn.submit = submit;
		signIn.authenticate = authenticate;
		signIn.hideErrorMsg = hideErrorMsg;

		function submit() {
			userService.signInWithCredentials(signIn.email, signIn.pwd)
			.then(function (data) {
				// Display a message?
				signIn.showErrorMsg = false;
				signIn.errorMsg = '';
			})
			.catch(function (response) {
				console.log('Erreur dans credentials! ', response);
				signIn.showErrorMsg = true;
				signIn.errorMsg = CREDENTIALS_ERROR_MESSAGE;
			});
		}

		function authenticate(provider) {
			userService.signInWithProvider(provider)
			.then(function (data) {
				// Display a message?
				signIn.showErrorMsg = false;
				signIn.errorMsg = '';
			})
			.catch(function (response) {
				console.log('Erreur dans provider! ', response);
				signIn.showErrorMsg = true;
				signIn.errorMsg = PROVIDER_ERROR_MESSAGE;
			});
		}

		function hideErrorMsg() {
			signIn.showErrorMsg = false;
		}
	}
})();