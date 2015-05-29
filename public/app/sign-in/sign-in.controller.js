(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('SignIn', SignIn);

	SignIn.$inject = ['userService', 'toasterUtils'];

	function SignIn(userService, toasterUtils) {
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
				signIn.showErrorMsg = false;
				signIn.errorMsg = '';
                toasterUtils.info('You have successfully signed in');
			})
			.catch(function (response) {
				signIn.showErrorMsg = true;
				signIn.errorMsg = CREDENTIALS_ERROR_MESSAGE;
			});
		}

		function authenticate(provider) {
			userService.signInWithProvider(provider)
			.then(function (data) {
				signIn.showErrorMsg = false;
				signIn.errorMsg = '';
                toasterUtils.info('You have successfully signed in');
			})
			.catch(function (response) {
				signIn.showErrorMsg = true;
				signIn.errorMsg = PROVIDER_ERROR_MESSAGE;
			});
		}

		function hideErrorMsg() {
			signIn.showErrorMsg = false;
		}
	}
})();