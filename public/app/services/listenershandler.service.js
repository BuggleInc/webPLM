(function(){
  'use strict';

  angular
    .module('PLMApp')
    .factory('listenersHandler', listenersHandler);

  listenersHandler.$inject = ['$timeout', '$rootScope', 'connection'];

  function listenersHandler($timeout, $rootScope, connection) {
    var service = {
        register: register
    };
    return service;

    function register(action, fn) {
      return $rootScope.$on(action, function (event, data) {
        $timeout(function () {
          fn(data);
        }, 0);
      });
    }

    function sendMessage(msg) {
      connection.sendMessage(msg);
    }
  }
})();
