(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('SignUp', SignUp);

	SignUp.$inject = ['userService', 'gettextCatalog', 'navigation'];

	function SignUp(userService, gettextCatalog, navigation) {
		var signUp = this;

        navigation.setCurrentPageTitle(gettextCatalog.getString('Sign up'));
    
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