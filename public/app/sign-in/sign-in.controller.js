(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('SignIn', SignIn);

	SignIn.$inject = ['$scope', 'actorUUID', '$auth'];

	function SignIn($scope, actorUUID, $auth) {
		var signIn = this;

		signIn.email = '';
		signIn.pwd = '';

		signIn.authenticate = authenticate;

		function authenticate (provider) {
		    $auth.authenticate(provider)
		    .then(function(data) {
		    	console.log('You have successfully signed in', data);
		    })
		    .catch(function(response) {
		    	console.log(response.data.message);
		    });
		}
	}
})();