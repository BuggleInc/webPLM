(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('BatWorld', BatWorld);

  BatWorld.$inject = ['$timeout', 'BatTest', 'SetResult'];

  function BatWorld($timeout, BatTest, SetResult) {

    var BatWorld = function (world) {
      this.type = world.type;
      this.operations = [];
      this.currentState = -1;

      this.initBatTests(world.batTests);
      this.updateVisibleTests();
    };

    BatWorld.prototype.clone = function () {
      return new BatWorld(this);
    };

    BatWorld.prototype.initBatTests = function (batTests) {
      this.batTests = [];
      for (var i = 0; i < batTests.length; i++) {
        this.batTests.push(new BatTest(batTests[i]));
      }
    };

		BatWorld.prototype.setBatTestResult = function (index, result, displayedResult) {
			this.batTests[index].setResult(result, displayedResult);
		}

    BatWorld.prototype.setExpected = function (answerWorld) {
      for (var i = 0; i < this.batTests.length; i++) {
        this.batTests[i].setExpected(answerWorld.batTests[i].result, answerWorld.batTests[i].displayedResult);
      }
    };

    BatWorld.prototype.updateVisibleTests = function () {
      this.visibleTests = [];
      var foundError = false;
      for (var i = 0; i < this.batTests.length; i++) {
        var test = this.batTests[i];
        if (test.visible || (test.answered && !foundError)) {
          this.visibleTests.push(test);
          if (test.answered && !test.correct) {
            foundError = true;
          }
        }
      }
    };

    BatWorld.prototype.addOperations = function (operations) {
      for (var i = 0; i < operations.length; i++) {
        var operation = operations[i];
        var generatedOperation = this.generateOperation(operation);
        console.log('generatedOperation; ', generatedOperation);
        var currentWorld = this;
        $timeout(function() {
          generatedOperation.apply(currentWorld);
          currentWorld.updateVisibleTests();
        }, 0);
        this.currentState += 1;
      }
    };

    BatWorld.prototype.generateOperation = function (operation) {
      switch (operation.type) {
        case 'setResult':
          return new SetResult(operation);
      }
    };

    BatWorld.prototype.setState = function (state) {};

    return BatWorld;
  }
})();
