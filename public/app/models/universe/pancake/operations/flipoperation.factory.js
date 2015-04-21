(function ()
{
	'use strict';

	angular
		.module('PLMApp')
		.factory('FlipOperation', FlipOperation);

	function FlipOperation()
	{
		var FlipOperation = function(data)
		{
			this.number = data.number;
		};
		
		FlipOperation.prototype.apply = function(currentWorld)
		{
			var length = currentWorld.panecakeStack.length;
			var clone = [];
			for(var i=0;i<currentWorld.panecakeStack.length;i++)
			{
				clone.push(currentWorld.panecakeStack[i]);
			}

			var j = 1;
			for(var i=this.number;i>1 && j<=i;i--)
			{
				currentWorld.panecakeStack[length-i] = clone[length-j];
				currentWorld.panecakeStack[length-j] = clone[length-i];
				j++;
			}
			
		};

		FlipOperation.prototype.reverse = function(currentWorld)
		{
			var length = currentWorld.panecakeStack.length;
			var clone = [];
			for(var i=0;i<currentWorld.panecakeStack.length;i++)
			{
				clone.push(currentWorld.panecakeStack[i]);
			}

			var j = 1;
			for(var i=this.number;i>1 && j<=i;i--)
			{
				currentWorld.panecakeStack[length-i] = clone[length-j];
				currentWorld.panecakeStack[length-j] = clone[length-i];
				j++;
			}
		};

		return FlipOperation;
	}
})();
