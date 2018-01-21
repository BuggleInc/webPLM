(function() {
  "use strict";

  angular
    .module('PLMApp')
    .factory('BuggleWorldView', BuggleWorldView);

  function BuggleWorldView() {

    var ctx;

    var service = {
      draw: draw,
    };

    return service;

    function draw(canvas, buggleWorld) {
      ctx = canvas.getContext('2d');
    }
   }
})();
