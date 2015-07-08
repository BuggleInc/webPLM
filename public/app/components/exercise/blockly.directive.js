(function () {
    'use strict';

    angular
        .module("PLMApp")
        .directive('blockly', function ($window, $timeout, $rootScope, blocklyService) {
            return {
                restrict: 'E',
                scope: { // Isolate scope
                },
                templateUrl: '/assets/app/components/exercise/blockly.directive.html',
                link: function ($scope, element, attrs) {
                    var options = blocklyService.getOptions();
                    Blockly.inject(element.children()[0], options);
                }
            };
        });

})();