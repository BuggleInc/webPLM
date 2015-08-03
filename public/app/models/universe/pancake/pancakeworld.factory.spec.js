(function(){
	'use strict';

	describe('PancakeWorld', function() {
		var _PancakeWorld;

		var pancakeWorld;
		var type;
		var operations;
		var currentState;
		var pancakeStack;
		var moveCount;
        var numberFlip;
        var burnedWorld;
        
		beforeEach(module('PLMApp'));

		beforeEach(inject(function(PancakeWorld) {
			_PancakeWorld = PancakeWorld;	
		}));

		beforeEach(function() {
			var i;
			var nbPancake;
			var dataPancakeWorld;

			type = getRandomString(15);
			operations = [];
			currentState = -1;
            moveCount = getRandomInt(42);
            numberFlip = getRandomInt(100);
            if(getRandomInt(2)==0){
                burnedWorld = false;
            }
            else
            {
                burnedWorld = true;
            }

			pancakeStack = [];
            nbPancake = getRandomInt(100) + 2;
            for(i = 0; i < nbPancake; i++) {
                pancakeStack.push(getRandomInt(3));
            }

			dataPancakeWorld = {
				type: type,
                pancakeStack: pancakeStack,
                moveCount: moveCount,
                numberFlip: numberFlip,
                burnedWorld: burnedWorld
			};
			pancakeWorld = new _PancakeWorld(dataPancakeWorld);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(pancakeWorld.type).toEqual(type);
			expect(pancakeWorld.operations).toEqual(operations);
			expect(pancakeWorld.currentState).toEqual(currentState);
            for(var i=0; i<this.nbPancake; i++) {
				expect(pancakeWorld.pancakeStack[i]).toEqual(pancakeStack[i]);
			}
            expect(pancakeWorld.moveCount).toEqual(moveCount);
            expect(pancakeWorld.numberFlip).toEqual(numberFlip);
            expect(pancakeWorld.burnedWorld).toEqual(burnedWorld);
		});

		it('clone should return a correct copy of the world', function () {
			var clone = pancakeWorld.clone();

			expect(pancakeWorld.type).toEqual(clone.type);
			expect(pancakeWorld.operations).toEqual(clone.operations);
			expect(pancakeWorld.currentState).toEqual(clone.currentState);
            for(var i=0; i<this.nbPancake; i++) {
				expect(pancakeWorld.pancakeStack[i]).toEqual(clone.pancakeStack[i]);
			}
            expect(pancakeWorld.moveCount).toEqual(clone.moveCount);
            expect(pancakeWorld.numberFlip).toEqual(clone.numberFlip);
            expect(pancakeWorld.burnedWorld).toEqual(clone.burnedWorld);
		});

		it('addOperations should try to generate an operation for each element of the list', function () {
			var i;
			var elt;
			var nbElt = getRandomInt(50) + 1;
			var operations = [];
			var generatedOperationCallCount;

			spyOn(pancakeWorld, 'generatedOperation');
			for(i=0; i<nbElt; i++) {
				elt = getRandomString(3);
				operations.push(elt);
			}
			pancakeWorld.addOperations(operations);
			generatedOperationCallCount = pancakeWorld.generatedOperation.calls.count();
			expect(generatedOperationCallCount).toEqual(nbElt);
			for(i=0; i<nbElt; i++) {
				elt = pancakeWorld.generatedOperation.calls.argsFor(i)[0];
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
			pancakeWorld.operations = operations;

			var currentState = getRandomInt(nbSteps) - 1;
			pancakeWorld.currentState = currentState;
			var objectiveState = currentState + getRandomInt(nbSteps-currentState-1) + 1;

			for(i=currentState+1; i<=objectiveState; i++) {
				for(j=0; j<operations[i].length; j++) {
					expectedApplyCallCount++;
				}
			}

			pancakeWorld.setState(objectiveState);

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
			pancakeWorld.operations = operations;

			// Generate currentState & objectiveState
			var currentState = getRandomInt(nbSteps) - 1;
			pancakeWorld.currentState = currentState;
			var objectiveState = currentState + getRandomInt(nbSteps-currentState-1) + 1;

			// Launch setState
			pancakeWorld.setState(objectiveState);

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
			pancakeWorld.operations = operations;

			var objectiveState = getRandomInt(nbSteps) - 1;
			var currentState = objectiveState + getRandomInt(nbSteps-objectiveState-1) + 1;
			pancakeWorld.currentState = currentState;

			for(i=currentState; i>objectiveState; i--) {
				for(j=0; j<operations[i].length; j++) {
					expectedReverseCallCount++;
				}
			}

			pancakeWorld.setState(objectiveState);

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
			pancakeWorld.operations = operations;

			// Generate currentState & objectiveState
			var objectiveState = getRandomInt(nbSteps) - 1;
			var currentState = objectiveState + getRandomInt(nbSteps-objectiveState-1) + 1;
			pancakeWorld.currentState = currentState;

			// Launch setState
			pancakeWorld.setState(objectiveState);

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
			pancakeWorld.operations = operations;

			// Generate currentState & objectiveState
			var currentState = getRandomInt(nbSteps) - 1;
			var objectiveState = currentState;
			pancakeWorld.currentState = currentState;

			// Launch setState
			pancakeWorld.setState(objectiveState);

			// Check the call count
			var actualApplyCall = operation.apply.calls.any();
			var actualReverseCall = operation.reverse.calls.any();
			expect(actualApplyCall).toEqual(expectedApplyCall);
			expect(actualReverseCall).toEqual(expectedReverseCall);
		});
	});
})();