(function(){
	'use strict';

	describe('BuggleWorldCell', function() {
		var _BuggleWorldCell;

		var buggleWorldCell;
		var x;
		var y;
		var color;
		var hasBaggle;
		var hasContent;
		var content;
		var hasLeftWall;
		var hasTopWall;
		
		beforeEach(module('PLMApp'));

		beforeEach(inject(function(BuggleWorldCell) {
			_BuggleWorldCell = BuggleWorldCell;	
		}));

		beforeEach(function() {
			x = getRandomInt(999);
			y = getRandomInt(999);
			color = getRandomColor();
			hasBaggle = getRandomBoolean();
			hasContent = getRandomBoolean();
			content = getRandomString(15);
			hasLeftWall = getRandomBoolean();
			hasTopWall = getRandomBoolean();
			var dataBuggleWorldCell = {
				x: x,
				y: y,
				color: color,
				hasBaggle: hasBaggle,
				hasContent: hasContent,
				content: content,
				hasLeftWall: hasLeftWall,
				hasTopWall: hasTopWall
			};
			buggleWorldCell = new _BuggleWorldCell(dataBuggleWorldCell);
		});

		it('should be initialized correctly by its constructor', function () {
			expect(buggleWorldCell.x).toEqual(x);
			expect(buggleWorldCell.y).toEqual(y);
			expect(buggleWorldCell.color).toEqual(color);
			expect(buggleWorldCell.hasBaggle).toEqual(hasBaggle);
			expect(buggleWorldCell.hasContent).toEqual(hasContent);
			expect(buggleWorldCell.content).toEqual(content);
			expect(buggleWorldCell.hasLeftWall).toEqual(hasLeftWall);
			expect(buggleWorldCell.hasTopWall).toEqual(hasTopWall);
		});
	});
})();