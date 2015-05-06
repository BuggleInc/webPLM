(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('userService', userService)
		.run(function(userService) {}); // To instanciate the service at startup
	
	userService.$inject = ['$http', '$cookies', '$timeout', 'connection', 'listenersHandler', '$auth'];
	
	function userService($http, $cookies, $timeout, connection, listenersHandler, $auth) {

		listenersHandler.register('onmessage', handleMessage);

		var user = {};

		var actorUUID;

		var service = {
			isAuthenticated: isAuthenticated,
			signUp: signUp,
			signInWithCredentials: signInWithCredentials,
			signInWithProvider: signInWithProvider,
			signOut: signOut,
			getUser: getUser
		};

		return service;

		function isAuthenticated() {
			return $auth.isAuthenticated()
		}

		function signUp(email, password, firstName, lastName) {
			return $auth.signup({
				email: email,
				password: password,
				firstName: firstName,
				lastName: lastName
			});
		}

		function signInWithCredentials(email, password) {
			return $auth.login({
				email: email,
				password: password
			});
		}

		function signInWithProvider(provider) {
			return $auth.authenticate(provider);
		}

		function signOut() {
			return $auth.logout();
		}

		function getUser() {
			return user;
		}

		function setUser(data) {
			delete $cookies.gitID;
			user = data;
		}

		function retrieveUser() {
			$http.get('/user/'+actorUUID)
			.success(function() {
				console.log('successfully retrieve your profile');
			})
			.error(function(error) {
				console.log('error: ', error.message);
			});
		}

		function setGitID(gitID) {
			$cookies.gitID = gitID;
			if($auth.isAuthenticated()) {
				$auth.logout();
			}
		}

		function handleMessage(data) {
			var cmd = data.cmd;
			var args = data.args;
			switch(cmd) {
				case 'actorUUID':
					actorUUID = args.actorUUID;
					$cookies.actorUUID = actorUUID;
					break;
				case 'gitID':
					setGitID(args.gitID);
					break;
				case 'user':
					setUser(args.user);
					break;
			}
		}
	}
})();