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
				currentWorld.memory.push(currentWorld.values);
			};

			SwapOperation.prototype.reverse = function(currentWorld)
			{
				var index = currentWorld.memory.indexOf(currentWorld.values);
				if(index > -1) currentWorld.memory.splice(index,1);
				var tmp = currentWorld.values[this.dest];
				currentWorld.values[this.dest] = currentWorld.values[this.src];
				currentWorld.values[this.src] = tmp ;
			};

			return SwapOperation;
		}
})();