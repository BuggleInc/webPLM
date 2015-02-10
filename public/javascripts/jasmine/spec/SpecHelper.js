beforeEach(function () {
	jasmine.addMatchers({
		toEqualToBuggle: function () {
			return {
				compare: toEqualToBuggle
			};
		},
		toEqualToBuggleWorldCell: function () {
			return {
				compare: toEqualToBuggleWorldCell
			};
		}
	});
});

function once(fn) {
		var returnValue, called = false;
		return function () {
				if (!called) {
						called = true;
						returnValue = fn.apply(this, arguments);
				}
				return returnValue;
		};
}

function getRandomString(range) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for(var i=0; i<range; i++) {
		text += possible.charAt(parseInt(Math.random() * possible.length));
	}

	return text;
}

function getRandomInt(range) {
	return parseInt(Math.random()*range);
}

function getRandomValueFromArray(array) {
	return array[getRandomInt(array.length)];
}

function getRandomColor() {
	return [getRandomInt(255), getRandomInt(255), getRandomInt(255), getRandomInt(255)];
}

function getRandomBoolean() {
	if(Math.random()<0.5) {
		return true;
	}
	return false;
}

function getRandomDirection() {
	return getRandomInt(4);
}

function getRandomBuggle() {
	return {
		x: getRandomInt(999),
		y: getRandomInt(999),
		color: getRandomColor(),
		direction: getRandomDirection(),
		carryBaggle: getRandomBoolean(),
		brushDown: getRandomBoolean()
	};
}

function toEqualToBuggle (actual, expected) {
	return {
		pass: actual.x === expected.x &&
			actual.y === expected.y &&
			actual.direction === expected.direction &&
			actual.carryBaggle === expected.carryBaggle &&
			actual.brushDown === expected.brushDown
	};
}

function getRandomBuggleWorldCell() {
	return {
		x: getRandomInt(999),
		y: getRandomInt(999),
		color: getRandomColor(),
		hasBaggle: getRandomBoolean(),
		hasContent: getRandomBoolean(),
		content: getRandomString(15),
		hasLeftWall: getRandomBoolean(),
		hasTopWall: getRandomBoolean()
	};
}

function toEqualToBuggleWorldCell (actual, expected) {
	return {
		pass: actual.x === expected.x &&
			actual.y === expected.y &&
			actual.color === expected.color &&
			actual.hasBaggle === expected.hasBaggle &&
			actual.hasContent === expected.hasContent &&
			actual.content === expected.content &&
			actual.hasLeftWall === expected.hasLeftWall &&
			actual.hasTopWall === expected.hasTopWall
	};
}