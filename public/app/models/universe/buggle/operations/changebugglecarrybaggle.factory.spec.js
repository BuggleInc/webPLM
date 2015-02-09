describe('ChangeBuggleCarryBaggle', function() {
	var _Buggle;
	var _ChangeBuggleCarryBaggle;

	var buggle;
	var currentWorld;
	var changeBuggleCarryBaggle;
	var newCarryBaggle;
	var oldCarryBaggle;

	beforeEach(module('PLMApp'));

	beforeEach(inject(function(Buggle, ChangeBuggleCarryBaggle) {
		_Buggle = Buggle;
		_ChangeBuggleCarryBaggle = ChangeBuggleCarryBaggle;
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

		newCarryBaggle = getRandomBoolean();
		oldCarryBaggle = getRandomBoolean();

		var dataOperation = {
			newCarryBaggle: newCarryBaggle,
			oldCarryBaggle: oldCarryBaggle
		};
		changeBuggleCarryBaggle = new _ChangeBuggleCarryBaggle(dataOperation);
	});

	it('should replace buggle.carryBaggle by newCarryBaggle when applied', function () {
		changeBuggleCarryBaggle.apply(currentWorld);
		expect(buggle.carryBaggle).toEqual(newCarryBaggle);
	});

	it('should replace buggle.carryBaggle by oldCarryBaggle when reversed', function () {
		changeBuggleCarryBaggle.reverse(currentWorld);
		expect(buggle.carryBaggle).toEqual(oldCarryBaggle);
	});
});
