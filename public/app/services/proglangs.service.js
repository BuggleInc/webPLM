(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('progLangs', progLangs);

  progLangs.$inject = ['$auth', '$cookies', 'connection', 'listenersHandler'];

  function progLangs($auth, $cookies, connection, listenersHandler) {
    var programmingLanguages = [];
    var currentProgrammingLanguage;
    var disabled = false;

    listenersHandler.register('onmessage', handleMessage);

    var service = {
      setProgLangs: setProgLangs,
      getProgLangs: getProgLangs,
      setRemotelySelectedLang: setRemotelySelectedLang,
      getCurrentProgLang: getCurrentProgLang,
      setDisabled: setDisabled,
      isDisabled: isDisabled,
      areAvailable: areAvailable
    };

    return service;

    function handleMessage(data) {
      var cmd = data.cmd;
      var args = data.args;
      switch (cmd) {
      case 'progLangs':
        setProgLangs(args.availables);
        setCurrentProgLang(args.selected);
        break;
      case 'newProgLang':
        setCurrentProgLang(args.newProgLang);
        break;
      }
    }

    function setProgLangs(progLangs) {
      programmingLanguages = progLangs;
    }

    function getProgLangs() {
      return programmingLanguages;
    }

    function setRemotelySelectedLang(progLang) {
      disabled = true;
      connection.sendMessage('setProgLang', {
          'progLang': progLang.lang
      });
    }

    function setCurrentProgLang(progLang) {
      console.log('progLang: ', progLang);
      if (!$auth.isAuthenticated()) {
          $cookies.progLang = progLang;
      }
      currentProgrammingLanguage = progLang;
      disabled = false;
    }

    function getCurrentProgLang() {
      return currentProgrammingLanguage;
    }

    function setDisabled(bool) {
      disabled = bool;
    }

    function isDisabled() {
      return disabled;
    }

    function areAvailable() {
      return programmingLanguages.length > 0;
    }
  }
})();
