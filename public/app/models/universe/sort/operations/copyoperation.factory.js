(function()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('CopyOperation', CopyOperation);

	function CopyOperation()
	{
		var CopyOperation = function(data)
		{
			this.dest = data.destination;
			this.src = data.source;
			this.oldValue = data.oldValue;
		};

		CopyOperation.prototype.apply = function(currentWorld)
		{
			this.oldValue = currentWorld.values[this.dest];
			currentWorld.values[this.dest] = currentWorld.values[this.src];
			var stock = [];
			for(var i=0;i<currentWorld.values.length;i++)
			{
				stock.push(currentWorld.values[i]);
			}
			currentWorld.memory.push(stock);
		};
		
		CopyOperation.prototype.reverse = function(currentWorld)
		{
			var index = currentWorld.memory.length-1;
			if(index > -1) {
				currentWorld.memory.splice(index,1);
			}
			currentWorld.values[this.dest] = this.oldValue;
		};

		return CopyOperation;
	}
})();