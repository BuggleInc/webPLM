(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('userService', userService)
		.run(function(userService) {}); // To instanciate the service at startup
	
	userService.$inject = ['$http', '$cookies', 'connection', 'listenersHandler', '$auth'];
	
	function userService($http, $cookies, connection, listenersHandler, $auth) {

		listenersHandler.register('onmessage', handleMessage);

		var user = {};

		var actorUUID;

		var service = {
			isAuthenticated: isAuthenticated,
			getUser: getUser
		};

		return service;

		function isAuthenticated() {
			return $auth.isAuthenticated()
		}

		function getUser() {
			return user;
		}

		function setUser(data) {
			user = data;
			console.log('user: ', user);
		}

		function retrieveUser() {
			$http.get('/user/'+actorUUID)
			.success(function(data) {
				console.log('data: ', data);
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
					actorUUID = args.uuid;
					$cookies.actorUUID = actorUUID;
					if(isAuthenticated()) { 
						retrieveUser();
					}
					break;
				case 'user':
					setUser(args.user);
					break;
			}
		}
	}
})();