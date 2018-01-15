(function ()
{
    'use strict';

    angular
        .module('PLMApp')
        .factory('DutchFlagWorld', DutchFlagWorld);

    DutchFlagWorld.$inject = [ 'DutchFlagSwap' ];

    function DutchFlagWorld(DutchFlagSwap)
    {
        var DutchFlagWorld = function(world)
        {
            this.type = world.type;
            this.operations = [];
            this.currentState = -1;

            this.content = [];
            for(var i=0;i<world.content.length;i++)
            {
                this.content.push(world.content[i]);
            }

            this.memory = [];
            this.initialValues = [];
            for(var i=0;i<world.content.length;i++)
            {
                this.initialValues.push(world.content[i]);
            }

            this.memory.push(this.initialValues);

            this.moveCount = world.moveCount;
        };

        DutchFlagWorld.prototype.clone = function()
        {
            return new DutchFlagWorld(this);
        };

        DutchFlagWorld.prototype.addOperations = function (operations) {
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

        // DutchFlagWorld.prototype.generatedOperation = function (operation)
        // {
        //     switch(operation.name) {
        //         case 'dutchFlagSwap':
        //             return new DutchFlagSwap(operation);
        //     }
        // };

        DutchFlagWorld.prototype.setState = function (state) {
            var i, j, length, step;
            if (state < this.operations.length && state >= -1) {

                console.log(this.operations);

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
        DutchFlagWorld.prototype.drawSVG = function (svg) {
            (function () {

                document.getElementById('drawingArea').innerHTML = svg.operation;
                var svgbis = document.getElementsByTagName('svg');
                svgbis[0].setAttribute("width", "400px");
                svgbis[0].setAttribute("height", "400px");


            })();

        };

        return DutchFlagWorld;
    }
})();
