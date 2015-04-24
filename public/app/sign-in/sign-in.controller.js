(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('SignIn', SignIn);

	SignIn.$inject = ['$scope', 'userService'];

	function SignIn($scope, userService) {
		var signIn = this;

		signIn.email = '';
		signIn.pwd = '';

		signIn.authenticate = authenticate;

		function authenticate (provider) {
			userService.signIn(provider);
		}
	}
})();