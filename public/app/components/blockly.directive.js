(function () {
    'use strict';

    angular
        .module("PLMApp")
        .directive('blockly', function ($window, $timeout, $rootScope, blockly) {
            return {
                restrict: 'E',
                scope: { // Isolate scope
                },
                template: '<div style="height:100%" class="blockly"></div>',
                link: function ($scope, element, attrs) {
                    var options = blockly.getOptions();
                    Blockly.inject(element.children()[0], options);
                }
            };
        });

})();