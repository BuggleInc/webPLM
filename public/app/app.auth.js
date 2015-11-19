(function () {
  'use strict';

  angular
    .module('PLMApp')
    .config(config);

  function config($httpProvider, $authProvider) {

    $httpProvider.interceptors.push(function ($q, $injector) {
      return {
        request: function (request) {
          var $auth = $injector.get('$auth');
          if ($auth.isAuthenticated()) {
            request.headers['X-Auth-Token'] = $auth.getToken();
          }

          return request;
        },
        responseError: function (rejection) {
          var $auth = $injector.get('$auth');
          if (rejection.status === 401) {
            if ($auth.isAuthenticated()) {
              $auth.logout();
            }
          }
          return $q.reject(rejection);
        }
      };
    });

    // Auth config
    $authProvider.httpInterceptor = true; // Add Authorization header to HTTP request
    $authProvider.loginOnSignup = true;
    $authProvider.loginRedirect = '/home';
    $authProvider.logoutRedirect = '/';
    $authProvider.signupRedirect = '/home';
    $authProvider.loginUrl = '/signIn';
    $authProvider.signupUrl = '/signUp';
    $authProvider.loginRoute = '/signIn';
    $authProvider.signupRoute = '/signUp';
    $authProvider.tokenName = 'token';
    $authProvider.tokenPrefix = 'satellizer'; // Local Storage name prefix
    $authProvider.authHeader = 'X-Auth-Token';

    // PLMAccounts
    $authProvider.plmAccounts({
      clientId: plmAccountsClientID,
      url: '/authenticate/plmAccounts',
      authorizationEndpoint: 'https://plm-accounts.telecomnancy.univ-lorraine.fr/#!/dialog/authorize',
      redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
      scope: 'email',
      scopeDelimiter: ',',
      requiredUrlParams: ['display', 'scope'],
      display: 'popup',
      type: '2.0',
      popupOptions: {
        width: 580,
        height: 400
      }
    });

    // Facebook
    $authProvider.facebook({
      clientId: '1067831246562575',
      url: '/authenticate/facebook',
      authorizationEndpoint: 'https://www.facebook.com/dialog/oauth',
      redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
      scope: 'email',
      scopeDelimiter: ',',
      requiredUrlParams: ['display', 'scope'],
      display: 'popup',
      type: '2.0',
      popupOptions: {
        width: 481,
        height: 269
      }
    });

    // GitHub
		$authProvider.github({
			clientId: githubClientID,
			url: '/authenticate/github',
			authorizationEndpoint: 'https://github.com/login/oauth/authorize',
			redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host + '/',
			scope: 'user:email',
			scopeDelimiter: ',',
			display: 'popup',
			type: '2.0'
		});

		// Google
		$authProvider.google({
			clientId: '440881557579-gk8rs3j0tm0oko7mo45fouodg02q6r8l.apps.googleusercontent.com',
			url: '/authenticate/google',
			authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
			redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
			scope: ['profile', 'email'],
			scopePrefix: 'openid',
			scopeDelimiter: ' ',
			requiredUrlParams: ['scope'],
			optionalUrlParams: ['display'],
			display: 'popup',
			type: '2.0',
			popupOptions: { width: 580, height: 400 }
		});

    // Twitter
    $authProvider.twitter({
      url: '/authenticate/twitter',
      type: '1.0',
      popupOptions: {
        width: 495,
        height: 645
      }
    });
  }
}());
