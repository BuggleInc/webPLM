(function () {
  "use strict";

  angular
    .module('PLMApp')
    .factory('oauthConfig', oauthConfig)
    .run(function (oauthConfig) {
        oauthConfig.init();
    });

  oauthConfig.$inject = ['$http', 'satellizer.config'];

  function oauthConfig($http, config) {
    var providers, service;

    providers = ['facebook', 'google', 'github', 'plmAccounts'];

    service = {
      init: init
    };

    function init() {
      $http.get('/api/oauth/settings')
        .then(function (response) {
          var data, provider;

          data = response.data;
          for (provider of providers) {
            if(data[provider]) {
              if(data[provider].clientId) {
                config.providers[provider].clientId = data[provider].clientId;
              }
              if(data[provider].authorizationEndpoint) {
                config.providers[provider].authorizationEndpoint = data[provider].authorizationEndpoint;
              }
             }
          }
        }, function (data) {
        }
      );
    }

    return service;

  }
}());