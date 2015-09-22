(function(){
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
	
	function BuggleWorld (BuggleWorldCell, Buggle,
			ChangeCellHasBaggle, ChangeCellColor,
			ChangeBuggleBodyColor, ChangeBuggleCarryBaggle, MoveBuggleOperation, ChangeBuggleDirection,
			ChangeCellHasContent, ChangeCellContent, BuggleEncounterWall, ChangeBuggleBrushDown,
			NoBaggleUnderBuggle, BuggleAlreadyHaveBaggle, BuggleDontHaveBaggle, 
			CellAlreadyHaveBaggle, BuggleInOuterSpace) {
		
		var BuggleWorld = function (world) {
			this.type = world.type;
			this.width = world.width;
			this.height = world.height;
			this.operations = [];
			this.currentState = -1;
			this.steps = [];

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
        case 'changeBuggleBodyColor':
          return new ChangeBuggleBodyColor(operation);
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
		
		return BuggleWorld;
	}
})();