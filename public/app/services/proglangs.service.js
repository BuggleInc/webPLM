(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('progLangs', progLangs);

  progLangs.$inject = ['connection', 'listenersHandler'];

  function progLangs(connection, listenersHandler) {
    var programmingLanguages = [];
    var currentProgrammingLanguage;
    var disabled = false;

    listenersHandler.register('onmessage', handleMessage);

    var service = {
      setProgLangs: setProgLangs,
      getProgLangs: getProgLangs,
      setCurrentProglang: setCurrentProglang,
      getCurrentProglang: getCurrentProglang,
      setDisabled: setDisabled,
      isDisabled: isDisabled,
      areAvailable: areAvailable
    };

    return service;

    function handleMessage(data) {
      var cmd = data.cmd;
      var args = data.args;
      switch (cmd) {
      case 'newProgLang':
        disabled = false;
        break;
      }
    }

    function setProgLangs(progLangs) {
      programmingLanguages = progLangs;
    }

    function getProgLangs() {
      return programmingLanguages;
    }

    function setCurrentProglang(progLang) {
      console.log('progLang: ', progLang);
      disabled = true;
      currentProgrammingLanguage = progLang;
      connection.sendMessage('setProgrammingLanguage', {
        programmingLanguage: progLang.lang
      });
    }

    function getCurrentProglang() {
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