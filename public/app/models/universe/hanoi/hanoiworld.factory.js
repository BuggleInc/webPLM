(function () {
    "use strict";

    angular
        .module('PLMApp')
        .factory('HanoiWorld', HanoiWorld);

  HanoiWorld.$inject = ['HanoiDisk', 'HanoiMove'];

    function HanoiWorld(HanoiDisk, HanoiMove) {

        var HanoiWorld = function (world) {
            var slot, hanoiDisk, i, j;
      this.type = world.type;
            this.operations = [];
            this.currentState = -1;
            this.moveCount = world.moveCount;
            this.slots = [];
            for (i = 0; i < world.slots.length; i += 1) {
                slot = [];
                for (j = 0; j < world.slots[i].length; j += 1) {
          hanoiDisk = new HanoiDisk(world.slots[i][j]);
                    slot.push(hanoiDisk);
                }
                this.slots.push(slot);
            }
        };

        HanoiWorld.prototype.clone = function () {
            return new HanoiWorld(this);
        };

        HanoiWorld.prototype.addOperations = function (operations) {
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

        // HanoiWorld.prototype.generatedOperation = function (operation) {
        //     switch (operation.name) {
        //   case 'hanoiMove':
        //         return new HanoiMove(operation);
        //     }
        // };

        HanoiWorld.prototype.setState = function (state) {
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

        HanoiWorld.prototype.getEntity = function (entityID) {
            return this.entities[entityID];
        };

        HanoiWorld.prototype.drawSVG = function (svg) {
            (function () {

                document.getElementById('drawingArea').innerHTML = svg.operation;
                var svgbis = document.getElementsByTagName('svg');
                svgbis[0].setAttribute("width", "400px");
                svgbis[0].setAttribute("height", "400px");


            })();

        };

        return HanoiWorld;
    }
}());
