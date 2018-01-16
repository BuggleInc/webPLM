(function()
{
    "use strict";

    angular
        .module('PLMApp')
        .factory('SortingWorld', SortingWorld);

    SortingWorld.$inject = [ 'SetValOperation', 'SwapOperation','CopyOperation', 'CountOperation', 'GetValueOperation'
    ];

    function SortingWorld(SetValOperation, SwapOperation, CopyOperation, CountOperation, GetValueOperation)
    {
        var SortingWorld = function(world)
        {
            this.type = world.type;
            this.operations = [];
            this.currentState = -1;
            this.readCount = world.readCount;
            this.writeCount = world.writeCount;

            this.values = [];
            for(var i=0;i<world.values.length;i++)
            {
                this.values.push(world.values[i]);
            }

            this.initValues = [];

            //contains each array of values after an operation
            this.memory = [];
            for(var i=0;i<world.values.length;i++)
            {
                this.initValues.push(world.values[i]);
            }

            this.memory.push(this.initValues);

            this.colors = ['#0000FF', '#FF0000', '#FFFF00',
            '#00FF00', '#00FFFF', '#FF00FF','#663300', '#336699', '#993366', '#666699' ];
        };

        SortingWorld.prototype.clone = function()
        {
            return new SortingWorld(this);
        };

        SortingWorld.prototype.addOperations = function (operations) {
            var i, step, length, operation, generatedOperation;
            step = [];
            length = operations.length;

            for(var i=0; i < length;i++) {
                operation = operations[i];
                step.push(operation);
            // generatedOperation = this.generateOperation(operation);
            // step.push(generatedOperation);
        }
        this.operations.push(step);
        };

        SortingWorld.prototype.generatedOperation = function (operation)
        {
            switch(operation.name) {
                case 'copyOperation':
                    return new CopyOperation(operation);
                case 'setValOperation':
                    return new SetValOperation(operation);
                case 'swapOperation':
                    return new SwapOperation(operation);
                case 'countOperation':
                    return new CountOperation(operation);
                case 'getValueOperation' :
                    return new GetValueOperation(operation);
            }
        };

        SortingWorld.prototype.setState = function (state) {
            var i;

            var length;
            var step;
            if(state < this.operations.length && state >= -1) {
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
                }
                else {
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

        SortingWorld.prototype.drawSVG = function (svg) {
            (function () {

                document.getElementById('drawingArea').innerHTML = svg.operation;
                var svgbis = document.getElementsByTagName('svg');
                svgbis[0].setAttribute("width", "400px");
                svgbis[0].setAttribute("height", "400px");


            })();

        };

        return SortingWorld;
    }
})();
