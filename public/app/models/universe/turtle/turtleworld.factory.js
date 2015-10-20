(function () {
	'use strict';

	angular
		.module('PLMApp')
		.factory('TurtleWorld', TurtleWorld);

	TurtleWorld.$inject = ['Turtle',
                        'Line', 'Circle',
                        'SizeHint',
                        'MoveTurtle', 'RotateTurtle', 'ChangeTurtleVisible',
                        'AddLine', 'AddCircle', 'ClearCanvas',
                        'AddSizeHint'];

	function TurtleWorld(Turtle,
                        Line, Circle,
                        SizeHint,
                        MoveTurtle, RotateTurtle, ChangeTurtleVisible,
                        AddLine, AddCircle, ClearCanvas,
                        AddSizeHint) {

		var TurtleWorld = function (world) {
      var turtleID, turtle;
      
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
			for (turtleID in world.entities) {
				if (world.entities.hasOwnProperty(turtleID)) {
					turtle = world.entities[turtleID];
					this.entities[turtleID] = new Turtle(turtle);
				}
			}
		};

    TurtleWorld.prototype.getEntity = function (entityID) {
			return this.entities[entityID];
		};
    
		TurtleWorld.prototype.clone = function () {
			return new TurtleWorld(this);
		};

		TurtleWorld.prototype.addOperations = function (operations) {
			var i, operation, generatedOperation, step = [];
			for (i = 0; i < operations.length; i += 1) {
				operation = operations[i];
				generatedOperation = this.generateOperation(operation);
				step.push(generatedOperation);
			}
			this.operations.push(step);
		};

		TurtleWorld.prototype.setState = function (state) {
			var i, j, step;
			if (state < this.operations.length && state >= -1) {
				if (this.currentState < state) {
					for (i = this.currentState + 1; i <= state; i += 1) {
						step = this.operations[i];
						for (j = 0; j < step.length; j += 1) {
							step[j].apply(this);
						}
					}
				} else {
					for (i = this.currentState; i > state; i -= 1) {
						step = this.operations[i];
						for (j = 0; j < step.length; j += 1) {
							step[j].reverse(this);
						}
					}
				}
				this.currentState = state;
			}
		};

		TurtleWorld.prototype.generateOperation = function (operation) {
			switch (operation.type) {
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

    TurtleWorld.prototype.addShapes = function (shapes) {
      var self = this;
      shapes.forEach(function (shape) {
        switch (shape.type) {
        case 'line':
          self.shapes.push(new Line(shape));
          break;
        case 'circle':
          self.shapes.push(new Circle(shape));
          break;
        default:
          console.log('Shape not supported yet: ', shape);
        }
      });
    };
    
    TurtleWorld.prototype.addSizeHints = function (sizeHints) {
      var self = this;
      sizeHints.forEach(function (sizeHint) {
        self.sizeHints.push(new SizeHint(sizeHint));
      });
    };
    
		return TurtleWorld;
	}
}());