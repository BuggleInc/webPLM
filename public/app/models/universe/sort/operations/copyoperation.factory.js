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

		CopyOperation.prototype.apply = function(CurrentWorld)
		{
			this.oldValue = CurrentWorld.values[this.dest];
			CurrentWorld.values[this.dest] = CurrentWorld.values[this.src];
		};
		
		CopyOperation.prototype.reverse = function(CurrentWorld)
		{
			CurrentWorld.values[this.dest] = this.oldValue;
		};

		return CopyOperation;
	}
})();