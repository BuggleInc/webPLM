(function () {
  'use strict';

  describe('BuggleWorld', function () {
    var _BuggleWorld, buggleWorld,
      type, width, height,
      operations, steps, currentState;

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

      dataBuggleWorld = {
        type: type,
        width: width,
        height: height,
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

  });
})();
