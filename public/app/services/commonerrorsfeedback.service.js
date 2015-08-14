(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('commonErrorsFeedback', commonErrorsFeedback);
	
	commonErrorsFeedback.$inject = ['connection'];
	
	function commonErrorsFeedback(connection) {
    
		var service = {
      accuracy: 3,
      help: 3,
      comment: '',
      getSatisfactionLabel: getSatisfactionLabel,
      submitFeedback: submitFeedback
		};
		return service;
    
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
    
    function submitFeedback(commonErrorID) {
      connection.sendMessage('commonErrorFeedback', {
        commonErrorID: commonErrorID,
        accuracy: parseInt(service.accuracy),
        help: parseInt(service.help),
        comment: service.comment
      });
      service.accuracy = 3;
      service.help = 3;
      service.comment = '';
    }
	}
})();