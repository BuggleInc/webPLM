(function() {
  "use strict";

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

    BatTest.prototype.parameterToStr = function (parameter) {
      if(parameter === null) {
        return 'null';
      }
      if(parameter instanceof Array) {
        return '[' + parameter.toString() + ']';
      }
      return parameter.toString()
    }

    BatTest.prototype.toString = function () {
      var leftMember, rightMember, suffix,
        display, displayedExpected, displayedResult,
        parameter, i;

      display = [];
      displayedExpected = this.parameterToStr(this.expected);
      displayedResult = this.parameterToStr(this.result);

      suffix = !this.correct ? ' (expected: '+ displayedExpected + ')' : '';
      rightMember = (this.answered ? displayedResult + suffix : displayedExpected);

      for(i=0; i<this.parameters.length; i += 1) {
        parameter = this.parameters[i];
        display.push( this.parameterToStr(parameter) ); // Otherwise the brackets are lost with toString()
      }
      leftMember = this.funName + '(' + display.join(',') + ')';

      return leftMember + ' = ' + rightMember;
    };

    return BatTest;
  }
})();
