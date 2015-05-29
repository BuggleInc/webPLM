(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('userService', userService)
		.run(function(userService) {}); // To instanciate the service at startup
	
	userService.$inject = ['$timeout', '$cookies', 'connection', 'listenersHandler', '$auth', 'toasterUtils'];
	
	function userService($timeout, $cookies, connection, listenersHandler, $auth, toasterUtils) {

		listenersHandler.register('onmessage', handleMessage);

		var user = {};

		var actorUUID;
        var timeoutProfileUpdate;
        
		var service = {
			isAuthenticated: isAuthenticated,
			signUp: signUp,
			signInWithCredentials: signInWithCredentials,
			signInWithProvider: signInWithProvider,
			signOut: signOut,
			getUser: getUser,
			updateUser: updateUser,
			cloneUser: cloneUser
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
			$auth.logout()
            .then(function () {
                toasterUtils.info('You have been logged out');
            });
		}

		function getUser() {
			return user;
		}

		function setUser(data) {
			delete $cookies.gitID;
			user = data;
		}

		function cloneUser() {
			return {
				firstName: user.firstName,
				lastName: user.lastName
			};
		}

		function updateUser(newUser) {
			user.firstName = newUser.firstName;
			user.lastName = newUser.lastName;
			connection.sendMessage('updateUser', { 
				firstName: user.firstName,
				lastName: user.lastName 
			});
            timeoutProfileUpdate = $timeout(function () {
                toasterUtils.error('Error during update', 'An error occurred while updating your profile. Please excuse us for the inconvenience and retry to submit your changes later.');
            }, 10000);
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
                case 'userUpdated':
                    $timeout.cancel(timeoutProfileUpdate);
                    toasterUtils.info('Your profile has been successfully updated');
                    break;
			}
		}
	}
})();