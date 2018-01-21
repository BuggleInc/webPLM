(function () {
  "use strict";

  angular
    .module("PLMApp")
    .factory("World", World);

  function World() {

    var World = function (world) {
      this.type = world.type;
      this.operations = [];
      this.currentState = -1;
      this.steps = [];

      this.width = world.width;
      this.height = world.height;
    };

    World.prototype.clone = function () {
      return new World(this);
    };

      World.prototype.addOperations = function (operations) {
          var step = [];
          var length = operations.length;
          for (var i = 0; i < length; i += 1) {
              var operation = operations[i];
              step.push(operation);
          }
          this.operations.push(step);
      };

      World.prototype.setState = function (state) {
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

    World.prototype.drawSVG = function (svg) {
          (function () {

              document.getElementById("drawingArea").innerHTML = svg.operation;
              var svgElm = document.getElementsByTagName("svg");
              svgElm[0].setAttribute("width", "400px");
              svgElm[0].setAttribute("height", "400px");

          })();
      };

    return World;
  }
}());