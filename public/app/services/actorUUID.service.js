(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('actorUUID', actorUUID)
		.run(function(actorUUID) {}); // To instanciate the service at startup
	
	actorUUID.$inject = ['$http', 'connection', 'listenersHandler', '$auth'];
	
	function actorUUID($http, connection, listenersHandler, $auth) {

		listenersHandler.register('onmessage', handleMessage);

		var user;
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