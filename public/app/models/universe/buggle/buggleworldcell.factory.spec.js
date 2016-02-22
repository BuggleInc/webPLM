(function(){
	'use strict';

	describe('BuggleWorldCell', function() {
		var _BuggleWorldCell;

		var buggleWorldCell;
		var x;
		var y;
		var color;
		var hasBaggle;
		var content;
		var leftWall;
		var topWall;

		beforeEach(module('PLMApp'));

		beforeEach(inject(function(BuggleWorldCell) {
			_BuggleWorldCell = BuggleWorldCell;
		}));

		beforeEach(function() {
			x = getRandomInt(999);
			y = getRandomInt(999);
			color = getRandomColor();
			hasBaggle = getRandomBoolean();
			content = getRandomString(15);
			leftWall = getRandomBoolean();
			topWall = getRandomBoolean();
			var dataBuggleWorldCell = {
				x: x,
				y: y,
				color: color,
				hasBaggle: hasBaggle,
				content: content,
				leftWall: leftWall,
				topWall: topWall
			};
			buggleWorldCell = new _BuggleWorldCell(dataBuggleWorldCell);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(buggleWorldCell.x).toEqual(x);
			expect(buggleWorldCell.y).toEqual(y);
			expect(buggleWorldCell.color).toEqual(color);
			expect(buggleWorldCell.hasBaggle).toEqual(hasBaggle);
			expect(buggleWorldCell.content).toEqual(content);
			expect(buggleWorldCell.leftWall).toEqual(leftWall);
			expect(buggleWorldCell.topWall).toEqual(topWall);
		});
	});
})();
