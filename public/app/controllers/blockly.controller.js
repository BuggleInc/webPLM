(function () {
    'use strict';

    angular
        .module("PLMApp")
        .controller('blocklyController', function ($scope, $timeout, Blockly) {
            // This is wrapped in timeout to allow the directive to load.
            $timeout(function () {
                Blockly.onChange(function (workspace) {
                    document.getElementById('source').innerHTML = angular.toJson(workspace, true);
                });
            }, 0);
        })

})();