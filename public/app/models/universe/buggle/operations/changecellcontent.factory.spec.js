(function(){
	'use strict';

	describe('ChangeCellContent', function() {
		var _BuggleWorldCell;
		var _ChangeCellContent;

		var cell;
		var currentWorld;
		var changeCellContent;
		var x;
		var y;
		var newContent;
		var oldContent;

		beforeEach(module('PLMApp'));

		beforeEach(inject(function(BuggleWorldCell, ChangeCellContent) {
			_BuggleWorldCell = BuggleWorldCell;
			_ChangeCellContent = ChangeCellContent;
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
			newContent = getRandomString(15);
			oldContent = getRandomString(15);

			var dataOperation = {
				cell: {
					x: x,
					y: y
				},
				newContent: newContent,
				oldContent: oldContent
			};
			changeCellContent = new _ChangeCellContent(dataOperation);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(changeCellContent.x).toEqual(x);
			expect(changeCellContent.y).toEqual(y);
			expect(changeCellContent.newContent).toEqual(newContent);
			expect(changeCellContent.oldContent).toEqual(oldContent);
		});

		it('should replace cell.content by newContent when applied', function () {
			changeCellContent.apply(currentWorld);
			expect(cell.content).toEqual(newContent);
		});

		it('should replace cell.content by oldContent when reversed', function () {
			changeCellContent.reverse(currentWorld);
			expect(cell.content).toEqual(oldContent);
		});
        
        it('should not change cell.content when applied then reversed', function () {
            cell.content = oldContent;
            var current = cell.content;
            changeCellContent.apply(currentWorld);
            changeCellContent.reverse(currentWorld);
            expect(cell.content).toEqual(current);
        });
        
        it('should not change cell.content when reversed then applied', function () {
            cell.content = newContent;
            var current = cell.content;
            changeCellContent.reverse(currentWorld);
            changeCellContent.apply(currentWorld);
            expect(cell.content).toEqual(current);
        });
	});
})();