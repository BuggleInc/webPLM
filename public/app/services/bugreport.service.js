(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('bugReport', bugReport);
	
  bugReport.$inject = ['connection', 'listenersHandler', 'gettextCatalog', 'toasterUtils'];
  
	function bugReport(connection, listenersHandler, gettextCatalog, toasterUtils) {
    var NO_ERROR = -1;
    var INCORRECT_ISSUE = 0;
    var ERRORED_ISSUE = 1;
    
    listenersHandler.register('onmessage', handleMessage);
        
	var service = {
      title: '',
      body: '',
      error: NO_ERROR,
      errorTitle: '',
      errorMsg: '',
      issuesUrl: 'https://github.com/BuggleInc/webPLM/issues',
      INCORRECT_ISSUE: INCORRECT_ISSUE,
      ERRORED_ISSUE: ERRORED_ISSUE,
      submit: submit
    };

	return service;

    function submit() {
      service.error = NO_ERROR;
      service.errorTitle = '';
      service.errorMsg = '';
      connection.sendMessage('submitBugReport', { title: service.title, body: service.body });
    }
    
    function handleMessage(data) {
      var cmd = data.cmd;
      var args = data.args;
      switch (cmd) {
        case 'incorrectIssue':
          service.error = INCORRECT_ISSUE;
          service.errorMsg = args.msg;
          break;
        case 'issueErrored':
          service.error = ERRORED_ISSUE;
          break;
        case 'issueCreated':
          var toastTitle = gettextCatalog.getString('Issue created');
          var toastMsg = gettextCatalog.getString('Thank you for your remark, we will do our best to integrate it. Follow our progress at {{url}}', { url: args.url });
          toasterUtils.success(toastTitle, toastMsg, -1);
          service.title = '';
          service.body = '';
          service.error = NO_ERROR;
          break;
      }
    }    
	}
})();