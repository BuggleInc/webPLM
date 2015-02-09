describe('ChangeCellHasContent', function() {
	var _BuggleWorldCell;
	var _ChangeCellHasContent;

	var cell;
	var currentWorld;
	var changeCellHasContent;
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

		newHasContent = getRandomBoolean();
		oldHasContent = getRandomBoolean();

		var dataOperation = {
			cell: {
				x: getRandomInt(999),
				y: getRandomInt(999)
			},
			newHasContent: newHasContent,
			oldHasContent: oldHasContent
		};
		changeCellHasContent = new _ChangeCellHasContent(dataOperation);
	});

	it('should replace cell.hasContent by newHasContent when applied', function () {
		changeCellHasContent.apply(currentWorld);
		expect(cell.hasContent).toEqual(newHasContent);
	});

	it('should replace cell.hasContent by oldHasContent when reversed', function () {
		changeCellHasContent.reverse(currentWorld);
		expect(cell.hasContent).toEqual(oldHasContent);
	});
});
