(function() {
  'use strict';

  angular
    .module('PLMApp')
    .factory('BuggleWorldCell', BuggleWorldCell);

  function BuggleWorldCell() {

    var DEFAULT_CELL_COLOR = [255, 255, 255, 255];

    var BuggleWorldCell = function(cell) {
      this.x = cell.x;
      this.y = cell.y;
      this.color = cell.color || DEFAULT_CELL_COLOR;
      this.hasBaggle = cell.hasBaggle || false;
      this.content = cell.content || "";
      this.leftWall = cell.leftWall || false;
      this.topWall = cell.topWall || false;
    };

    BuggleWorldCell.getDefaultCell = function(x, y) {
      return new BuggleWorldCell({
        'x': x,
        'y': y,
        'color': DEFAULT_CELL_COLOR,
        'hasBaggle': false,
        'content': '',
        'leftWall': false,
        'topWall': false
      });
    }

    return BuggleWorldCell;
  }
})();
