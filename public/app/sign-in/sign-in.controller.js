(function () {
  'use strict';

  angular
    .module('PLMApp')
    .controller('SignIn', SignIn);

  SignIn.$inject = ['userService', 'toasterUtils', 'gettextCatalog'];

  function SignIn(userService, toasterUtils, gettextCatalog) {
    var signIn = this;
    var PROVIDER_ERROR_MESSAGE = gettextCatalog.getString('Login failed; request failed');
    var SUCCESSFUL_LOGIN_MESSAGE = gettextCatalog.getString('You have successfully signed in');

    signIn.email = '';
    signIn.pwd = '';

    signIn.showErrorMsg = false;
    signIn.errorMsg = '';

    signIn.authenticate = authenticate;
    signIn.hideErrorMsg = hideErrorMsg;

    function authenticate(provider) {
      userService.signInWithProvider(provider)
        .then(function (data) {
          signIn.showErrorMsg = false;
          signIn.errorMsg = '';
          toasterUtils.info(SUCCESSFUL_LOGIN_MESSAGE);
        })
        .catch(function (response) {
          signIn.showErrorMsg = true;
          signIn.errorMsg = PROVIDER_ERROR_MESSAGE;
        });
    }

    function hideErrorMsg() {
      signIn.showErrorMsg = false;
    }
  }
})();