(function(){
	'use strict';

	describe('ChangeBuggleCarryBaggle', function() {
		var _Buggle;
		var _ChangeBuggleCarryBaggle;

		var buggle;
		var currentWorld;
		var changeBuggleCarryBaggle;
		var buggleID;
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

			buggleID = getRandomString(15);
			newCarryBaggle = getRandomBoolean();
			oldCarryBaggle = getRandomBoolean();

			var dataOperation = {
				buggleID: buggleID,
				newCarryBaggle: newCarryBaggle,
				oldCarryBaggle: oldCarryBaggle
			};
			changeBuggleCarryBaggle = new _ChangeBuggleCarryBaggle(dataOperation);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(changeBuggleCarryBaggle.buggleID).toEqual(buggleID);
			expect(changeBuggleCarryBaggle.newCarryBaggle).toEqual(newCarryBaggle);
			expect(changeBuggleCarryBaggle.oldCarryBaggle).toEqual(oldCarryBaggle);
		});

		it('should replace buggle.carryBaggle by newCarryBaggle when applied', function () {
			changeBuggleCarryBaggle.apply(currentWorld);
			expect(buggle.carryBaggle).toEqual(newCarryBaggle);
		});

		it('should replace buggle.carryBaggle by oldCarryBaggle when reversed', function () {
			changeBuggleCarryBaggle.reverse(currentWorld);
			expect(buggle.carryBaggle).toEqual(oldCarryBaggle);
		});
        
        it('should not change buggle.carryBaggle when applied then reversed', function () {
            buggle.carryBaggle = oldCarryBaggle;
            var current = buggle.carryBaggle;
            changeBuggleCarryBaggle.apply(currentWorld);
            changeBuggleCarryBaggle.reverse(currentWorld);
            expect(buggle.carryBaggle).toEqual(current);
        });
        
        it('should not change buggle.carryBaggle when reversed then applied', function () {
            buggle.carryBaggle = newCarryBaggle;
            var current = buggle.carryBaggle;
            changeBuggleCarryBaggle.reverse(currentWorld);
            changeBuggleCarryBaggle.apply(currentWorld);
            expect(buggle.carryBaggle).toEqual(current);
        });
	});
})();