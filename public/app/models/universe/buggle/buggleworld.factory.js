(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('BuggleWorld', BuggleWorld);
	
	BuggleWorld.$inject = [
		'BuggleWorldCell', 'Buggle', 
		'ChangeCellHasBaggle', 'ChangeCellColor', 
		'ChangeBuggleCarryBaggle', 'MoveBuggleOperation', 'ChangeBuggleDirection',
		'ChangeCellHasContent', 'ChangeCellContent', 'BuggleEncounterWall', 'ChangeBuggleBrushDown',
		'NoBaggleUnderBuggle', 'BuggleAlreadyHaveBaggle', 'BuggleDontHaveBaggle', 
		'CellAlreadyHaveBaggle', 'BuggleInOuterSpace'
	];
	
	function BuggleWorld (BuggleWorldCell, Buggle,
			ChangeCellHasBaggle, ChangeCellColor,
			ChangeBuggleCarryBaggle, MoveBuggleOperation, ChangeBuggleDirection,
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

		BuggleWorld.prototype.drawGrid = function (ctx, canvasWidth, canvasHeight) {
			var i, j;

			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'grey';
			var cellWidth = canvasWidth/this.width;
			var cellHeight = canvasHeight/this.height;
			for(i=0; i<=this.width; i++) {
				ctx.moveTo(i*cellWidth, 0);
				ctx.lineTo(i*cellWidth, canvasHeight);
			}
			for(j=0; j<=this.height; j++) {
				ctx.moveTo(0, j*cellHeight);
				ctx.lineTo(canvasWidth, j*cellHeight);	
			}
			ctx.stroke();
			ctx.closePath();
		};

		BuggleWorld.prototype.drawFrontierWalls = function (ctx, canvasWidth, canvasHeight) {
			var x, y;

			var xLeft;
			var xRight;
			var yTop;
			var yBottom;

			ctx.beginPath();
			
			ctx.lineWidth = 4;
			ctx.strokeStyle = 'SteelBlue';

			// frontier walls (since the world is a torus)
			for (y = 0; y < this.height; y++) {
				if (this.cells[0][y].hasLeftWall) {
					xLeft = canvasWidth;
					yTop = canvasHeight/this.height*y;
					yBottom = canvasHeight/this.height*(y+1);
					ctx.moveTo(xLeft, yTop);
					ctx.lineTo(xLeft, yBottom);
				}
			}
			
			for (x = 0; x < this.width; x++) {
				if (this.cells[x][0].hasTopWall) {
					xLeft = canvasWidth/this.width*x;
					xRight = canvasWidth/this.width*(x+1);
					yTop = canvasHeight;
					ctx.moveTo(xLeft, yTop);
					ctx.lineTo(xRight, yTop);
				}
			}
			
			ctx.stroke();
			ctx.closePath();
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
		
		return BuggleWorld;
	}
})();