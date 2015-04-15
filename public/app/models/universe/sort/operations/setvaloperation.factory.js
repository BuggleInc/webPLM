(function()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('SetValOperation', SetValOperation);

	function SetValOperation()
	{
		var SetValOperation = function(data)
		{
			this.value = data.value;
			this.position = data.position;
			this.oldValue = data.oldValue;
		};

		SetValOperation.prototype.apply = function(currentWorld)
		{
			this.oldValue = currentWorld.values[this.position];
			currentWorld.values[this.position] = this.value;
			currentWorld.memory.push(currentWorld.values);
		};

		SetValOperation.prototype.reverse = function (currentWorld)
		{
			var index = currentWorld.memory.indexOf(currentWorld.values);
			if(index > -1) currentWorld.memory.splice(index,1);
			currentWorld.values[this.position] = this.oldValue;
		};

		return SetValOperation;

	}
})();