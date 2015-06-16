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
			var stock = [];
			for(var i=0;i<currentWorld.content.length;i++)
			{
				stock.push(currentWorld.content[i]);
			}
			currentWorld.memory.push(stock);
			currentWorld.moveCount++;
		};

		DutchFlagSwap.prototype.reverse = function(currentWorld)
		{
			var tmp = currentWorld.content[this.dest];
			currentWorld.content[this.dest] = currentWorld.content[this.src];
			currentWorld.content[this.src] = tmp;
			var index = currentWorld.memory.indexOf(currentWorld.memory[currentWorld.memory.length-1]);
			if(index > -1)
				currentWorld.memory.splice(index, 1);
			currentWorld.moveCount--;
		};

		return DutchFlagSwap;
	}
})();