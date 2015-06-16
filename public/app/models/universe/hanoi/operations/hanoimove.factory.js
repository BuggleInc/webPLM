(function ()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('HanoiMove', HanoiMove);

	function HanoiMove()
	{
		var HanoiMove = function(data)
		{
			this.source = data.source;
			this.destination = data.destination;
		};

		HanoiMove.prototype.apply = function(currentWorld)
		{
			var tmp = currentWorld.slotVal[this.source][currentWorld.slotVal[this.source].length-1];
			var index = currentWorld.slotVal[this.source].indexOf(currentWorld.slotVal[this.source][currentWorld.slotVal[this.source].length-1]);
			if(index > -1) {
				currentWorld.slotVal[this.source].splice(index,1);
			}
			currentWorld.slotVal[this.destination].push(tmp);
			currentWorld.moveCount++;
		};

		HanoiMove.prototype.reverse = function(currentWorld)
		{
			var tmp = currentWorld.slotVal[this.destination][currentWorld.slotVal[this.destination].length-1];
			var index = currentWorld.slotVal[this.destination].indexOf(currentWorld.slotVal[this.destination][currentWorld.slotVal[this.destination].length-1]);
			if(index > -1) {
				currentWorld.slotVal[this.destination].splice(index,1);
			}
			currentWorld.slotVal[this.source].push(tmp);
			currentWorld.moveCount--;
		};

		return HanoiMove;
	}
})();