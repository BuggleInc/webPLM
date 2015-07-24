(function(){
	'use strict';

	describe('ChangeCellHasBaggle', function() {
		var _BuggleWorldCell;
		var _ChangeCellHasBaggle;

		var cell;
		var currentWorld;
		var changeCellHasBaggle;
		var x;
		var y;
		var newHasBaggle;
		var oldHasBaggle;

		beforeEach(module('PLMApp'));

		beforeEach(inject(function(BuggleWorldCell, ChangeCellHasBaggle) {
			_BuggleWorldCell = BuggleWorldCell;
			_ChangeCellHasBaggle = ChangeCellHasBaggle;
		}));

		beforeEach(function() {
			var dataCell = {};
			cell = new _BuggleWorldCell(dataCell);
			
			var getCell = sinon.stub();
			getCell.returns(cell);

			currentWorld = {
				getCell: getCell,
				steps: []
			};

			x = getRandomInt(999);
			y = getRandomInt(999);
			newHasBaggle = getRandomBoolean();
			oldHasBaggle = getRandomBoolean();

			var dataOperation = {
				cell: {
					x: x,
					y: y
				},
				newHasBaggle: newHasBaggle,
				oldHasBaggle: oldHasBaggle
			};
			changeCellHasBaggle = new _ChangeCellHasBaggle(dataOperation);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(changeCellHasBaggle.x).toEqual(x);
			expect(changeCellHasBaggle.y).toEqual(y);
			expect(changeCellHasBaggle.newHasBaggle).toEqual(newHasBaggle);
			expect(changeCellHasBaggle.oldHasBaggle).toEqual(oldHasBaggle);
		});

		it('should replace cell.hasBaggle by newHasBaggle when applied', function () {
			changeCellHasBaggle.apply(currentWorld);
			expect(cell.hasBaggle).toEqual(newHasBaggle);
		});

		it('should replace cell.hasBaggle by oldHasBaggle when reversed', function () {
			changeCellHasBaggle.reverse(currentWorld);
			expect(cell.hasBaggle).toEqual(oldHasBaggle);
		});
        
        it('should not change cell.hasBaggle when applied then reversed', function () {
            cell.hasBaggle = oldHasBaggle;
            var current = cell.hasBaggle;
            changeCellHasBaggle.apply(currentWorld);
            changeCellHasBaggle.reverse(currentWorld);
            expect(cell.hasBaggle).toEqual(current);
        });
        
        it('should not change cell.hasBaggle when reversed then applied', function () {
            cell.hasBaggle = newHasBaggle;
            var current = cell.hasBaggle;
            changeCellHasBaggle.reverse(currentWorld);
            changeCellHasBaggle.apply(currentWorld);
            expect(cell.hasBaggle).toEqual(current);
        });
	});
})();