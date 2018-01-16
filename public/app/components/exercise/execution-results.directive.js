(function(){
  "use strict";

  angular
    .module('PLMApp')
    .directive('executionResults', executionResults);

  executionResults.$inject = ['connection', 'listenersHandler', 'commonErrors'];

  function executionResults (connection, listenersHandler, commonErrors) {
    return {
      restrict: 'E',
      templateUrl: '/assets/app/components/exercise/execution-results.directive.html',
      link: function (scope, element, attrs) {
        var listener = listenersHandler.register('onmessage', function (data) {
          var cmd = data.cmd;
          var args = data.args;
          switch (cmd) {
            case 'executionResult':
              if(args.commonErrorID === -1) {
                scope.currentTab = -1;
              }
              else {
                scope.currentTab = commonErrors.getLastCommonError();
              }
              break;
          }
        });
        scope.$on('$destroy', listener);

        scope.commonErrors = commonErrors;
        scope.currentTab = -1;
        scope.setCurrentTab = function (index) {
          scope.currentTab = index;
        };
        $(document).foundation('tab', 'reflow');
      }
    };
  }
})();
