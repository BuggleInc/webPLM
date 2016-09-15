(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('messageQueue', messageQueue);

  messageQueue.$inject = ['$rootScope', '$timeout'];

  function messageQueue($rootScope, $timeout) {
    var client;
    var subscription;
    var cancellable;

    var service = {
      subscribe: subscribe,
      unsubscribe: unsubscribe
    };

    return service;

    function init(messageQueue, callback) {
      var protocol = 'ws:';
      if(document.location.protocol === 'https:') {
        protocol = 'wss:';
      }
      var url = protocol + '//' + document.location.hostname + ':15674/ws';
      var ws = new WebSocket(url);
      client = Stomp.over(ws)

      client.heartbeat.outgoing = 0;
      client.heartbeat.incoming = 0;

      var on_connect = function() {
        console.log('Successfully connected to message queue.')
        subscribe(messageQueue, callback);
      };
      var on_error =  function() {
        console.log('An error occurred while connecting to the message queue.');
      };

      client.connect('guest', 'guest', on_connect, on_error);
    }

    /**
     *
    */
    function subscribe(messageQueue, callback) {
      var headers = {
        'durable': false,
        'exclusive': false,
        'auto-delete': true
      };

      if(client !== undefined && client !== null) {
        subscription = client.subscribe(messageQueue, function(data) {
          var msg = JSON.parse(data.body);
          callback(msg);
        }, headers);
        cancellable = $timeout(unsubscribe, 10000);
      } else {
        init(messageQueue, callback);
      }
    }

    function unsubscribe() {
      $timeout.cancel(cancellable);
      if(subscription !== undefined && subscription !== null) {
        subscription.unsubscribe();
      }
      subscription = undefined;
      cancellable = undefined;
    }

  }
})();
