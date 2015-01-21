(function () {	
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('connection', ['$rootScope', connection]);
		
	function connection ($rootScope) {		
		var socket = new WebSocket('ws://localhost:9000/websocket');
		var connectStatus = false;
		var pendingMessages = [];
		
		var service = {
			sendMessage: sendMessage,
			setupMessaging: setupMessaging,
			endConnection: endConnection
		};
		
		socket.onopen = function (event) {
			connectStatus = true;
			sendPendingMessages();
			$rootScope.$emit('onopen', event);
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
		
		function setupMessaging(fn) {
		    socket.onmessage = function (event) {
		    	var msg = JSON.parse(event.data);
			    
			    // Has to use $apply to warn AngularJS 
			    // that the model could have been updated
			    $rootScope.$apply(function () {
			    	fn(msg);
			    });
		    };
		}
		
		function sendPendingMessages() {
			pendingMessages.map(send);
		}
		
		function endConnection() {
			socket.close();
		}
	}
})();