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
            
            this.name = world.hasOwnProperty('name') ? world.name : 'New world';
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

        BuggleWorld.prototype.addColumn = function(columnX, nb) {
            nb = typeof nb !== 'undefined' ? nb : 1;
            var y, x, i, c;
            var bugglesToRemove = [];
            
            for(i = 0; i < nb; i++) {
                var newColumn = [];
                for(y = 0; y < this.height; y++) {
                    newColumn.push(new BuggleWorldCell({
                        color: [255, 255, 255, 255],
                        content: '',
                        hasBaggle: false,
                        hasContent: false,
                        hasLeftWall: false,
                        hasTopWall: false,
                        x: columnX + i,
                        y: y
                    }));
                }
                this.cells.splice(columnX + i, 0, newColumn);
            }
            
            if(nb < 0) {
                this.cells.splice(columnX, Math.abs(nb));
            }
            
            this.width += nb;
            
            c = (nb < 0) ? columnX : columnX + nb;
            
            for(x = this.width - 1; x >= c; x--) {
                for(y = 0; y < this.height; y++) {
                    this.cells[x][y].x = x;
                }
            }
            
            for(var buggleID in this.entities) {
				if(this.entities.hasOwnProperty(buggleID)) {
                    if(nb < 0 && this.entities[buggleID].x >= columnX && this.entities[buggleID].x <= columnX - nb - 1) {
                        bugglesToRemove.push(buggleID);
                    }
					else if((nb < 0 && this.entities[buggleID].x > columnX - nb - 1)
                                || (nb > 0 && this.entities[buggleID].x >= columnX)) {
                        this.entities[buggleID].x += nb;
                    }
				}
			}
            
            for(i = 0; i < bugglesToRemove.length; i++) {
                delete this.entities[bugglesToRemove[i]];
            }
        };
        
        BuggleWorld.prototype.addLine = function(lineY, nb) {
            nb = typeof nb !== 'undefined' ? nb : 1;
            var x, y, i, c;
            var bugglesToRemove = [];
            
            for(x = 0; x < this.width; x++) {
                c = (nb < 0) ? lineY - nb : lineY;
                
                for(y = this.height - 1; y >= c; y--) {
                    this.cells[x][y].y += nb;
                }
                for(y = 0; y < nb; y++) {
                    this.cells[x].splice(lineY + y, 0, new BuggleWorldCell({
                        color: [255, 255, 255, 255],
                        content: '',
                        hasBaggle: false,
                        hasContent: false,
                        hasLeftWall: false,
                        hasTopWall: false,
                        x: x,
                        y: lineY + y
                    }));
                }
                if(nb < 0) {
                    this.cells[x].splice(lineY, nb * -1);
                }
            }
            
            this.height += nb;

            for(var buggleID in this.entities) {
				if(this.entities.hasOwnProperty(buggleID)) {
                    if(nb < 0 && this.entities[buggleID].y >= lineY && this.entities[buggleID].y <= lineY - nb - 1) {
                        bugglesToRemove.push(buggleID);
                    }
					else if((nb < 0 && this.entities[buggleID].y > lineY - nb - 1)
                                || (nb > 0 && this.entities[buggleID].y >= lineY)) {
                        this.entities[buggleID].y += nb;
                    }
				}
			}
            
            for(i = 0; i < bugglesToRemove.length; i++) {
                delete this.entities[bugglesToRemove[i]];
            }
        };
        
        BuggleWorld.prototype.changeBuggleID= function(buggleID, newID) {
            if(this.entities.hasOwnProperty(buggleID) && !this.entities.hasOwnProperty(newID)) {
                this.entities[newID] = this.entities[buggleID];
                delete this.entities[buggleID];
                buggleID = newID;
            }
            return buggleID;
        };
        
        BuggleWorld.prototype.setHeight = function(newHeight) {
            var nbLines = newHeight - this.height;
            var position = (nbLines < 0) ? this.height + nbLines : this.height;
            this.addLine(position, nbLines);
        };
        
        BuggleWorld.prototype.setWidth = function(newWidth) {
            var nbColumns = newWidth - this.width;
            var position = (nbColumns < 0) ? this.width + nbColumns : this.width;
            this.addColumn(position, nbColumns);
        };
        
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
        };
        
        BuggleWorld.prototype.selectCell = function (x, y) {
            if(this.selectedCell !== null) {
                this.selectedCell.isSelected = false;
            }
            this.selectedCell = this.cells[x][y];
            this.cells[x][y].isSelected = true;
        };
        
        BuggleWorld.prototype.deselectCell = function () {
            if(this.selectedCell) {
                this.selectedCell.isSelected = false;
            }
            this.selectedCell = null;
        };
        
		return BuggleWorld;
	}
})();