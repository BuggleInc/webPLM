(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BuggleWorld', BuggleWorld);
	
	BuggleWorld.$inject = [
		'BuggleWorldCell', 'Buggle', 'BuggleWorldView',
		'ChangeCellHasBaggle', 'ChangeCellColor', 
		'ChangeBuggleCarryBaggle', 'MoveBuggleOperation', 'ChangeBuggleDirection',
		'ChangeCellHasContent', 'ChangeCellContent', 'BuggleEncounterWall', 'ChangeBuggleBrushDown',
		'NoBaggleUnderBuggle', 'BuggleAlreadyHaveBaggle', 'BuggleDontHaveBaggle', 
		'CellAlreadyHaveBaggle', 'BuggleInOuterSpace'
	];
	
	function BuggleWorld (BuggleWorldCell, Buggle, BuggleWorldView,
			ChangeCellHasBaggle, ChangeCellColor,
			ChangeBuggleCarryBaggle, MoveBuggleOperation, ChangeBuggleDirection,
			ChangeCellHasContent, ChangeCellContent, BuggleEncounterWall, ChangeBuggleBrushDown,
			NoBaggleUnderBuggle, BuggleAlreadyHaveBaggle, BuggleDontHaveBaggle, 
			CellAlreadyHaveBaggle, BuggleInOuterSpace) {
		
		var BuggleWorld = function (world) {

            world = typeof world !== 'undefined' ? world : this.newEmptyWorld();
            
			this.type = world.type;
			this.width = world.width;
			this.height = world.height;
			this.operations = [];
			this.currentState = -1;
			this.steps = [];
            this.selectedCell = null;

			this.cells = [];
			for(var i=0; i<world.width; i++) {
				this.cells[i] = [];
				for(var j=0; j<world.height; j++) {
					var cell = world.cells[i][j];
					this.cells[i][j] = new BuggleWorldCell(cell);
				}
			}
			
			this.entities = {};
			for(var buggleID in world.entities) {
				if(world.entities.hasOwnProperty(buggleID)) {
					var buggle = world.entities[buggleID];
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

		BuggleWorld.prototype.getCell = function (x, y) {
			return this.cells[x][y];
		};

		BuggleWorld.prototype.draw = function (ctx, canvasWidth, canvasHeight) {
			var i, j;
			var buggleID;

			for(i=0; i<this.width; i++) {
				for(j=0; j<this.height; j++) {
					this.cells[i][j].draw(ctx, canvasWidth, canvasHeight, this.width, this.height);
				}
			}
			
			this.drawGrid(ctx, canvasWidth, canvasHeight);
			this.drawFrontierWalls(ctx, canvasWidth, canvasHeight);

			for(buggleID in this.entities) {
				if(this.entities.hasOwnProperty(buggleID)) {
					this.entities[buggleID].draw(ctx, canvasWidth, canvasHeight, this.width, this.height);
				}
			}
		};
		
		BuggleWorld.prototype.addOperations = function (operations) {
			var step = [];
			for(var i=0; i<operations.length; i++) {
				var operation = operations[i];
				var generatedOperation = this.generateOperation(operation);
				step.push(generatedOperation);
			}
			this.operations.push(step);
		};

		BuggleWorld.prototype.setState = function (state) {
			var i;
			var j;
			var step;
			if(state < this.operations.length && state >= -1) {
				if(this.currentState < state) {
					for(i=this.currentState+1; i<=state; i++) {
						step = this.operations[i];
						for(j=0; j<step.length; j++) {
							step[j].apply(this);
						}
					}
				}
				else {
					for(i=this.currentState; i>state; i--) {
						step = this.operations[i];
						for(j=0; j<step.length; j++) {
							step[j].reverse(this);
						}
					}
				}
				this.currentState = state;
			}
		};
		
		BuggleWorld.prototype.generateOperation = function (operation) {
			switch(operation.type) {
				case 'moveBuggleOperation':
					return new MoveBuggleOperation(operation);
				case 'changeBuggleDirection':
					return new ChangeBuggleDirection(operation);
				case 'changeBuggleCarryBaggle':
					return new ChangeBuggleCarryBaggle(operation);
				case 'changeBuggleBrushDown':
					return new ChangeBuggleBrushDown(operation);
				case 'changeCellColor': 
					return new ChangeCellColor(operation);
				case 'changeCellHasBaggle': 
					return new ChangeCellHasBaggle(operation);
				case 'changeCellHasContent': 
					return new ChangeCellHasContent(operation);
				case 'changeCellContent': 
					return new ChangeCellContent(operation);
				case 'buggleEncounterWall':
					return new BuggleEncounterWall(operation);
				case 'noBaggleUnderBuggle':
					return new NoBaggleUnderBuggle(operation);
				case 'buggleAlreadyHaveBaggle':
					return new BuggleAlreadyHaveBaggle(operation);
				case 'buggleDontHaveBaggle':
					return new BuggleDontHaveBaggle(operation);
				case 'cellAlreadyHaveBaggle':
					return new CellAlreadyHaveBaggle(operation);
				case 'buggleInOuterSpace':
					return new BuggleInOuterSpace(operation);
			}
		};
        
        BuggleWorld.prototype.deleteLine = function(lineY) {
            var bugglesToRemove = [];
            var buggle;
            var i, y;
            
            for(y = lineY; y < this.height - 1; y++) {
                for(var x = 0; x < this.width; x++) {
                    this.cells[x][y] = this.cells[x][y+1];
                    this.cells[x][y].y = y;  
                }
            }

            for(var buggleID in this.entities) {
				if(this.entities.hasOwnProperty(buggleID)) {
					buggle = this.entities[buggleID];
					if(buggle.y === lineY) {
                        bugglesToRemove.push(buggleID);
                    }
                    else if(buggle.y > lineY) {
                        buggle.y--;
                    }
				}	
			}
            
            for(i = 0; i < bugglesToRemove.length; i++) {
                delete this.entities[bugglesToRemove[i]];
            }
            
            for(i = 0; i < this.width; i++) {
                this.cells[i].splice(this.height - 1, 1);
            }
            
            this.height--;
        }
        
        BuggleWorld.prototype.deleteColumn = function(lineX) {
            var bugglesToRemove = [];
            var buggle;
            var i, x;
            
            for(x = lineX; x < this.width - 1; x++) {
                for(var y = 0; y < this.height; y++) {
                    this.cells[x][y] = this.cells[x+1][y];
                    this.cells[x][y].x = x;  
                }
            }

            for(var buggleID in this.entities) {
				if(this.entities.hasOwnProperty(buggleID)) {
					buggle = this.entities[buggleID];
					if(buggle.x === lineX) {
                        bugglesToRemove.push(buggleID);
                    }
                    else if(buggle.x > lineX) {
                        buggle.x--;
                    }
				}	
			}
            
            for(i = 0; i < bugglesToRemove.length; i++) {
                delete this.entities[bugglesToRemove[i]];
            }
            
            this.cells.splice(this.width - 1, 1);
            
            this.width--;
        }
        
        BuggleWorld.prototype.addLine = function(lineY) {
            var y, x;
            
            for(x = 0; x < this.width; x++) {
                this.cells[x].splice(lineY, 0, new BuggleWorldCell({
                        color: [255, 255, 255, 255],
                        content: '',
                        hasBaggle: false,
                        hasContent: false,
                        hasLeftWall: false,
                        hasTopWall: false,
                        x: x,
                        y: lineY
                    }));
            }
            
            this.height++;
            
            for(y = this.height - 1; y > lineY; y--) {
                for(x = 0; x < this.width; x++) {
                    this.cells[x][y].y++;
                }
            }
            
            for(var buggleID in this.entities) {
				if(this.entities.hasOwnProperty(buggleID)) {
					if(this.entities[buggleID].y >= lineY) {
                      this.entities[buggleID].y++;
                    }
				}
			}
        }
        
        BuggleWorld.prototype.addColumn = function(columnX) {
            var y, x;
            var newColumn = [];
            
            for(y = 0; y < this.height; y++) {
                newColumn.push(new BuggleWorldCell({
                    color: [255, 255, 255, 255],
                    content: '',
                    hasBaggle: false,
                    hasContent: false,
                    hasLeftWall: false,
                    hasTopWall: false,
                    x: columnX,
                    y: y
                }));
            }
            
            this.cells.splice(columnX, 0, newColumn);

            this.width++;
            
            for(x = this.width - 1; x > columnX; x--) {
                for(y = 0; y < this.height; y++) {
                    this.cells[x][y].x++;
                }
            }
            
            for(var buggleID in this.entities) {
				if(this.entities.hasOwnProperty(buggleID)) {
					if(this.entities[buggleID].x >= columnX) {
                      this.entities[buggleID].x++;
                    }
				}
			}
        }
        
        BuggleWorld.prototype.newEmptyWorld = function () {
            var i, j;
            var world = {
                entities: {},
                cells: [],
                height: 7,
                type: 'BuggleWorld',
                width: 7
            };
            
            for(i = 0; i < world.width; i++) {
                world.cells.push([]);
                for(j = 0; j < world.height; j++) {
                    world.cells[i].push({
                        color: [255, 255, 255, 255],
                        content: '',
                        hasBaggle: false,
                        hasContent: false,
                        hasLeftWall: false,
                        hasTopWall: false,
                        x: i,
                        y: j
                    });
                }
            }
            return world;
        }
        
        BuggleWorld.prototype.selectCell = function (x, y) {
            if(this.selectedCell !== null) {
                this.selectedCell.isSelected = false;
            }
            this.selectedCell = this.cells[x][y];
            this.cells[x][y].isSelected = true;
        }
        
		return BuggleWorld;
	}
})();