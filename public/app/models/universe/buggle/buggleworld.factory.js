(function () {
  'use strict';

  angular
    .module('PLMApp')
    .factory('BuggleWorld', BuggleWorld);

  BuggleWorld.$inject = [
    'BuggleWorldCell', 'Buggle',
    'ChangeCellHasBaggle', 'ChangeCellColor',
    'ChangeBuggleBodyColor', 'ChangeBuggleCarryBaggle', 'MoveBuggleOperation', 'ChangeBuggleDirection',
    'ChangeCellHasContent', 'ChangeCellContent', 'BuggleEncounterWall', 'ChangeBuggleBrushDown',
    'NoBaggleUnderBuggle', 'BuggleAlreadyHaveBaggle', 'BuggleDontHaveBaggle',
    'CellAlreadyHaveBaggle', 'BuggleInOuterSpace'
  ];

  function BuggleWorld(BuggleWorldCell, Buggle,
    ChangeCellHasBaggle, ChangeCellColor,
    ChangeBuggleBodyColor, ChangeBuggleCarryBaggle, MoveBuggleOperation, ChangeBuggleDirection,
    ChangeCellHasContent, ChangeCellContent, BuggleEncounterWall, ChangeBuggleBrushDown,
    NoBaggleUnderBuggle, BuggleAlreadyHaveBaggle, BuggleDontHaveBaggle,
    CellAlreadyHaveBaggle, BuggleInOuterSpace) {

    var BuggleWorld = function (world) {
      this.type = world.type;
      this.operations = [];
      this.currentState = -1;
      this.steps = [];

      this.cells = [];
      this.entities = {};

      if (world instanceof BuggleWorld) {
        this.initFromBuggleWorld(world);
      } else {
        this.initFromJava(world);
      }
    };

    BuggleWorld.prototype.initFromJava = function (world) {
      var i, j, cell, buggle;

      this.width = world.width;
      this.height = world.height;

      this.initCells();
      for (i = 0; i < this.width; i += 1) {
        for (j = 0; j < this.height; j += 1) {
          cell = world.cells[i][j];
          this.cells[i][j] = new BuggleWorldCell(cell);
        }
      }

      for (i = 0; i < world.entities.length; i += 1) {
        buggle = world.entities[i];
        this.entities[buggle.name] = new Buggle(buggle);
      }
    };

    BuggleWorld.prototype.initFromBuggleWorld = function (world) {
      var i, j,
        col, cell,
        buggleID, buggle;

      this.width = world.width;
      this.height = world.height;

      for (i = 0; i < world.width; i += 1) {
        col = [];
        for (j = 0; j < world.height; j += 1) {
          cell = world.getCell(i, j);
          col.push(new BuggleWorldCell(cell));
        }
        this.cells.push(col);
      }

      for (buggleID in world.entities) {
        if (world.entities.hasOwnProperty(buggleID)) {
          buggle = world.entities[buggleID];
          this.entities[buggleID] = new Buggle(buggle);
        }
      }
    };

    BuggleWorld.prototype.clone = function () {
      return new BuggleWorld(this);
    };

    BuggleWorld.prototype.getEntity = function (entityID) {
      return this.entities[entityID];
    };

    BuggleWorld.prototype.initCells = function () {
      var i, j, col;

      for (i = 0; i < this.width; i += 1) {
        col = [];
        for (j = 0; j < this.height; j += 1) {
          col.push(BuggleWorldCell.getDefaultCell(i, j));
        }
        this.cells.push(col);
      }
    };

    BuggleWorld.prototype.getCell = function (x, y) {
      return this.cells[x][y];
    };

      BuggleWorld.prototype.addOperations = function (operations) {
          var i, step, length, operation, generatedOperation;

          step = [];
          length = operations.length;
          for (i = 0; i < length; i += 1) {
              operation = operations[i];
              step.push(operation);
              // generatedOperation = this.generateOperation(operation);
              // step.push(generatedOperation);
          }
          this.operations.push(step);
      };

      BuggleWorld.prototype.setState = function (state) {
          var i, j, length, step;
          if (state < this.operations.length && state >= -1) {

              console.log(this.operations);

              if (this.currentState < state) {
                  for (i = this.currentState + 1; i <= state; i += 1) {
                      // step = this.operations[i]; On veut récuperer le tableau de toutes les oppérations
                      step= this.operations;
                      length = step.length;
                      // for (j = 0; j < length; j += 1) {
                      // step[j].apply(this);
                      this.drawSVG(step[i][0]);
                      // }
                  }
              } else {
                  for (i = this.currentState; i > state; i -= 1) {
                      // step = this.operations[i];
                      step= this.operations;
                      length = step.length;
                      // for (j = 0; j < length; j += 1) {
                      // step[j].reverse(this);
                      this.drawSVG(step[i][0]);
                      // }
                  }
              }
              this.currentState = state;
          }
      };

    // BuggleWorld.prototype.generateOperation = function (operation) {
    //   switch (operation.name) {
    //   case 'moveBuggleOperation':
    //     return new MoveBuggleOperation(operation);
    //   case 'changeBuggleBodyColor':
    //     return new ChangeBuggleBodyColor(operation);
    //   case 'changeBuggleDirection':
    //     return new ChangeBuggleDirection(operation);
    //   case 'changeBuggleCarryBaggle':
    //     return new ChangeBuggleCarryBaggle(operation);
    //   case 'changeBuggleBrushDown':
    //     return new ChangeBuggleBrushDown(operation);
    //   case 'changeCellColor':
    //     return new ChangeCellColor(operation);
    //   case 'changeCellHasBaggle':
    //     return new ChangeCellHasBaggle(operation);
    //   case 'changeCellHasContent':
    //     return new ChangeCellHasContent(operation);
    //   case 'changeCellContent':
    //     return new ChangeCellContent(operation);
    //   case 'buggleEncounterWall':
    //     return new BuggleEncounterWall(operation);
    //   case 'noBaggleUnderBuggle':
    //     return new NoBaggleUnderBuggle(operation);
    //   case 'buggleAlreadyHaveBaggle':
    //     return new BuggleAlreadyHaveBaggle(operation);
    //   case 'buggleDontHaveBaggle':
    //     return new BuggleDontHaveBaggle(operation);
    //   case 'cellAlreadyHaveBaggle':
    //     return new CellAlreadyHaveBaggle(operation);
    //   case 'buggleInOuterSpace':
    //     return new BuggleInOuterSpace(operation);
    //   }
    // };
    BuggleWorld.prototype.drawSVG = function (svg) {
          (function () {

              document.getElementById('drawingArea').innerHTML = svg.operation;
              var svgbis = document.getElementsByTagName('svg');
              svgbis[0].setAttribute("width", "400px");
              svgbis[0].setAttribute("height", "400px");


          })();

      };

    return BuggleWorld;
  }
}());
