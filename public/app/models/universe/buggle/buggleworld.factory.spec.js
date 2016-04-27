(function () {
  'use strict';

  describe('BuggleWorld', function () {
    var _BuggleWorld, buggleWorld,
      type, width, height,
      operations, steps, currentState,
      entities, expectedEntities, bugglesIDs,
      cells;

    beforeEach(module('PLMApp'));

    beforeEach(inject(function(BuggleWorld) {
      _BuggleWorld = BuggleWorld;
    }));

    beforeEach(function () {
      var i, j, nbEntities,
        dataBuggleWorld,
        cell, row, buggle;

      type = getRandomString(15);
      width = getRandomInt(10) + 1;
      height = getRandomInt(10) + 1;
      operations = [];
      currentState = -1;
      steps = [];

      cells = [];
      for (i = 0; i < width; i += 1) {
        row = [];
        for (j = 0; j < height; j += 1) {
          cell = getRandomBuggleWorldCell();
          cell.x = i;
          cell.y = j;
          row.push(cell);
        }
        cells.push(row);
      }

      entities = [];
      bugglesIDs = [];
      expectedEntities = {};
      nbEntities = getRandomInt(10) + 1;
      for (i = 0; i < nbEntities; i += 1) {
        buggle = getRandomBuggle();
        buggle.name = getRandomString(15);
        bugglesIDs.push(buggle.name);
        entities.push(buggle);
        expectedEntities[buggle.name] = buggle;
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

    it('should be initialized correctly by its constructor', function() {
      var i, j, index,
        buggleID, buggle,
        cell;

      expect(buggleWorld.type).toEqual(type);
      expect(buggleWorld.width).toEqual(width);
      expect(buggleWorld.height).toEqual(height);
      expect(buggleWorld.operations).toEqual(operations);
      expect(buggleWorld.currentState).toEqual(currentState);
      expect(buggleWorld.steps).toEqual(steps);

      for (i = 0; i < width; i += 1) {
        for (j = 0; j < height; j += 1) {
          cell = buggleWorld.getCell(i, j);
          expect(cell).toEqualToBuggleWorldCell(cells[i][j]);
        }
      }

      for (buggleID in expectedEntities) {
        if (expectedEntities.hasOwnProperty(buggleID)) {
          buggle = buggleWorld.getEntity(buggleID);
          expect(buggle).toEqualToBuggle(expectedEntities[buggleID]);
        }
      }
    });

    it('clone should return a correct copy of the world', function () {
      var i, j,
        clone,
        buggleID,
        actual, expected;

      clone = buggleWorld.clone();

      expect(buggleWorld.type).toEqual(clone.type);
      expect(buggleWorld.width).toEqual(clone.width);
      expect(buggleWorld.height).toEqual(clone.height);
      expect(buggleWorld.operations).toEqual(clone.operations);
      expect(buggleWorld.currentState).toEqual(clone.currentState);
      expect(buggleWorld.steps).toEqual(clone.steps);

      for (i = 0; i < width; i += 1) {
        for (j = 0; j < height; j += 1) {
          expected = buggleWorld.getCell(i, j);
          actual = clone.getCell(i, j);
          expect(actual).toEqualToBuggleWorldCell(expected);
        }
      }

      for (buggleID in expectedEntities) {
        if (expectedEntities.hasOwnProperty(buggleID)) {
          expected = buggleWorld.getEntity(buggleID);
          actual = clone.getEntity(buggleID);
          expect(actual).toEqualToBuggle(expected);
        }
      }
    });

    it('getEntity should return the correct buggle', function () {
      var buggleID, actual, expected;
      buggleID = getRandomValueFromArray(bugglesIDs);

      actual = buggleWorld.getEntity(buggleID);
      expected = expectedEntities[buggleID];

      expect(actual).toEqualToBuggle(expected);
    });

    it('getCell should return the correct cell', function () {
      var x, y, index, actual, expected;
      x = getRandomInt(width);
      y = getRandomInt(height);

      actual = buggleWorld.getCell(x, y);
      expected = cells[x][y];

      expect(actual).toEqualToBuggleWorldCell(expected);
    });

    it('addOperations should try to generate an operation for each element of the list', function () {
      var i,
        elt, nbElt,
        generateOperationCallCount;

      nbElt = getRandomInt(50) + 1;
      operations = [];

      spyOn(buggleWorld, 'generateOperation');
      for (i = 0; i < nbElt; i += 1) {
        elt = getRandomString(3);
        operations.push(elt);
      }
      buggleWorld.addOperations(operations);
      generateOperationCallCount = buggleWorld.generateOperation.calls.count();
      expect(generateOperationCallCount).toEqual(nbElt);
      for (i = 0; i < nbElt; i += 1) {
        elt = buggleWorld.generateOperation.calls.argsFor(i)[0];
        expect(elt).toEqual(operations[i]);
      }
    });

    it('setState should call "apply" for each operations between ' +
      'currentState and objectiveState if objectiveState > currentState',
      function () {
        var i, j,
          nbSteps, nbOperations, operation, step,
          expectedApplyCallCount, actualApplyCallCount,
          currentState, objectiveState;

        nbSteps = getRandomInt(15) + 1;
        expectedApplyCallCount = 0;

        operation = {
          apply: function() {},
          reverse: function() {}
        };
        spyOn(operation, 'apply');

        // Set operations
        for (i = 0; i < nbSteps; i += 1) {
          nbOperations = getRandomInt(15) + 1;
          step = [];
          for (j = 0; j < nbOperations; j += 1) {
            step.push(operation);
          }
          operations.push(step);
        }
        buggleWorld.operations = operations;

        currentState = getRandomInt(nbSteps) - 1;
        buggleWorld.currentState = currentState;
        objectiveState = currentState + getRandomInt(nbSteps - currentState - 1) + 1;

        for (i = currentState + 1; i <= objectiveState; i += 1) {
          for (j = 0; j < operations[i].length; j++) {
            expectedApplyCallCount++;
          }
        }

        buggleWorld.setState(objectiveState);

        actualApplyCallCount = operation.apply.calls.count();
        expect(actualApplyCallCount).toEqual(expectedApplyCallCount);
      });

    it('setState should never call "reverse" if objectiveState > currentState', function () {
      var i, j,
        nbSteps, nbOperations, operation, step,
        currentState, objectiveState,
        expectedReverseCall, actualReverseCall;

      nbSteps = getRandomInt(15) + 1;
      expectedReverseCall = false;

      operation = {
        apply: function() {},
        reverse: function() {}
      };
      spyOn(operation, 'reverse');

     // Set operations
      for (i = 0; i < nbSteps; i += 1) {
        nbOperations = getRandomInt(15) + 1;
        step = [];
        for (j = 0; j < nbOperations; j += 1) {
          step.push(operation);
        }
        operations.push(step);
      }
      buggleWorld.operations = operations;

      // Generate currentState & objectiveState
      currentState = getRandomInt(nbSteps) - 1;
      buggleWorld.currentState = currentState;
      objectiveState = currentState + getRandomInt(nbSteps - currentState - 1) + 1;

      // Launch setState
      buggleWorld.setState(objectiveState);

      // Check the call count
      actualReverseCall = operation.reverse.calls.any();
      expect(actualReverseCall).toEqual(expectedReverseCall);
    });

    it('setState should call "reverse" for each operations between ' +
      'currentState and objectiveState if objectiveState > currentState',
      function () {
        var i, j,
          nbSteps, nbOperations, operation, step,
          currentState, objectiveState,
          expectedReverseCallCount, actualReverseCallCount;

        nbSteps = getRandomInt(15) + 1;
        expectedReverseCallCount = 0;

        operation = {
          apply: function() {},
          reverse: function() {}
        };
        spyOn(operation, 'reverse');

        // Set operations
        for (i = 0; i < nbSteps; i += 1) {
          nbOperations = getRandomInt(15) + 1;
          step = [];
          for (j = 0; j < nbOperations; j += 1) {
            step.push(operation);
          }
          operations.push(step);
        }
        buggleWorld.operations = operations;

        objectiveState = getRandomInt(nbSteps) - 1;
        currentState = objectiveState + getRandomInt(nbSteps - objectiveState - 1) + 1;
        buggleWorld.currentState = currentState;

        for (i = currentState; i > objectiveState; i -= 1) {
          for (j = 0; j < operations[i].length; j += 1) {
            expectedReverseCallCount++;
          }
        }

        buggleWorld.setState(objectiveState);

        actualReverseCallCount = operation.reverse.calls.count();
        expect(actualReverseCallCount).toEqual(expectedReverseCallCount);
      });

    it('setState should never call "apply" if objectiveState > currentState', function () {
      var i, j,
        nbSteps, nbOperations, operation, step,
        currentState, objectiveState,
        expectedApplyCall, actualApplyCall;

      nbSteps = getRandomInt(15) + 1;
      expectedApplyCall = false;

      operation = {
        apply: function() {},
        reverse: function() {}
      };
      spyOn(operation, 'apply');

      // Set operations
      for (i = 0; i < nbSteps; i += 1) {
        nbOperations = getRandomInt(15) + 1;
        step = [];
        for (j = 0; j < nbOperations; j += 1) {
          step.push(operation);
        }
        operations.push(step);
      }
      buggleWorld.operations = operations;

      // Generate currentState & objectiveState
      objectiveState = getRandomInt(nbSteps) - 1;
      currentState = objectiveState + getRandomInt(nbSteps - objectiveState - 1) + 1;
      buggleWorld.currentState = currentState;

      // Launch setState
      buggleWorld.setState(objectiveState);

      // Check the call count
      actualApplyCall = operation.apply.calls.any();
      expect(actualApplyCall).toEqual(expectedApplyCall);
    });

    it('setState should not call "apply" nor "reverse" if objectiveState === currentState', function () {
      var i, j,
        nbSteps, nbOperations, operation, step,
        currentState, objectiveState,
        expectedApplyCall, actualApplyCall,
        expectedReverseCall, actualReverseCall;

      nbSteps = getRandomInt(15) + 1;

      expectedApplyCall = false;
      expectedReverseCall = false;

      operation = {
        apply: function() {},
        reverse: function() {}
      };
      spyOn(operation, 'apply');
      spyOn(operation, 'reverse');

      // Set operations
      for (i = 0; i < nbSteps; i += 1) {
        nbOperations = getRandomInt(15) + 1;
        step = [];
        for (j = 0; j < nbOperations; j += 1) {
          step.push(operation);
        }
        operations.push(step);
      }
      buggleWorld.operations = operations;

      // Generate currentState & objectiveState
      currentState = getRandomInt(nbSteps) - 1;
      objectiveState = currentState;
      buggleWorld.currentState = currentState;

      // Launch setState
      buggleWorld.setState(objectiveState);

      // Check the call count
      actualApplyCall = operation.apply.calls.any();
      actualReverseCall = operation.reverse.calls.any();
      expect(actualApplyCall).toEqual(expectedApplyCall);
      expect(actualReverseCall).toEqual(expectedReverseCall);
    });
  });
})();
