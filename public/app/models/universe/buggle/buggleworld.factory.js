(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('BuggleWorld', BuggleWorld);

  function BuggleWorld() {

    var BuggleWorld = function (world) {
      this.type = world.type;
      this.operations = [];
      this.currentState = -1;
      this.steps = [];

      this.width = world.width;
      this.height = world.height;
    };

    BuggleWorld.prototype.clone = function () {
      return new BuggleWorld(this);
    };

      BuggleWorld.prototype.addOperations = function (operations) {
          var i, step, length, operation, generatedOperation;

          step = [];
          length = operations.length;
          for (i = 0; i < length; i += 1) {
              operation = operations[i];
              step.push(operation);
          }
          this.operations.push(step);
      };

      BuggleWorld.prototype.setState = function (state) {
          var i, j, length, step;
          if (state < this.operations.length && state >= -1) {

              if (this.currentState < state) {
                  for (i = this.currentState + 1; i <= state; i += 1) {
                      step= this.operations;
                      length = step.length;
                      this.drawSVG(step[i][0]);
                  }
              } else {
                  for (i = this.currentState; i > state; i -= 1) {
                      step= this.operations;
                      length = step.length;
                      this.drawSVG(step[i][0]);
                  }
              }
              this.currentState = state;
          }
      };

    BuggleWorld.prototype.drawSVG = function (svg) {
          (function () {

              document.getElementById('drawingArea').innerHTML = svg.operation;
              var svgbis = document.getElementsByTagName('svg');
              svgbis[0].setAttribute("width", "400px");
              svgbis[0].setAttribute("height", "400px");

          })();
      };

    return BuggleWorld;
  }
}());
