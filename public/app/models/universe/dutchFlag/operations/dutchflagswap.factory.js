(function ()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('DutchFlagSwap', DutchFlagSwap);

	function DutchFlagSwap()
	{	
		var DutchFlagSwap = function(data)
		{
			this.dest = data.destination;
			this.src = data.source;
		};

		DutchFlagSwap.prototype.apply = function(currentWorld)
		{
			var tmp = currentWorld.content[this.src];
			currentWorld.content[this.src] = currentWorld.content[this.dest];
			currentWorld.content[this.dest] = tmp;

			currentWorld.moveCount++;
		};

		DutchFlagSwap.prototype.reverse = function(currentWorld)
		{
			var tmp = currentWorld.content[this.dest];
			currentWorld.content[this.dest] = currentWorld.content[this.src];
			currentWorld.content[this.src] = tmp ;

			currentWorld.moveCount--;
		};

		return DutchFlagSwap;
	}
})();