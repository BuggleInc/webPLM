(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('commonErrors', commonErrors);
	
	commonErrors.$inject = ['connection', 'listenersHandler'];
	
	function commonErrors(connection, listenersHandler) {
		
    /**
     * Array of common errors
     * 
     * Common errors are provided by the server if the user makes some common known errors
     * commonError : { 
     *  commonErrorID,   // The number of this common error
     *  commonErrorText  // The message of the hint provided
     * }
     *
    **/
    
    var commonErrors = [];
    var lastCommonError = -1;
    
    listenersHandler.register('onmessage', handleMessage);
    
		var service = {
      getCommonErrors: getCommonErrors,
      getLastCommonError: getLastCommonError,
      getSatisfactionLabel: getSatisfactionLabel
		};
		return service;
    
    function handleMessage(data) {
      var cmd = data.cmd;
      var args = data.args;
      switch (cmd) {
        case 'exercise':
          commonErrors = [];
          break;
        case 'executionResult':
          var commonErrorID = args.commonErrorID;
          var commonErrorText = args.commonErrorText;
          
          if(commonErrorIsValid(commonErrorID, commonErrorText) && notAddedYet(commonErrorID)) {
            lastCommonError = commonErrors.push({ commonErrorID: commonErrorID, commonErrorText: commonErrorText }) - 1;
          }
          break;
      }
    }
    
    function getCommonErrors() {
      return commonErrors;
    }
    
    function getLastCommonError() {
      return lastCommonError;
    }
    
    function getSatisfactionLabel(index) {
      switch(parseInt(index)) {
        case 1:
          return 'Strongly disagree';
          break;
        case 2:
          return 'Disagree';
          break;
        case 3:
          return 'Neither agree nor disagree';
          break;
        case 4:
          return 'Agree';
          break;
        case 5:
          return 'Strongly agree';
          break;
      }
    }
    
    function commonErrorIsValid(commonErrorID, commonErrorText) {
      if (commonErrorID !== undefined && commonErrorText !== undefined && commonErrorID !== -1 && commonErrorText !== '') {
        return true;
      }
      return false;
    }
    
    function notAddedYet(commonErrorID) {
      var result = true;
      commonErrors.forEach(function (element, index) {
        if(element.commonErrorID === commonErrorID) {
          lastCommonError = index;
          result = false;
        }
      });
      return result;
    }
	}
})();