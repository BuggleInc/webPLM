(function(){
	'use strict';

	describe('ChangeCellColor', function() {
		var _BuggleWorldCell;
		var _ChangeCellColor;

		var cell;
		var currentWorld;
		var changeCellColor;
		var x;
		var y;
		var newColor;
		var oldColor;

		beforeEach(module('PLMApp'));

		beforeEach(inject(function(BuggleWorldCell, ChangeCellColor) {
			_BuggleWorldCell = BuggleWorldCell;
			_ChangeCellColor = ChangeCellColor;
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
			newColor = getRandomColor();
			oldColor = getRandomColor();

			var dataOperation = {
				cell: {
					x: x,
					y: y
				},
				newColor: newColor,
				oldColor: oldColor
			};
			changeCellColor = new _ChangeCellColor(dataOperation);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(changeCellColor.x).toEqual(x);
			expect(changeCellColor.y).toEqual(y);
			expect(changeCellColor.newColor).toEqual(newColor);
			expect(changeCellColor.oldColor).toEqual(oldColor);
		});

		it('should replace cell.color by newColor when applied', function () {
			changeCellColor.apply(currentWorld);
			expect(cell.color).toEqual(newColor);
		});

		it('should replace cell.color by oldColor when reversed', function () {
			changeCellColor.reverse(currentWorld);
			expect(cell.color).toEqual(oldColor);
		});
        
        it('should not change cell.color when applied then reversed', function () {
            cell.color = oldColor;
            var current = cell.color;
            changeCellColor.apply(currentWorld);
            changeCellColor.reverse(currentWorld);
            expect(cell.color).toEqual(current);
        });
        
        it('should not change cell.color when reversed then applied', function () {
            cell.color = newColor;
            var current = cell.color;
            changeCellColor.reverse(currentWorld);
            changeCellColor.apply(currentWorld);
            expect(cell.color).toEqual(current);
        });
	});
})();