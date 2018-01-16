(function() {
  "use strict";

  angular
    .module('PLMApp')
    .factory('SetResult', SetResult);

  function SetResult() {

    var SetResult = function(data) {
      this.index = data.index;
      this.result = data.result;
    };

    SetResult.prototype.apply = function(currentWorld) {
      currentWorld.setBatTestResult(this.index, this.result);
    };

    SetResult.prototype.reverse = function(currentWorld) {};

    return SetResult;
  }
})();
