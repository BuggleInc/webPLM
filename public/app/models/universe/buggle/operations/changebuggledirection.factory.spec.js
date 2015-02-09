describe('ChangeBuggleDirection', function() {
	var _Buggle;
	var _ChangeBuggleDirection;

	var buggle;
	var currentWorld;
	var changeBuggleDirection;
	var newDirection;
	var oldDirection;

	beforeEach(module('PLMApp'));

	beforeEach(inject(function(Buggle, ChangeBuggleDirection) {
		_Buggle = Buggle;
		_ChangeBuggleDirection = ChangeBuggleDirection;
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

		newDirection = getRandomDirection();
		oldDirection = getRandomDirection();

		var dataOperation = {
			newDirection: newDirection,
			oldDirection: oldDirection
		};
		changeBuggleDirection = new _ChangeBuggleDirection(dataOperation);
	});

	it('should replace buggle.direction by newDirection when applied', function () {
		changeBuggleDirection.apply(currentWorld);
		expect(buggle.direction).toEqual(newDirection);
	});

	it('should replace buggle.direction by oldDirection when reversed', function () {
		changeBuggleDirection.reverse(currentWorld);
		expect(buggle.direction).toEqual(oldDirection);
	});
});
