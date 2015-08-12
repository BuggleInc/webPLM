(function(){
	'use strict';

	describe('DutchFlagWorld', function() {
		var _DutchFlagWorld;

		var dutchFlagWorld;
		var type;
		var operations;
		var currentState;
		var content;
		var moveCount;
        
		beforeEach(module('PLMApp'));

		beforeEach(inject(function(DutchFlagWorld) {
			_DutchFlagWorld = DutchFlagWorld;	
		}));

		beforeEach(function() {
			var i;
			var nbContent;
			var dataDutchFlagWorld;

			type = getRandomString(15);
			operations = [];
			currentState = -1;
            moveCount = getRandomInt(42);

			content = [];
            nbContent = getRandomInt(100) + 2;
            for(i = 0; i < nbContent; i++) {
                content.push(getRandomInt(3));
            }

			dataDutchFlagWorld = {
				type: type,
                content: content,
                moveCount: moveCount
			};
			dutchFlagWorld = new _DutchFlagWorld(dataDutchFlagWorld);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(dutchFlagWorld.type).toEqual(type);
			expect(dutchFlagWorld.operations).toEqual(operations);
			expect(dutchFlagWorld.currentState).toEqual(currentState);
            for(var i=0; i<this.nbContent; i++) {
				expect(dutchFlagWorld.content[i]).toEqual(content[i]);
                expect(dutchFlagWorld.initValues[i]).toEqual(content[i]);
                expect(dutchFlagWorld.memory[0][i]).toEqual(content[i]);
			}
            expect(dutchFlagWorld.moveCount).toEqual(moveCount);
		});

		it('clone should return a correct copy of the world', function () {
			var clone = dutchFlagWorld.clone();

			expect(dutchFlagWorld.type).toEqual(clone.type);
			expect(dutchFlagWorld.operations).toEqual(clone.operations);
			expect(dutchFlagWorld.currentState).toEqual(clone.currentState);
            for(var i=0; i<this.nbContent; i++) {
				expect(dutchFlagWorld.content[i]).toEqual(clone.content[i]);
                expect(dutchFlagWorld.initValues[i]).toEqual(clone.initialValues[i]);
                expect(dutchFlagWorld.memory[0][i]).toEqual(clone.memory[0][i]);
			}
            expect(dutchFlagWorld.moveCount).toEqual(moveCount);
		});

		it('addOperations should try to generate an operation for each element of the list', function () {
			var i;
			var elt;
			var nbElt = getRandomInt(50) + 1;
			var operations = [];
			var generatedOperationCallCount;

			spyOn(dutchFlagWorld, 'generatedOperation');
			for(i=0; i<nbElt; i++) {
				elt = getRandomString(3);
				operations.push(elt);
			}
			dutchFlagWorld.addOperations(operations);
			generatedOperationCallCount = dutchFlagWorld.generatedOperation.calls.count();
			expect(generatedOperationCallCount).toEqual(nbElt);
			for(i=0; i<nbElt; i++) {
				elt = dutchFlagWorld.generatedOperation.calls.argsFor(i)[0];
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
			dutchFlagWorld.operations = operations;

			var currentState = getRandomInt(nbSteps) - 1;
			dutchFlagWorld.currentState = currentState;
			var objectiveState = currentState + getRandomInt(nbSteps-currentState-1) + 1;

			for(i=currentState+1; i<=objectiveState; i++) {
				for(j=0; j<operations[i].length; j++) {
					expectedApplyCallCount++;
				}
			}

			dutchFlagWorld.setState(objectiveState);

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
			dutchFlagWorld.operations = operations;

			// Generate currentState & objectiveState
			var currentState = getRandomInt(nbSteps) - 1;
			dutchFlagWorld.currentState = currentState;
			var objectiveState = currentState + getRandomInt(nbSteps-currentState-1) + 1;

			// Launch setState
			dutchFlagWorld.setState(objectiveState);

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
			dutchFlagWorld.operations = operations;

			var objectiveState = getRandomInt(nbSteps) - 1;
			var currentState = objectiveState + getRandomInt(nbSteps-objectiveState-1) + 1;
			dutchFlagWorld.currentState = currentState;

			for(i=currentState; i>objectiveState; i--) {
				for(j=0; j<operations[i].length; j++) {
					expectedReverseCallCount++;
				}
			}

			dutchFlagWorld.setState(objectiveState);

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
			dutchFlagWorld.operations = operations;

			// Generate currentState & objectiveState
			var objectiveState = getRandomInt(nbSteps) - 1;
			var currentState = objectiveState + getRandomInt(nbSteps-objectiveState-1) + 1;
			dutchFlagWorld.currentState = currentState;

			// Launch setState
			dutchFlagWorld.setState(objectiveState);

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
			dutchFlagWorld.operations = operations;

			// Generate currentState & objectiveState
			var currentState = getRandomInt(nbSteps) - 1;
			var objectiveState = currentState;
			dutchFlagWorld.currentState = currentState;

			// Launch setState
			dutchFlagWorld.setState(objectiveState);

			// Check the call count
			var actualApplyCall = operation.apply.calls.any();
			var actualReverseCall = operation.reverse.calls.any();
			expect(actualApplyCall).toEqual(expectedApplyCall);
			expect(actualReverseCall).toEqual(expectedReverseCall);
		});
	});
})();