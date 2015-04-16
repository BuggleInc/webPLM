(function () {
    'use strict';

    angular
        .module("PLMApp")
        .service('Blockly', function ($timeout) {
        
            var me = this;
            this.holdoffChanges = false;
            this.setWorkspace = function (workspace) {
                if (Blockly.getMainWorkspace() != null && Blockly.getMainWorkspace().topBlocks_.length != 0) {
                    Blockly.getMainWorkspace().clear();
                }
                Blockly.Json.setWorkspace(Blockly.getMainWorkspace(), workspace);

                // Blockly sends an immediate change - we want to filter this out
                me.holdoffChanges = true;
                $timeout(function () {
                    me.holdoffChanges = false;
                }, 500);
            };

            this.clearWorkspace = function () {
                if (Blockly.getMainWorkspace() != null && Blockly.getMainWorkspace().topBlocks_.length != 0) {
                    Blockly.getMainWorkspace().clear();
                }
            };

            this.getWorkspace = function () {
                return Blockly.Json.getWorkspace(Blockly.getMainWorkspace());
            };

            this.setToolbox = function (toolbox) {
                return Blockly.Json.getWorkspace(Blockly.getMainWorkspace());
            };

            this.onChange = function (callback) {
                $(Blockly.mainWorkspace.getCanvas()).bind("blocklyWorkspaceChange", function () {
                    if (me.holdoffChanges === false) {
                        // Send a notification
                        callback(Blockly.Json.getWorkspace(Blockly.getMainWorkspace()));
                    }
                })
            };
        });

})();