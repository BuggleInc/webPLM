(function () {
    'use strict';

    angular
        .module("PLMApp")
        .directive('blockly', function ($window, $timeout, $rootScope, blockly) {
            return {
                restrict: 'E',
                scope: { // Isolate scope
                },
                templateUrl: '/assets/app/components/blockly.directive.html',
                link: function ($scope, element, attrs) {
                    var options = blockly.getOptions();
                    Blockly.inject(element.children()[0], options);
                }
            };
        });

})();