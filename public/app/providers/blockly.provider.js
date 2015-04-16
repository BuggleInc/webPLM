(function () {
    'use strict';

    angular
        .module("PLMApp")
        .provider("blockly", function () {
            this.options = {
                path: "assets/javascripts/blockly/media/",
                trashcan: true,
                toolbox: [
                {
                    name: "TEMPO",
                    blocks: []
                },
                {
                    name: "Logic",
                    blocks: [
                        {type: "logic_compare"},
                        {type: "logic_operation"},
                        {type: "logic_negate"},
                        {type: "controls_if"},
                        {type: "logic_boolean"}
                    ]
                },
                {
                    name: "Math",
                    blocks: [
                        {type: "math_number"},
                        {type: "math_arithmetic"},
                        {type: "math_round"},
                        {type: "math_constrain"},
                        {type: "math_constant"},
                        {type: "math_trig"},
                        {type: "math_number_property"},
                        {type: "math_change"}
                    ]
                }
            ]
            };

            this.$get = function () {
                var localOptions = this.options;
                return {
                    getOptions: function () {
                        return localOptions;
                    }
                };
            };

            this.setOptions = function (options) {
                this.options = options;
            };
        });

})();