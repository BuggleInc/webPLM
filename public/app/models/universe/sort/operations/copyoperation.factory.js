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
			currentWorld.memory.push(currentWorld.values);
		};
		
		CopyOperation.prototype.reverse = function(currentWorld)
		{
			var index = currentWorld.memory.indexOf(currentWorld.values);
			if(index > -1) currentWorld.memory.splice(index,1);
			currentWorld.values[this.dest] = this.oldValue;
		};

		return CopyOperation;
	}
})();