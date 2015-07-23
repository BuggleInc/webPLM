(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('bugReport', bugReport);
	
  bugReport.$inject = ['connection'];
  
	function bugReport(connection, gettextCatalog) {
    var title = '';
    var text = '';

		var service = {
      title: title,
      text: text,
      submit: submit
    };

		return service;

    function submit() {
      connection.sendMessage('submitBugReport', { title: title, text: text });
      title = '';
      text = '';
    }
	}
})();