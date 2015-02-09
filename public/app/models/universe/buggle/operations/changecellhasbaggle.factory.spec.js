describe('ChangeCellHasBaggle', function() {
	var _BuggleWorldCell;
	var _ChangeCellHasBaggle;

	var cell;
	var currentWorld;
	var changeCellHasBaggle;
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

		newHasBaggle = getRandomBoolean();
		oldHasBaggle = getRandomBoolean();

		var dataOperation = {
			cell: {
				x: getRandomInt(999),
				y: getRandomInt(999)
			},
			newHasBaggle: newHasBaggle,
			oldHasBaggle: oldHasBaggle
		};
		changeCellHasBaggle = new _ChangeCellHasBaggle(dataOperation);
	});

	it('should replace cell.hasBaggle by newHasBaggle when applied', function () {
		changeCellHasBaggle.apply(currentWorld);
		expect(cell.hasBaggle).toEqual(newHasBaggle);
	});

	it('should replace cell.hasBaggle by oldHasBaggle when reversed', function () {
		changeCellHasBaggle.reverse(currentWorld);
		expect(cell.hasBaggle).toEqual(oldHasBaggle);
	});
});
