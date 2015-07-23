(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.directive('bugReportModal', bugReportModal);
	
  bugReportModal.$inject = ['bugReport'];
  
	function bugReportModal (bugReport) {
		return {
			restrict: 'E',
			templateUrl: '/assets/app/components/bug-report-modal.directive.html',
			link: function (scope, element, attrs) {
        scope.bugReport = bugReport;
        console.log('scope: ', scope);
        $(document).foundation('alert', 'reflow');
				$(document).foundation('reveal', 'reflow');
			}
		};
	}
})();