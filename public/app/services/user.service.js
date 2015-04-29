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
			$auth.signup({
				email: email,
				password: password,
				firstName: firstName,
				lastName: lastName
			}).then(function(response) {
				console.log(response.data);
			});
		}

		function signInWithCredentials(email, password) {
			$auth.login({
				email: email,
				password: password
			})
			.then(function(data) {
				console.log('You have successfully signed in with credentials', data);
			});
		}

		function signInWithProvider(provider) {
			$auth.authenticate(provider)
			.then(function(data) {
				console.log('You have successfully signed in with provider', data);
			})
			.catch(function(response) {
				console.log(response.data.message);
			});
		}

		function signOut() {
			$auth.logout();
			connection.sendMessage('signOut', {});
		}

		function getUser() {
			return user;
		}

		function setUser(data) {
			delete $cookies.gitID;
			user = data;
			console.log('user: ', user);
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

		function handleMessage(data) {
			var cmd = data.cmd;
			var args = data.args;
			switch(cmd) {
				case 'actorUUID':
					actorUUID = args.actorUUID;
					$cookies.actorUUID = actorUUID;
					if(isAuthenticated()) {
						$timeout(retrieveUser, 0);
					}
					break;
				case 'gitID':
					if(!isAuthenticated()) {
						$cookies.gitID = args.gitID;
					}
					break;
				case 'user':
					setUser(args.user);
					break;
			}
		}
	}
})();