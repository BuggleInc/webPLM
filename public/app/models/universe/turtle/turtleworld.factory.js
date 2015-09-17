(function () {
	'use strict';

	angular
		.module('PLMApp')
		.factory('TurtleWorld', TurtleWorld);

	TurtleWorld.$inject = ['Turtle',
                        'Line', 'Circle',
                        'SizeHint'];

	function TurtleWorld(Turtle,
                        Line, Circle,
                        SizeHint) {

		var TurtleWorld = function (world) {
			this.type = world.type;
			this.width = world.width;
			this.height = world.height;
			this.operations = [];
			this.currentState = -1;
			this.steps = [];

      this.shapes = [];
      world.shapes.forEach(this.addShape);
      this.sizeHints = [];
      world.sizeHints.forEach(this.addSizeHint);

      this.entities = {};
			for(var turtleID in world.entities) {
				if(world.entities.hasOwnProperty(turtleID)) {
					var turtle = world.entities[turtleID];
					this.entities[turtleID] = new Turtle(turtle);
				}
			}
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
      case 0:
        break;
      default:
        console.log('Operation not supported yet: ', operation);
			}
		};

    TurtleWorld.prototype.addShape = function (shape) {
      switch (shape.type) {
      case 'line':
        this.shapes.add(new Line(shape));
        break;
      case 'circle':
        this.shapes.add(new Circle(shape));
        break;
      default:
        console.log('Shape not supported yet: ', shape);
      }
    };
    
    TurtleWorld.prototype.addSizeHint = function (sizeHint) {
      this.sizeHints.add(new SizeHint(sizeHint));
    };
    
		return TurtleWorld;
	}
}());