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
          for (var i = 0; i < operations.length; i += 1) {
              this.operations.push(operations[i]);
          }
      };

      World.prototype.setState = function (state) {
          if (state < this.operations.length && state >= -1) {
              this.drawSVG(this.operations[state]);
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
