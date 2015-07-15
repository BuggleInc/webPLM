(function(){
	'use strict';

	describe('ChangeBuggleDirection', function() {
		var _Buggle;
		var _ChangeBuggleDirection;

		var buggle;
		var currentWorld;
		var changeBuggleDirection;
		var buggleID;
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

			buggleID = getRandomString(15);
			newDirection = getRandomDirection();
			oldDirection = getRandomDirection();

			var dataOperation = {
				buggleID: buggleID,
				newDirection: newDirection,
				oldDirection: oldDirection
			};
			changeBuggleDirection = new _ChangeBuggleDirection(dataOperation);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(changeBuggleDirection.buggleID).toEqual(buggleID);
			expect(changeBuggleDirection.newDirection).toEqual(newDirection);
			expect(changeBuggleDirection.oldDirection).toEqual(oldDirection);
		});

		it('should replace buggle.direction by newDirection when applied', function () {
			changeBuggleDirection.apply(currentWorld);
			expect(buggle.direction).toEqual(newDirection);
		});

		it('should replace buggle.direction by oldDirection when reversed', function () {
			changeBuggleDirection.reverse(currentWorld);
			expect(buggle.direction).toEqual(oldDirection);
		});
        
        it('should not change buggle.direction when applied then reversed', function () {
            buggle.direction = oldDirection;
            var current = buggle.direction;
            changeBuggleDirection.apply(currentWorld);
            changeBuggleDirection.reverse(currentWorld);
            expect(buggle.direction).toEqual(current);
        });
        
        it('should not change buggle.direction when reversed then applied', function () {
            buggle.direction = newDirection;
            var current = buggle.direction;
            changeBuggleDirection.reverse(currentWorld);
            changeBuggleDirection.apply(currentWorld);
            expect(buggle.direction).toEqual(current);
        });
	});
})();