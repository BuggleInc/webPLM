(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('connection', connection);
	
	connection.$inject = ['$rootScope'];
	
	function connection ($rootScope) {		
		var socket = new WebSocket('ws://'+document.location.host+'/websocket');
		var connectStatus = false;
		var pendingMessages = [];
		
		var service = {
			sendMessage: sendMessage,
			endConnection: endConnection
		};
		
		socket.onopen = function (event) {
			connectStatus = true;
			sendPendingMessages();
			$rootScope.$emit('onopen', event);
		};
		
		socket.onmessage = function (event) {
			var msg = JSON.parse(event.data);
			$rootScope.$broadcast('onmessage', msg);
		};

		return service;
		
		function sendMessage(cmd, args) {
			var msg = {
	    			cmd: cmd,
	    			args: args || null
	    	};
	    	send(JSON.stringify(msg));
		}
		
		function send(msg) {
			if(!connectStatus) {
				pendingMessages.push(msg);
			}
			else {
				console.log('message sent: ', msg);
				socket.send(msg);
			}
		}

		function sendPendingMessages() {
			pendingMessages.map(send);
		}
		
		function endConnection() {
			socket.close();
		}
	}
})();