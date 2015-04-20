(function () {
    'use strict';

    angular
        .module("PLMApp")
        .provider("blockly", function blocklyProvider() {
            this.options = {
                path: "/assets/javascripts/blockly/media/",
                trashcan: true,
                toolbox: [
                    /*
                                    {
                                        name: "Logic",
                                        blocks: [
                                            {type: "logic_compare"}
                                        ]
                                    }
                                */
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
        })
        .config(["blocklyProvider", function (blocklyProvider) {
            blocklyProvider.setOptions({
                path: "/assets/javascripts/blockly/media/",
                trashcan: true,
                toolbox: [
                    {
                        name: "Move",
                        blocks: [
                            {
                                type: "move_forward"
                            },
                            {
                                type: "move_backward"
                            },
                            {
                                type: "move_forward_many"
                            },
                            {
                                type: "move_backward_many"
                            }
                    ]
                },
                    {
                        name: "Turn",
                        blocks: [
                            {
                                type: "turn_right"
                            },
                            {
                                type: "turn_left"
                            },
                            {
                                type: "turn_back"
                            }
                    ]
                },
                    {
                        name: "Logic",
                        blocks: [
                            {
                                type: "logic_compare"
                            },
                            {
                                type: "logic_operation"
                            },
                            {
                                type: "logic_negate"
                            },
                            {
                                type: "controls_if"
                            },
                            {
                                type: "logic_boolean"
                            }
                    ]
                },
                    {
                        name: "Math",
                        blocks: [
                            {
                                type: "math_number"
                            },
                            {
                                type: "math_arithmetic"
                            },
                            {
                                type: "math_round"
                            },
                            {
                                type: "math_constrain"
                            },
                            {
                                type: "math_constant"
                            },
                            {
                                type: "math_trig"
                            },
                            {
                                type: "math_number_property"
                            },
                            {
                                type: "math_change"
                            }
                    ]
                }
            ]
            });

}]);

})();