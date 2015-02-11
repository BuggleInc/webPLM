(function(){
	'use strict';

	describe('BuggleWorld', function() {
		var _BuggleWorld;

		var buggleWorld;
		var type;
		var width;
		var height;
		var operations;
		var currentState;
		var steps;
		var cells;
		var entities;
		var bugglesID;
		
		beforeEach(module('PLMApp'));

		beforeEach(inject(function(BuggleWorld) {
			_BuggleWorld = BuggleWorld;	
		}));

		beforeEach(function() {
			var i, j;
			var nbEntities;
			var dataBuggleWorld;

			type = getRandomString(15);
			width = getRandomInt(10) + 1;
			height = getRandomInt(10) + 1;
			operations = [];
			currentState = -1;
			steps = [];

			cells = [];
			for(i=0; i<width; i++) {
				var temp = [];
				for(j=0; j<height; j++) {
					var cell = getRandomBuggleWorldCell();
					temp.push(cell);
				}
				cells.push(temp);
			}

			entities = {};
			bugglesID = [];
			nbEntities = getRandomInt(10) + 1;
			for(i=0; i<nbEntities; i++) {
				var buggleID = getRandomString(15);
				bugglesID.push(buggleID);
				entities[buggleID] = getRandomBuggle();
			}

			dataBuggleWorld = {
				type: type,
				width: width,
				height: height,
				cells: cells,
				entities: entities
			};
			buggleWorld = new _BuggleWorld(dataBuggleWorld);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(buggleWorld.type).toEqual(type);
			expect(buggleWorld.width).toEqual(width);
			expect(buggleWorld.height).toEqual(height);
			expect(buggleWorld.operations).toEqual(operations);
			expect(buggleWorld.currentState).toEqual(currentState);
			expect(buggleWorld.steps).toEqual(steps);

			for(var i=0; i<width; i++) {
				for(var j=0; j<height; j++) {
					var cell = buggleWorld.getCell(i, j);
					expect(cell).toEqualToBuggleWorldCell(cells[i][j]);
				}
			}

			for(var buggleID in entities) {
				if(entities.hasOwnProperty(buggleID)) {
					var buggle = buggleWorld.getEntity(buggleID);
					expect(buggle).toEqualToBuggle(entities[buggleID]);
				}	
			}
		});

		it('clone should return a correct copy of the world', function () {
			var other;
			var clone = buggleWorld.clone();

			expect(buggleWorld.type).toEqual(clone.type);
			expect(buggleWorld.width).toEqual(clone.width);
			expect(buggleWorld.height).toEqual(clone.height);
			expect(buggleWorld.operations).toEqual(clone.operations);
			expect(buggleWorld.currentState).toEqual(clone.currentState);
			expect(buggleWorld.steps).toEqual(clone.steps);

			for(var i=0; i<width; i++) {
				for(var j=0; j<height; j++) {
					var cell = buggleWorld.getCell(i, j);
					other = clone.getCell(i, j);
					expect(cell).toEqualToBuggleWorldCell(other);
				}
			}

			for(var buggleID in entities) {
				if(entities.hasOwnProperty(buggleID)) {
					var buggle = buggleWorld.getEntity(buggleID);
					other = clone.getEntity(buggleID);
					expect(buggle).toEqualToBuggle(other);
				}
			}
		});

		it('getEntity should return the correct buggle', function () {
			var buggleID = getRandomValueFromArray(bugglesID);
			var buggle = buggleWorld.getEntity(buggleID);
			expect(buggle).toEqualToBuggle(entities[buggleID]);
		});

		it('getCell should return the correct cell', function () {
			var x = getRandomInt(width);
			var y = getRandomInt(height);
			var cell = buggleWorld.getCell(x, y);
			expect(cell).toEqualToBuggleWorldCell(cells[x][y]);
		});

		it('addOperations should try to generate an operation for each element of the list', function () {
			var i;
			var elt;
			var nbElt = getRandomInt(50) + 1;
			var operations = [];
			var generateOperationCallCount;

			spyOn(buggleWorld, 'generateOperation');
			for(i=0; i<nbElt; i++) {
				elt = getRandomString(3);
				operations.push(elt);
			}
			buggleWorld.addOperations(operations);
			generateOperationCallCount = buggleWorld.generateOperation.calls.count();
			expect(generateOperationCallCount).toEqual(nbElt);
			for(i=0; i<nbElt; i++) {
				elt = buggleWorld.generateOperation.calls.argsFor(i)[0];
				expect(elt).toEqual(operations[i]);
			}
		});

		it('setState should call "apply" for each operations between ' +
			'currentState and objectiveState if objectiveState > currentState', function () {
			var nbSteps = getRandomInt(15)+1;
			var nbOperations;
			var i, j;

			var expectedApplyCallCount = 0;

			var operation = { 
				apply: function () {},
				reverse: function () {} 
			};
			spyOn(operation, 'apply');

			var operations = [];
			var step;

			// Set operations
			for(i=0; i<nbSteps; i++) {
				nbOperations = getRandomInt(15) + 1;
				step = [];
				for(j=0; j<nbOperations; j++) {
					step.push(operation);
				}
				operations.push(step);
			}
			buggleWorld.operations = operations;

			var currentState = getRandomInt(nbSteps) - 1;
			buggleWorld.currentState = currentState;
			var objectiveState = currentState + getRandomInt(nbSteps-currentState-1) + 1;

			for(i=currentState+1; i<=objectiveState; i++) {
				for(j=0; j<operations[i].length; j++) {
					expectedApplyCallCount++;
				}
			}

			buggleWorld.setState(objectiveState);

			var actualApplyCallCount = operation.apply.calls.count();
			expect(actualApplyCallCount).toEqual(expectedApplyCallCount);
		});

		it('setState should never call "reverse" if objectiveState > currentState', function () {
			var nbSteps = getRandomInt(15)+1;
			var nbOperations;
			var i, j;

			var expectedReverseCall = false;

			var operation = { 
				apply: function () {},
				reverse: function () {} 
			};
			spyOn(operation, 'reverse');

			var operations = [];
			var step;

			// Set operations
			for(i=0; i<nbSteps; i++) {
				nbOperations = getRandomInt(15) + 1;
				step = [];
				for(j=0; j<nbOperations; j++) {
					step.push(operation);
				}
				operations.push(step);
			}
			buggleWorld.operations = operations;

			// Generate currentState & objectiveState
			var currentState = getRandomInt(nbSteps) - 1;
			buggleWorld.currentState = currentState;
			var objectiveState = currentState + getRandomInt(nbSteps-currentState-1) + 1;

			// Launch setState
			buggleWorld.setState(objectiveState);

			// Check the call count
			var actualReverseCall = operation.reverse.calls.any();
			expect(actualReverseCall).toEqual(expectedReverseCall);
		});

		it('setState should call "reverse" for each operations between ' +
			'currentState and objectiveState if objectiveState > currentState', function () {
			var nbSteps = getRandomInt(15)+1;
			var nbOperations;
			var i, j;

			var expectedReverseCallCount = 0;

			var operation = { 
				apply: function () {},
				reverse: function () {} 
			};
			spyOn(operation, 'reverse');

			var operations = [];
			var step;

			// Set operations
			for(i=0; i<nbSteps; i++) {
				nbOperations = getRandomInt(15) + 1;
				step = [];
				for(j=0; j<nbOperations; j++) {
					step.push(operation);
				}
				operations.push(step);
			}
			buggleWorld.operations = operations;

			var objectiveState = getRandomInt(nbSteps) - 1;
			var currentState = objectiveState + getRandomInt(nbSteps-objectiveState-1) + 1;
			buggleWorld.currentState = currentState;

			for(i=currentState; i>objectiveState; i--) {
				for(j=0; j<operations[i].length; j++) {
					expectedReverseCallCount++;
				}
			}

			buggleWorld.setState(objectiveState);

			var actualReverseCallCount = operation.reverse.calls.count();
			expect(actualReverseCallCount).toEqual(expectedReverseCallCount);
		});

		it('setState should never call "apply" if objectiveState > currentState', function () {
			var nbSteps = getRandomInt(15)+1;
			var nbOperations;
			var i, j;

			var expectedApplyCall = false;

			var operation = { 
				apply: function () {},
				reverse: function () {} 
			};
			spyOn(operation, 'apply');

			var operations = [];
			var step;

			// Set operations
			for(i=0; i<nbSteps; i++) {
				nbOperations = getRandomInt(15) + 1;
				step = [];
				for(j=0; j<nbOperations; j++) {
					step.push(operation);
				}
				operations.push(step);
			}
			buggleWorld.operations = operations;

			// Generate currentState & objectiveState
			var objectiveState = getRandomInt(nbSteps) - 1;
			var currentState = objectiveState + getRandomInt(nbSteps-objectiveState-1) + 1;
			buggleWorld.currentState = currentState;

			// Launch setState
			buggleWorld.setState(objectiveState);

			// Check the call count
			var actualApplyCall = operation.apply.calls.any();
			expect(actualApplyCall).toEqual(expectedApplyCall);
		});

		it('setState should not call "apply" nor "reverse" if objectiveState === currentState', function () {
			var nbSteps = getRandomInt(15)+1;
			var nbOperations;
			var i, j;

			var expectedApplyCall = false;
			var expectedReverseCall = false;

			var operation = { 
				apply: function () {},
				reverse: function () {} 
			};
			spyOn(operation, 'apply');
			spyOn(operation, 'reverse');

			var operations = [];
			var step;

			// Set operations
			for(i=0; i<nbSteps; i++) {
				nbOperations = getRandomInt(15) + 1;
				step = [];
				for(j=0; j<nbOperations; j++) {
					step.push(operation);
				}
				operations.push(step);
			}
			buggleWorld.operations = operations;

			// Generate currentState & objectiveState
			var currentState = getRandomInt(nbSteps) - 1;
			var objectiveState = currentState;
			buggleWorld.currentState = currentState;

			// Launch setState
			buggleWorld.setState(objectiveState);

			// Check the call count
			var actualApplyCall = operation.apply.calls.any();
			var actualReverseCall = operation.reverse.calls.any();
			expect(actualApplyCall).toEqual(expectedApplyCall);
			expect(actualReverseCall).toEqual(expectedReverseCall);
		});
	});
})();