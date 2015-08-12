(function()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('SwapOperation', SwapOperation);

	function SwapOperation()
	{
		var SwapOperation = function(data)
		{
			this.dest = data.destination;
			this.src = data.source;
		};

		SwapOperation.prototype.apply = function(currentWorld)
		{
			var tmp = currentWorld.values[this.src];
			currentWorld.values[this.src] = currentWorld.values[this.dest];
			currentWorld.values[this.dest] = tmp ;

			var stock = [];
			for(var i=0;i<currentWorld.values.length;i++)
			{
				stock.push(currentWorld.values[i]);
			}
			currentWorld.memory.push(stock);
		};

		SwapOperation.prototype.reverse = function(currentWorld)
		{
			var index = currentWorld.memory.length-1;
			if(index > -1) {
				currentWorld.memory.splice(index,1);
			}
			var tmp = currentWorld.values[this.dest];
			currentWorld.values[this.dest] = currentWorld.values[this.src];
			currentWorld.values[this.src] = tmp ;
		};

		return SwapOperation;
	}
})();