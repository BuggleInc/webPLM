(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('connection', connection);
	
	connection.$inject = ['$rootScope', 'toasterUtils'];
	
	function connection ($rootScope, toasterUtils) {
		var url = 'ws://'+document.location.host+'/websocket';
		if(localStorage['satellizer_token'] !== undefined) {
			url+= '?token='+localStorage['satellizer_token'];
		}
		var socket = new WebSocket(url);
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

        socket.onclose = function (event) {
            var title;
            var msg;
                        
            switch(event.code) {
                case 1006:
                    title = 'Connexion lost';
                    msg = 'You have been brutally disconnected from the server, probably due to a crash. You should copy your current work before refreshing the page. Please excuse us for the inconvenience.';
                    toasterUtils.error(title, msg);
                    break;
                default:
                    title = 'Session closed';
                    msg = 'You have been disconnected from the server.' +
                        'If it was not wanted, don\'t forget to copy your current work before refreshing the page.';
                    toasterUtils.warning(title, msg);
                    break;
            };
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