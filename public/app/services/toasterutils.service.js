(function () {
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('toasterUtils', toasterUtils);
	
	toasterUtils.$inject = ['toaster', '$timeout', '$window'];
	
	function toasterUtils(toaster, $timeout, $window) {
		
		var service = {
                info: info,
				success: success,
                warning: warning,
				error: error
		};
		return service;
        
        function pop(type, title, message, duration) {
            $timeout(function () {
                toaster.pop(type, title, message, duration, 'trustedHtml', goToLink);
            }, 0);
        }
        
        function info(message, optDuration) {
            var duration = optDuration || 1500;
            pop('info', '', message, duration);
		}
        
		function success(title, message, optDuration) {
            var duration = optDuration || 1500;
            pop('success', title, message, duration);
		}
		
        function warning(title, message, optDuration) {
            var duration = optDuration || 3000;
            pop('warning', title, message, duration);
		}
        
        function error(title, message, optDuration) {
            var duration = optDuration || -1;
            pop('error', title, message, duration);
		}
    
		function goToLink(toaster) {
		  var match = toaster.body.match(/http[s]?:\/\/[^\s]+/);
		  if (match) $window.open(match[0]);
		  return true;
		};
	}
})();