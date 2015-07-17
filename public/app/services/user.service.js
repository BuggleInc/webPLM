(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('userService', userService)
    .run(function (userService) {}); // To instanciate the service at startup

  userService.$inject = ['$timeout', '$cookies', 'connection', 'listenersHandler', '$auth', 'toasterUtils', 'gettextCatalog'];

  function userService($timeout, $cookies, connection, listenersHandler, $auth, toasterUtils, gettextCatalog) {

    listenersHandler.register('onmessage', handleMessage);

    var user = {};

    var actorUUID;
    var timeoutProfileUpdate;

    var service = {
      isAuthenticated: isAuthenticated,
      signUp: signUp,
      signInWithCredentials: signInWithCredentials,
      signInWithProvider: signInWithProvider,
      signOut: signOut,
      getUser: getUser,
      setTrackUser: setTrackUser,
      askTrackUser: askTrackUser,
      setNextAskTrackUser: setNextAskTrackUser,
      updateUser: updateUser,
      cloneUser: cloneUser
    };

    return service;

    function isAuthenticated() {
      return $auth.isAuthenticated()
    }

    function signUp(email, password, firstName, lastName) {
      return $auth.signup({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName
      });
    }

    function signInWithCredentials(email, password) {
      return $auth.login({
        email: email,
        password: password
      });
    }

    function signInWithProvider(provider) {
      return $auth.authenticate(provider);
    }

    function signOut() {
      $auth.logout()
        .then(function () {
          var msg = gettextCatalog.getString('You have been logged out');
          toasterUtils.info(msg);
        });
      connection.sendMessage('signOut', {});
    }

    function getUser()  {
      return user;
    }

    function setUser(data) {
      delete $cookies.gitID;
      user = data;
    }

    function cloneUser() {
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        trackUser: user.trackUser
      };
    }

    function updateUser(newUser) {
      user.firstName = newUser.firstName;
      user.lastName = newUser.lastName;
      user.fullName = user.firstName + ' ' + newUser.lastName;
      user.trackUser = newUser.trackUser;
      connection.sendMessage('updateUser', {
        firstName: user.firstName,
        lastName: user.lastName,
        trackUser: user.trackUser
      });
      timeoutProfileUpdate = $timeout(function () {
        var title = gettextCatalog.getString('Error during update');
        var msg = gettextCatalog.getString('An error occurred while updating your profile. Please excuse us for the inconvenience and retry to submit your changes later.');
        toasterUtils.error(title, msg);
      }, 10000);
    }

    function setGitID(gitID) {
      $cookies.gitID = gitID;
      if ($auth.isAuthenticated()) {
        $auth.logout();
      }
    }

    function setTrackUser(trackUser) {
      user.trackUser = trackUser;
      delete localStorage.nextAskTrackUser;
      connection.sendMessage('setTrackUser', {
        trackUser: trackUser
      });
    }

    function askTrackUser() {
      var now;
      var nextAskTrackUser;
      if (localStorage.nextAskTrackUser === undefined) {
        return true;
      }
      now = new Date();
      nextAskTrackUser = new Date(localStorage.nextAskTrackUser);
      return nextAskTrackUser < now;
    }

    function setNextAskTrackUser() {
      var nextAskTrackUser = new Date();
      nextAskTrackUser.setDate(nextAskTrackUser.getDate() + 3); // Ask again in 3 days
      localStorage.nextAskTrackUser = nextAskTrackUser;
    }

    function handleMessage(data) {
      var cmd = data.cmd;
      var args = data.args;
      switch (cmd) {
      case 'actorUUID':
        actorUUID = args.actorUUID;
        $cookies.actorUUID = actorUUID;
        break;
      case 'gitID':
        setGitID(args.gitID);
        break;
      case 'user':
        setUser(args.user);
        break;
      case 'userUpdated':
        $timeout.cancel(timeoutProfileUpdate);
        toasterUtils.info(gettextCatalog.getString('Your profile has been successfully updated'));
        break;
      }
    }
  }
})();