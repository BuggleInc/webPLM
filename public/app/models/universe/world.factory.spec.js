(function () {
  "use strict";

  describe("World", function () {
    var _World, World,
      type, width, height,
      operations, steps, currentState;

    beforeEach(module("PLMApp"));

    beforeEach(inject(function(World) {
      _World = World;
    }));

    beforeEach(function () {
      var dataWorld;

      type = getRandomString(15);
      width = getRandomInt(10) + 1;
      height = getRandomInt(10) + 1;
      operations = [];
      currentState = -1;
      steps = [];

      dataWorld = {
        type: type,
        width: width,
        height: height,
      };

      World = new _World(dataWorld);
    });

    it("should be initialized correctly by its constructor", function() {
      var i, j, index,
        buggleID, buggle,
        cell;

      expect(World.type).toEqual(type);
      expect(World.width).toEqual(width);
      expect(World.height).toEqual(height);
      expect(World.operations).toEqual(operations);
      expect(World.currentState).toEqual(currentState);
      expect(World.steps).toEqual(steps);
    });

    it("clone should return a correct copy of the world", function () {
      var i, j,
        clone,
        buggleID,
        actual, expected;

      clone = World.clone();

      expect(World.type).toEqual(clone.type);
      expect(World.width).toEqual(clone.width);
      expect(World.height).toEqual(clone.height);
      expect(World.operations).toEqual(clone.operations);
      expect(World.currentState).toEqual(clone.currentState);
      expect(World.steps).toEqual(clone.steps);

    });

    it("addOperations should try to generate an operation for each element of the list", function () {
      var i,
        elt, nbElt,
        generateOperationCallCount;

      nbElt = getRandomInt(50) + 1;
      operations = [];

      spyOn(World, "generateOperation");
      for (i = 0; i < nbElt; i += 1) {
        elt = getRandomString(3);
        operations.push(elt);
      }
      World.addOperations(operations);
      generateOperationCallCount = World.generateOperation.calls.count();
      expect(generateOperationCallCount).toEqual(nbElt);
      for (i = 0; i < nbElt; i += 1) {
        elt = World.generateOperation.calls.argsFor(i)[0];
        expect(elt).toEqual(operations[i]);
      }
    });

  });
})();
