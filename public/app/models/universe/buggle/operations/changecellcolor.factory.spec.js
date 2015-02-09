describe('ChangeCellColor', function() {
	var _BuggleWorldCell;
	var _ChangeCellColor;

	var cell;
	var currentWorld;
	var changeCellColor;
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

		newColor = getRandomColor();
		oldColor = getRandomColor();

		var dataOperation = {
			cell: {
				x: getRandomInt(999),
				y: getRandomInt(999)
			},
			newColor: newColor,
			oldColor: oldColor
		};
		changeCellColor = new _ChangeCellColor(dataOperation);
	});

	it('should replace cell.color by newColor when applied', function () {
		changeCellColor.apply(currentWorld);
		expect(cell.color).toEqual(newColor);
	});

	it('should replace cell.color by oldColor when reversed', function () {
		changeCellColor.reverse(currentWorld);
		expect(cell.color).toEqual(oldColor);
	});
});
