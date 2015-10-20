(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('BuggleWorldView', BuggleWorldView);

  BuggleWorldView.$inject = ['DefaultColors'];

  function BuggleWorldView(DefaultColors) {

    var ctx;
    var canvasWidth;
    var canvasHeight;

    var cellWidth;
    var cellHeight;

    var INVADER_SPRITE_SIZE = 11;
    var INVADER_SPRITE = [
   [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ],
   [
       [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0],
    [0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0]
   ],
   [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ],
   [
    [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0],
    [0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0]
   ]
  ];

    var service = {
      draw: draw,
    };

    return service;

    function initUtils(canvas, buggleWorld) {
      ctx = canvas.getContext('2d');
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;

      cellWidth = canvasWidth / buggleWorld.width;
      cellHeight = canvasHeight / buggleWorld.height;
      if (cellHeight < cellWidth) {
        cellWidth = cellHeight;
      } else {
        cellHeight = cellWidth;
      }
      canvas.width = cellWidth * buggleWorld.width;
      canvas.height = cellHeight * buggleWorld.height;
    }

    function draw(canvas, buggleWorld) {
      var i, j;
      var buggleID;

      initUtils(canvas, buggleWorld);

      for (i = 0; i < buggleWorld.width; i++) {
        for (j = 0; j < buggleWorld.height; j++) {
          drawCell(buggleWorld.cells[i][j]);
        }
      }

      drawGrid(buggleWorld);
      drawFrontierWalls(buggleWorld);

      for (buggleID in buggleWorld.entities) {
        if (buggleWorld.entities.hasOwnProperty(buggleID)) {
          var buggle = buggleWorld.entities[buggleID];
          var cell = buggleWorld.cells[buggle.x][buggle.y]
          drawBuggle(buggle, cell);
        }
      }
    }

    function drawCell(cell) {
      var xLeft = cellWidth * cell.x;
      var yTop = cellHeight * cell.y;

      var padX = cellWidth / 2;
      var padY = cellHeight / 2;

      var xRight = cellWidth * (cell.x + 1);
      var yBottom = cellHeight * (cell.y + 1);

      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'SteelBlue';
      ctx.fillStyle = 'rgba(' + cell.color.join(',') + ')';
      if (cell.color[0] === 255 && cell.color[1] === 255 && cell.color[2] === 255 && cell.color[3] === 255) {
        if ((cell.x + cell.y) % 2 === 0) {
          ctx.fillStyle = 'rgb(230, 230, 230)';
        } else {
          ctx.fillStyle = 'rgb(255, 255, 255)';
        }
      }
      ctx.fillRect(xLeft, yTop, xRight, yBottom);

      if (cell.hasLeftWall) {
        ctx.moveTo(xLeft, yTop);
        ctx.lineTo(xLeft, yBottom);
      }
      if (cell.hasTopWall) {
        ctx.moveTo(xLeft, yTop);
        ctx.lineTo(xRight, yTop);
      }

      ctx.stroke();
      ctx.closePath();

      if (cell.hasBaggle) {
        ctx.beginPath();
        ctx.fillStyle = DefaultColors.BAGGLE;
        ctx.arc(xLeft + padX, yTop + padY, cellWidth * 0.25, 0, Math.PI * 2, true);
        ctx.arc(xLeft + padX, yTop + padY, cellWidth * 0.15, 0, Math.PI * 2, true);
        ctx.fill('evenodd');
        ctx.closePath();
      }
      if (cell.hasContent) {
        ctx.beginPath();
        ctx.fillStyle = DefaultColors.MESSAGE_COLOR;
        ctx.fillText(cell.content, xLeft + 1, yBottom - 4);
        ctx.closePath();
      }
    }

    function drawGrid(buggleWorld) {
      var i, j;

      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'grey';
      for (i = 0; i <= buggleWorld.width; i++) {
        ctx.moveTo(i * cellWidth, 0);
        ctx.lineTo(i * cellWidth, canvasHeight);
      }
      for (j = 0; j <= buggleWorld.height; j++) {
        ctx.moveTo(0, j * cellHeight);
        ctx.lineTo(canvasWidth, j * cellHeight);
      }
      ctx.stroke();
      ctx.closePath();
    }

    function drawFrontierWalls(buggleWorld) {
      var x, y;

      var xLeft;
      var xRight;
      var yTop;
      var yBottom;

      ctx.beginPath();

      ctx.lineWidth = 4;
      ctx.strokeStyle = 'SteelBlue';

      // frontier walls (since the world is a torus)
      for (y = 0; y < buggleWorld.height; y++) {
        if (buggleWorld.cells[0][y].hasLeftWall) {
          xLeft = canvasWidth;
          yTop = cellHeight * y;
          yBottom = cellHeight * (y + 1);
          ctx.moveTo(xLeft, yTop);
          ctx.lineTo(xLeft, yBottom);
        }
      }

      for (x = 0; x < buggleWorld.width; x++) {
        if (buggleWorld.cells[x][0].hasTopWall) {
          xLeft = cellWidth * x;
          xRight = cellWidth * (x + 1);
          yTop = canvasHeight;
          ctx.moveTo(xLeft, yTop);
          ctx.lineTo(xRight, yTop);
        }
      }

      ctx.stroke();
      ctx.closePath();
    }

    function drawBuggle(buggle, cell) {
      var dx, dy;

      var scaleFactor = 0.6;
      var pixW = scaleFactor * cellWidth / INVADER_SPRITE_SIZE;
      var pixY = scaleFactor * cellHeight / INVADER_SPRITE_SIZE;
      var padX = 0.5 * (1 - scaleFactor) * cellWidth;
      var padY = 0.5 * (1 - scaleFactor) * cellHeight;

      var ox = buggle.x * cellWidth;
      var oy = buggle.y * cellHeight;

      ctx.beginPath();
      ctx.fillStyle = getBuggleBodyColor(buggle, cell);

      for (dy = 0; dy < INVADER_SPRITE_SIZE; dy++) {
        for (dx = 0; dx < INVADER_SPRITE_SIZE; dx++) {
          if (INVADER_SPRITE[buggle.direction][dy][dx] === 1) {
            ctx.fillRect(padX + ox + dx * pixW, padY + oy + dy * pixY, pixW, pixY);
          }
        }
      }
      ctx.closePath();
    }

    function getBuggleBodyColor(buggle, cell) {
      var res = buggle.color;
      if (angular.equals(buggle.color, cell.color)) {
        if (angular.equals(buggle.color, [0, 0, 0, 255])) {
          res = [255, 255, 255, 255]
        } else {
          res = [0, 0, 0, 255];
        }
      }
      return 'rgba(' + res.join(',') + ')';
    }
  }
})();