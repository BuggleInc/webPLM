(function(){
	'use strict';

	describe('ChangeCellHasContent', function() {
		var _BuggleWorldCell;
		var _ChangeCellHasContent;

		var cell;
		var currentWorld;
		var changeCellHasContent;
		var x;
		var y;
		var newHasContent;
		var oldHasContent;

		beforeEach(module('PLMApp'));

		beforeEach(inject(function(BuggleWorldCell, ChangeCellHasContent) {
			_BuggleWorldCell = BuggleWorldCell;
			_ChangeCellHasContent = ChangeCellHasContent;
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
			newHasContent = getRandomBoolean();
			oldHasContent = getRandomBoolean();

			var dataOperation = {
				cell: {
					x: x,
					y: y
				},
				newHasContent: newHasContent,
				oldHasContent: oldHasContent
			};
			changeCellHasContent = new _ChangeCellHasContent(dataOperation);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(changeCellHasContent.x).toEqual(x);
			expect(changeCellHasContent.y).toEqual(y);
			expect(changeCellHasContent.newHasContent).toEqual(newHasContent);
			expect(changeCellHasContent.oldHasContent).toEqual(oldHasContent);
		});

		it('should replace cell.hasContent by newHasContent when applied', function () {
			changeCellHasContent.apply(currentWorld);
			expect(cell.hasContent).toEqual(newHasContent);
		});

		it('should replace cell.hasContent by oldHasContent when reversed', function () {
			changeCellHasContent.reverse(currentWorld);
			expect(cell.hasContent).toEqual(oldHasContent);
		});
        
        it('should not change cell.hasContent when applied then reversed', function () {
            cell.hasContent = oldHasContent;
            var current = cell.hasContent;
            changeCellHasContent.apply(currentWorld);
            changeCellHasContent.reverse(currentWorld);
            expect(cell.hasContent).toEqual(current);
        });
        
        it('should not change cell.hasContent when reversed then applied', function () {
            cell.hasContent = newHasContent;
            var current = cell.hasContent;
            changeCellHasContent.reverse(currentWorld);
            changeCellHasContent.apply(currentWorld);
            expect(cell.hasContent).toEqual(current);
        });
	});
})();