(function() {
  "use strict";

  angular
    .module('PLMApp')
    .factory('TurtleWorld', TurtleWorld);

  TurtleWorld.$inject = ['Turtle',
    'Line', 'Circle',
    'SizeHint',
    'MoveTurtle', 'RotateTurtle', 'ChangeTurtleVisible',
    'AddLine', 'AddCircle', 'ClearCanvas',
    'AddSizeHint'
  ];

  function TurtleWorld(Turtle,
    Line, Circle,
    SizeHint,
    MoveTurtle, RotateTurtle, ChangeTurtleVisible,
    AddLine, AddCircle, ClearCanvas,
    AddSizeHint) {

    var TurtleWorld = function(world) {
      var turtleID, turtle, i;

      this.type = world.type;
      this.width = world.width;
      this.height = world.height;
      this.operations = [];
      this.currentState = -1;
      this.steps = [];

      this.shapes = [];
      this.addShapes(world.shapes);

      this.sizeHints = [];
      this.addSizeHints(world.sizeHints);

      this.entities = {};

      if (world instanceof TurtleWorld) {
        for (turtleID in world.entities) {
          if (world.entities.hasOwnProperty(turtleID)) {
            turtle = world.entities[turtleID];
            this.entities[turtleID] = new Turtle(turtle);
          }
        }
      } else {
        for (i = 0; i < world.entities.length; i += 1) {
          turtle = world.entities[i];
          this.entities[turtle.name] = new Turtle(turtle);
        }
      }
    };

    TurtleWorld.prototype.getEntity = function(entityID) {
      return this.entities[entityID];
    };

    TurtleWorld.prototype.clone = function() {
      return new TurtleWorld(this);
    };

    TurtleWorld.prototype.addOperations = function(operations) {
      var i, operation, generatedOperation, step = [];
      for (i = 0; i < operations.length; i += 1) {
        operation = operations[i];
        // generatedOperation = this.generateOperation(operation);
        // step.push(generatedOperation);
      }
      this.operations.push(step);
    };

    TurtleWorld.prototype.setState = function(state) {
        var i, length, step;

        console.log (this.operations);

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

    TurtleWorld.prototype.drawSVG = function (svg) {
          (function () {
              console.log(svg);

              document.getElementById('drawingArea').innerHTML = svg.operation;
              var svgbis = document.getElementsByTagName('svg');
              svgbis[0].setAttribute("width", "400px");
              svgbis[0].setAttribute("height", "400px");


          })();

    };

    TurtleWorld.prototype.generateOperation = function(operation) {
      switch (operation.name) {
        case 'moveTurtle':
          return new MoveTurtle(operation);
        case 'rotateTurtle':
          return new RotateTurtle(operation);
        case 'changeTurtleVisible':
          return new ChangeTurtleVisible(operation);
        case 'addLine':
          return new AddLine(operation);
        case 'addCircle':
          return new AddCircle(operation);
        case 'clearCanvas':
          return new ClearCanvas(operation);
        case 'addSizeHint':
          return new AddSizeHint(operation);
        default:
          console.log('Operation not supported yet: ', operation);
      }
    };

    TurtleWorld.prototype.addShapes = function(shapes) {
      var self, type;
      self = this;
      shapes.forEach(function(shape) {
        type = shape.type.split('.').pop();
        switch (type) {
          case 'Line':
            self.shapes.push(new Line(shape));
            break;
          case 'Circle':
            self.shapes.push(new Circle(shape));
            break;
          default:
            console.log('Shape not supported yet: ', shape);
        }
      });
    };

    TurtleWorld.prototype.addSizeHints = function(sizeHints) {
      var self = this;
      sizeHints.forEach(function(sizeHint) {
        self.sizeHints.push(new SizeHint(sizeHint));
      });
    };

    return TurtleWorld;
  }
}());
