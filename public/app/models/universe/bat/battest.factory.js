(function() {
  'use strict';

  angular
    .module('PLMApp')
    .factory('BatTest', BatTest);

  function BatTest() {

    var BatTest = function(batTest) {
      this.funName = batTest.funName;
      this.parameters = batTest.parameters;
      this.result = batTest.result;
      this.expected = batTest.expected;
      this.visible = batTest.visible;
      this.answered = batTest.answered;
      this.correct = batTest.correct;
    };

    BatTest.prototype.setResult = function(result) {
      this.result = result;
      this.answered = true;
      if(this.result == this.expected) {
        this.correct = true;
      }
    };

    BatTest.prototype.setExpected = function(expected) {
      this.expected = expected;
    };

    BatTest.prototype.toString = function () {
      var suffix = !this.correct ? ' (expected: '+ this.expected + ')' : '';
      var rightMember = (this.answered ? this.result + suffix : this.expected);
      var leftMember = this.funName + '(' + this.parameters.join(',') + ')';

      return leftMember + ' = ' + rightMember;
    };

    return BatTest;
  }
})();
