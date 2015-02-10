(function(){
	'use strict';

	describe('BuggleWorld', function() {
		var _BuggleWorld;

		var buggleWorld;
		var type;
		var width;
		var height;
		var operations;
		var currentState;
		var steps;
		var cells;
		var entities;
		var bugglesID;
		
		beforeEach(module('PLMApp'));

		beforeEach(inject(function(BuggleWorld) {
			_BuggleWorld = BuggleWorld;	
		}));

		beforeEach(function() {
			var i, j;

			type = getRandomString(15);
			width = getRandomInt(10) + 1;
			height = getRandomInt(10) + 1;
			operations = [];
			currentState = -1;
			steps = [];

			cells = [];
			for(i=0; i<width; i++) {
				var temp = [];
				for(j=0; j<height; j++) {
					var cell = getRandomBuggleWorldCell();
					temp.push(cell);
				}
				cells.push(temp);
			}

			entities = {};
			bugglesID = [];
			var nbEntities = getRandomInt(10) + 1;
			for(i=0; i<nbEntities; i++) {
				var buggleID = getRandomString(15);
				bugglesID.push(buggleID);
				entities[buggleID] = getRandomBuggle();
			}

			var dataBuggleWorld = {
				type: type,
				width: width,
				height: height,
				cells: cells,
				entities: entities
			};
			buggleWorld = new _BuggleWorld(dataBuggleWorld);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(buggleWorld.type).toEqual(type);
			expect(buggleWorld.width).toEqual(width);
			expect(buggleWorld.height).toEqual(height);
			expect(buggleWorld.operations).toEqual(operations);
			expect(buggleWorld.currentState).toEqual(currentState);
			expect(buggleWorld.steps).toEqual(steps);

			for(var i=0; i<width; i++) {
				for(var j=0; j<height; j++) {
					var cell = buggleWorld.getCell(i, j);
					expect(cell).toEqualToBuggleWorldCell(cells[i][j]);
				}
			}

			for(var buggleID in entities) {
				if(entities.hasOwnProperty(buggleID)) {
					var buggle = buggleWorld.getEntity(buggleID);
					expect(buggle).toEqualToBuggle(entities[buggleID]);
				}	
			}
		});

		it('clone should return a correct copy of the world', function () {
			var other;
			var clone = buggleWorld.clone();

			expect(buggleWorld.type).toEqual(clone.type);
			expect(buggleWorld.width).toEqual(clone.width);
			expect(buggleWorld.height).toEqual(clone.height);
			expect(buggleWorld.operations).toEqual(clone.operations);
			expect(buggleWorld.currentState).toEqual(clone.currentState);
			expect(buggleWorld.steps).toEqual(clone.steps);

			for(var i=0; i<width; i++) {
				for(var j=0; j<height; j++) {
					var cell = buggleWorld.getCell(i, j);
					other = clone.getCell(i, j);
					expect(cell).toEqualToBuggleWorldCell(other);
				}
			}

			for(var buggleID in entities) {
				if(entities.hasOwnProperty(buggleID)) {
					var buggle = buggleWorld.getEntity(buggleID);
					other = clone.getEntity(buggleID);
					expect(buggle).toEqualToBuggle(other);
				}
			}
		});

		it('getEntity should return the correct buggle', function () {
			var buggleID = getRandomValueFromArray(bugglesID);
			var buggle = buggleWorld.getEntity(buggleID);
			expect(buggle).toEqualToBuggle(entities[buggleID]);
		});

		it('getCell should return the correct cell', function () {
			var x = getRandomInt(width);
			var y = getRandomInt(height);
			var cell = buggleWorld.getCell(x, y);
			expect(cell).toEqualToBuggleWorldCell(cells[x][y]);
		});

		it('addOperations should try to generate an operation for each element of the list', function () {
			var i;
			var elt;
			var nbElt = getRandomInt(50) + 1;
			var operations = [];
			spyOn(buggleWorld, 'generateOperation');
			for(i=0; i<nbElt; i++) {
				elt = getRandomString(3);
				operations.push(elt);
			}
			buggleWorld.addOperations(operations);
			var generateOperationCallCount = buggleWorld.generateOperation.calls.count();
			expect(generateOperationCallCount).toEqual(nbElt);
			for(i=0; i<nbElt; i++) {
				elt = buggleWorld.generateOperation.calls.argsFor(i)[0];
				expect(elt).toEqual(operations[i]);
			}
		});
	});
})();