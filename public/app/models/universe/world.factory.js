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
      operations.map((op) => this.operations.push(op));
    };

    World.prototype.setState = function (state) {
      this.currentState = state;
      this.drawSVG(this.operations[this.currentState].operation);
    };

    World.prototype.drawSVG = function (content) {
          (function () {

              document.getElementById("drawingArea").innerHTML = content;
              var svgElm = document.getElementsByTagName("svg");
              svgElm[0].setAttribute("width", "400px");
              svgElm[0].setAttribute("height", "400px");

          })();
    };

    return World;
  }
}());
