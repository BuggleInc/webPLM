(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('actorUUID', actorUUID)
		.run(function(actorUUID) {}); // To instanciate the service at startup
	
	actorUUID.$inject = ['$cookies', 'listenersHandler'];
	
	function actorUUID($cookies, listenersHandler) {

		listenersHandler.register('onmessage', handleMessage);

		var service = {
		};

		return service;

		function handleMessage(data) {
			var cmd = data.cmd;
			var args = data.args;
			switch(cmd) {
				case 'actorUUID':
					$cookies.actorUUID = args.uuid;
					break;
			}
		}
	}
})();