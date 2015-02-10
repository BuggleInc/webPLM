describe('ChangeBuggleBrushDown', function() {
	var _Buggle;
	var _ChangeBuggleBrushDown;

	var buggle;
	var currentWorld;
	var changeBuggleBrushDown;
	var buggleID;
	var newBrushDown;
	var oldBrushDown;

	beforeEach(module('PLMApp'));

	beforeEach(inject(function(Buggle, ChangeBuggleBrushDown) {
		_Buggle = Buggle;
		_ChangeBuggleBrushDown = ChangeBuggleBrushDown;
	}));

	beforeEach(function() {
		var dataBuggle = {};
		buggle = new _Buggle(dataBuggle);
		
		var getEntity = sinon.stub();
		getEntity.returns(buggle);

		currentWorld = {
			getEntity: getEntity,
			steps: []
		};

		buggleID = getRandomString(15);
		newBrushDown = getRandomBoolean();
		oldBrushDown = getRandomBoolean();

		var dataOperation = {
			buggleID: buggleID,
			newBrushDown: newBrushDown,
			oldBrushDown: oldBrushDown
		};
		changeBuggleBrushDown = new _ChangeBuggleBrushDown(dataOperation);
	});

	it('should be initialized correctly by its constructor', function () {
		expect(changeBuggleBrushDown.buggleID).toEqual(buggleID);
		expect(changeBuggleBrushDown.newBrushDown).toEqual(newBrushDown);
		expect(changeBuggleBrushDown.oldBrushDown).toEqual(oldBrushDown);
	});

	it('should replace buggle.brushDown by newBrushDown when applied', function () {
		changeBuggleBrushDown.apply(currentWorld);
		expect(buggle.brushDown).toEqual(newBrushDown);
	});

	it('should replace buggle.brushDown by oldBrushDown when reversed', function () {
		changeBuggleBrushDown.reverse(currentWorld);
		expect(buggle.brushDown).toEqual(oldBrushDown);
	});
});
