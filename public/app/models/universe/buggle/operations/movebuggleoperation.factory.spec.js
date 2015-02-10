(function(){
	'use strict';

	describe('MoveBuggleOperation', function() {
		var _Buggle;
		var _MoveBuggleOperation;

		var buggle;
		var currentWorld;
		var moveBuggleOperation;
		var buggleID;
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

			buggleID = getRandomString(15);
			newX = getRandomInt(999);
			newY = getRandomInt(999);
			oldX = getRandomInt(999);
			oldY = getRandomInt(999);

			var dataOperation = {
				buggleID: buggleID,
				newX: newX,
				newY: newY,
				oldX: oldX,
				oldY: oldY
			};
			moveBuggleOperation = new _MoveBuggleOperation(dataOperation);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(moveBuggleOperation.buggleID).toEqual(buggleID);
			expect(moveBuggleOperation.newX).toEqual(newX);
			expect(moveBuggleOperation.newY).toEqual(newY);
			expect(moveBuggleOperation.oldX).toEqual(oldX);
			expect(moveBuggleOperation.oldY).toEqual(oldY);
		});

		it('should replace buggle.x by newX and buggle.y by newY when applied', function () {
			moveBuggleOperation.apply(currentWorld);
			expect(buggle.x).toEqual(newX);
			expect(buggle.y).toEqual(newY);
		});

		it('should replace buggle.x by oldX and buggle.y by oldY when reversed', function () {
			moveBuggleOperation.reverse(currentWorld);
			expect(buggle.x).toEqual(oldX);
		});
	});
})();