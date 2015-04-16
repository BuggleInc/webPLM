(function () {
    'use strict';

    angular
        .module("PLMApp")
        .directive('blockly', function ($window, $timeout, $rootScope, blockly) {
            return {
                restrict: 'E',
                scope: { // Isolate scope
                },
                template: '<div style="height:10%" class="blockly"></div>',
                // templateUrl: '/assets/app/components/blockly.directive.html',
                link: function ($scope, element, attrs) {
                    var options = blockly.getOptions();
                    Blockly.inject(element.children()[0], options);
                }
            };
        });

})();