(function ()
{
	'use strict';
	
 	angular
		.module('PLMApp')
		.factory('CountOperation', CountOperation);

	function CountOperation()
	{
		var CountOperation = function(data)
		{
			this.read = data.read;
			this.write = data.write;
			this.oldRead = data.oldRead;
			this.oldWrite = data.oldWrite;
		};

		CountOperation.prototype.apply = function(currentWorld)
		{
			this.oldRead = currentWorld.readCount;
			this.oldWrite = currentWorld.writeCount;
			currentWorld.readCount = this.read;
			currentWorld.writeCount = this.write;
		};

		CountOperation.prototype.reverse = function(currentWorld)
		{
			currentWorld.readCount = this.oldRead;
			currentWorld.writeCount = this.oldWrite;
		};

		return CountOperation;
	}

})();