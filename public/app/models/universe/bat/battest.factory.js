(function() {
  'use strict';

  angular
    .module('PLMApp')
    .factory('BatTest', BatTest);

  function BatTest() {

    var BatTest = function(batTest) {
      this.name = batTest.name;
      this.answered = batTest.answered;
      this.result = batTest.result;
      this.displayedResult = batTest.displayedResult;
      this.expected = batTest.expected;
      this.displayedExpected = batTest.displayedExpected;
      this.visible = batTest.visible;
      this.correct = batTest.correct;
    };

    BatTest.prototype.setResult = function(result, displayedResult) {
      this.result = result;
      this.displayedResult = displayedResult;
      this.answered = true;
      if(this.result == this.expected) {
        this.correct = true;
      }
    };

    BatTest.prototype.setExpected = function(expected, displayedExpected) {
      this.expected = expected;
      this.displayedExpected = displayedExpected;
    };

    BatTest.prototype.toString = function () {
      var suffix = !this.correct ? ' (expected: '+ this.displayedExpected + ')' : '';
      return this.name + ' = ' + (this.answered ? this.displayedResult + suffix : this.displayedExpected)
    };

    return BatTest;
  }
})();
