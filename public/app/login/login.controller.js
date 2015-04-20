(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('Login', Login);

	Login.$inject = ['$scope', '$auth'];

	function Login($scope, $auth) {
		var login = this;

		login.authenticate = authenticate;

		function authenticate (provider) {
		    $auth.authenticate(provider)
		    .then(function() {
		    	console.log('You have successfully signed in');
		    })
		    .catch(function(response) {
		    	console.log(response.data.message);
		    });
		}
	}
})();