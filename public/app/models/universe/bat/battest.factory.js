(function() {
  'use strict';

  angular
    .module('PLMApp')
    .factory('BatTest', BatTest);

  function BatTest() {

    var BatTest = function(batTest) {
      var self = this;

      this.funName = batTest.funName;
      this.expected = batTest.expected;
      this.visible = batTest.visible;
      this.answered = batTest.answered;
      this.correct = batTest.correct;

      if(batTest instanceof BatTest) {
        this.parameters = batTest.parameters; // Already apply filter on parameters
        this.result = batTest.result;
      } else {
        this.parameters = batTest.parameters.map(function (item) {
          return self.filterParameter(item);
        });
        this.result = this.filterParameter(batTest.result);
      }
    };

    BatTest.prototype.setResult = function(result) {
      this.result = this.filterParameter(result);
      this.answered = true;
      if(angular.equals(this.result, this.expected)) {
        this.correct = true;
      }
    };

    BatTest.prototype.setExpected = function(expected) {
      this.expected = expected;
    };

    BatTest.prototype.filterParameter = function (item) {
      if(item !== null && item.hasOwnProperty('type') && item.type === 'plm.universe.cons.RecList') {
        return item.list;
      }
      if(item instanceof Array) {
        if(item[1] instanceof Array && item[1].length === 0) {
          return null;
        }
        return item[1]; // item[0] is the type of the item
      }
      return item;
    };

    BatTest.prototype.toString = function () {
      var parameter, i;
      var display = [];
      var suffix = !this.correct ? ' (expected: '+ this.expected + ')' : '';
      var rightMember = (this.answered ? this.result + suffix : this.expected);

      for(i=0; i<this.parameters.length; i += 1) {
        parameter = this.parameters[i];
        if(parameter instanceof Array) {
          display.push('[' + parameter.toString() + ']'); // Otherwise the brackets are lost with toString()
        } else {
          display.push(parameter.toString());
        }
      }
      var leftMember = this.funName + '(' + display.join(',') + ')';

      return leftMember + ' = ' + rightMember;
    };

    return BatTest;
  }
})();
