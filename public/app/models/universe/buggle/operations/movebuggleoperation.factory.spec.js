describe('MoveBuggleOperation', function() {
	var _Buggle;
	var _MoveBuggleOperation;

	var buggle;
	var currentWorld;
	var moveBuggleOperation;
	var newX;
	var newY;
	var oldX;
	var oldY;

	beforeEach(module('PLMApp'));

	beforeEach(inject(function(Buggle, MoveBuggleOperation) {
		_Buggle = Buggle;
		_MoveBuggleOperation = MoveBuggleOperation;
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

		newX = getRandomInt(999);
		newY = getRandomInt(999);
		oldX = getRandomInt(999);
		oldY = getRandomInt(999);

		var dataOperation = {
			newX: newX,
			newY: newY,
			oldX: oldX,
			oldY: oldY
		};
		moveBuggleOperation = new _MoveBuggleOperation(dataOperation);
	});

	it('should replace buggle.x by newX when applied', function () {
		moveBuggleOperation.apply(currentWorld);
		expect(buggle.x).toEqual(newX);
	});

	it('should replace buggle.y by newY when applied', function () {
		moveBuggleOperation.apply(currentWorld);
		expect(buggle.y).toEqual(newY);
	});

	it('should replace buggle.x by oldX when reversed', function () {
		moveBuggleOperation.reverse(currentWorld);
		expect(buggle.x).toEqual(oldX);
	});

	it('should replace buggle.y by oldY when reversed', function () {
		moveBuggleOperation.reverse(currentWorld);
		expect(buggle.y).toEqual(oldY);
	});
});
