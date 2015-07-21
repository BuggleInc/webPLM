(function()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('GetValueOperation', GetValueOperation);

	function GetValueOperation()
	{
		var GetValueOperation = function(data)
		{
			this.position = data.position;
		};

		GetValueOperation.prototype.apply = function(currentWorld)
		{
			var stock = [];
			for(var i=0;i<currentWorld.values.length;i++)
			{
				stock.push(currentWorld.values[i]);
			}
			currentWorld.memory.push(stock);
		};

		GetValueOperation.prototype.reverse = function(currentWorld)
		{
			var index = currentWorld.memory.length-1;
			if(index > -1) currentWorld.memory.splice(index,1);
		};

		return GetValueOperation;
	}		
})();