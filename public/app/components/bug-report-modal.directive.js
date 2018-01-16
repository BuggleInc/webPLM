(function(){
  "use strict";

  angular
    .module('PLMApp')
    .directive('bugReportModal', bugReportModal);

  bugReportModal.$inject = ['listenersHandler', 'bugReport'];

  function bugReportModal (listenersHandler, bugReport) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/bug-report-modal.directive.html',
      link: function (scope, element, attrs) {
        var listener = listenersHandler.register('onmessage', handleMessage);
        scope.$on('$destroy', listener);

        scope.bugReport = bugReport;
        $(document).foundation('alert', 'reflow');
        $(document).foundation('reveal', 'reflow');
      }
    };
  }

  function handleMessage (data) {
    var cmd = data.cmd;
    var args = data.args;
    switch (cmd) {
      case 'issueCreated':
        $('#bugReportModal').foundation('reveal', 'close');
        break;
    }
  }
})();
