(function(){
	'use strict';

	describe('Buggle', function() {
		var _Buggle;

		var buggle;
		var x;
		var y;
		var color;
		var direction;
		var carryBaggle;
		var brushDown;
		
		beforeEach(module('PLMApp'));

		beforeEach(inject(function(Buggle) {
			_Buggle = Buggle;	
		}));

		beforeEach(function() {
			var dataBuggle;

			x = getRandomInt(999);
			y = getRandomInt(999);
			color = getRandomColor();
			direction = getRandomDirection();
			carryBaggle = getRandomBoolean();
			brushDown = getRandomBoolean();
			dataBuggle = {
				x: x,
				y: y,
				color: color,
				direction: direction,
				carryBaggle: carryBaggle,
				brushDown: brushDown
			};
			buggle = new _Buggle(dataBuggle);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(buggle.x).toEqual(x);
			expect(buggle.y).toEqual(y);
			expect(buggle.color).toEqual(color);
			expect(buggle.direction).toEqual(direction);
			expect(buggle.carryBaggle).toEqual(carryBaggle);
			expect(buggle.brushDown).toEqual(brushDown);
		});
	});
})();