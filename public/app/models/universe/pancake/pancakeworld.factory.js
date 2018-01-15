(function ()
{
    'use strict';

    angular
        .module('PLMApp')
        .factory('PancakeWorld',PancakeWorld);

        PancakeWorld.$inject = [ 'FlipOperation' ];

    function PancakeWorld(FlipOperation)
    {
        var PancakeWorld = function(world)
        {
            this.type = world.type;
            this.operations = [];
            this.currentState = -1;
            this.pancakeStack = world.pancakeStack.slice();
            if (!(world instanceof PancakeWorld)) {
                this.pancakeStack.reverse();
            }

            this.moveCount = world.moveCount;
            this.numberFlip = world.numberFlip ;
            this.burnedWorld = world.burnedWorld;
        };

        PancakeWorld.prototype.clone = function()
        {
            return new PancakeWorld(this);
        };

        PancakeWorld.prototype.addOperations = function (operations) {
            var i, step, length, operation, generatedOperation;

            step = [];
            length = operations.length;
            for (i = 0; i < length; i += 1) {
                operation = operations[i];
                step.push(operation);
                // generatedOperation = this.generateOperation(operation);
                // step.push(generatedOperation);
            }
            this.operations.push(step);
        };

        // PancakeWorld.prototype.generatedOperation = function (operation)
        // {
        //     switch(operation.name) {
        //         case 'flipOperation':
        //             return new FlipOperation(operation);
        //     }
        // };

        PancakeWorld.prototype.setState = function (state) {
            var i, j, length, step;
            if (state < this.operations.length && state >= -1) {
                if (this.currentState < state) {
                    for (i = this.currentState + 1; i <= state; i += 1) {
                        // step = this.operations[i];
                        step= this.operations;
                        length = step.length;
                        // for (j = 0; j < length; j += 1) {
                        // step[j].apply(this);
                        this.drawSVG(step[i][0]);
                        // }
                    }
                } else {
                    for (i = this.currentState; i > state; i -= 1) {
                        // step = this.operations[i];
                        step= this.operations;
                        length = step.length;
                        // for (j = 0; j < length; j += 1) {
                        // step[j].reverse(this);
                        this.drawSVG(step[i][0]);
                        // }
                    }
                }
                this.currentState = state;
            }
        };
        PancakeWorld.prototype.drawSVG = function (svg) {
            (function () {

                document.getElementById('drawingArea').innerHTML = svg.operation;
                var svgbis = document.getElementsByTagName('svg');
                svgbis[0].setAttribute("width", "400px");
                svgbis[0].setAttribute("height", "400px");


            })();

        };

        return PancakeWorld;
    }
})();
