(function() {
  "use strict";

  angular
    .module('PLMApp')
    .factory('WorldView', WorldView);

  function WorldView() {

    var ctx;

    var service = {
      draw: draw,
    };

    return service;

    function draw(canvas, World) {
      ctx = canvas.getContext('2d');
    }
   }
})();
