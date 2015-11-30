(function(){
	'use strict';

	angular
		.module('PLMApp')
		.factory('listenersHandler', listenersHandler);

	listenersHandler.$inject = ['$timeout', '$rootScope', 'connection'];

	function listenersHandler($timeout, $rootScope, connection) {
		var registeredListeners = [];

		var service = {
				register: register,
				closeConnection: closeConnection,
		};
		return service;

		function register(action, fn) {
		    registeredListeners.push(action);
		    return $rootScope.$on(action, function (event, data) {
				$timeout(function () {
					fn(data);
				}, 0);
		    });
		}

		function sendMessage(msg) {
			connection.sendMessage(msg);
		}

		function destroyListeners() {
		    registeredListeners.forEach(function (value) {
		        $rootScope.$$listeners[value] = [];
		    });
		    registeredListeners = [];
		}

		function closeConnection() {
		   destroyListeners();
		   connection.endConnection();
		}
	}
})();
