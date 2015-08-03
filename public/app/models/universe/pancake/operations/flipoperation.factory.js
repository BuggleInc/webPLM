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
            this.oldNumber = data.oldNumber;
		};
		
		FlipOperation.prototype.apply = function(currentWorld)
		{
			var length = currentWorld.pancakeStack.length;
			var clone = [];
			for(var i=0;i<currentWorld.pancakeStack.length;i++)
			{
				clone.push(currentWorld.pancakeStack[i]);
			}

			var j = 1;
			if(this.number === 1)
				currentWorld.pancakeStack[length-1].upsideDown = !currentWorld.pancakeStack[length-1].upsideDown;
			for(var i=this.number;i>1 && j<=i;i--)
			{	
				currentWorld.pancakeStack[length-i] = clone[length-j];
				currentWorld.pancakeStack[length-i].upsideDown = !currentWorld.pancakeStack[length-i].upsideDown;
				
				currentWorld.pancakeStack[length-j] = clone[length-i];
				if(i != j) {
					currentWorld.pancakeStack[length-j].upsideDown = !currentWorld.pancakeStack[length-j].upsideDown;
				}
				j++;

			}

			currentWorld.moveCount++;
			currentWorld.numberFlip = this.number;
			
		};

		FlipOperation.prototype.reverse = function(currentWorld)
		{
			var length = currentWorld.pancakeStack.length;
			var clone = [];
			for(var i=0;i<currentWorld.pancakeStack.length;i++)
			{
				clone.push(currentWorld.pancakeStack[i]);
			}

			var j = 1;
            if(this.number === 1)
				currentWorld.pancakeStack[length-1].upsideDown = !currentWorld.pancakeStack[length-1].upsideDown;
			for(var i=this.number;i>1 && j<=i;i--)
			{
				currentWorld.pancakeStack[length-i] = clone[length-j];
				currentWorld.pancakeStack[length-i].upsideDown = !currentWorld.pancakeStack[length-i].upsideDown;

				currentWorld.pancakeStack[length-j] = clone[length-i];
				if(i != j)
					currentWorld.pancakeStack[length-j].upsideDown = !currentWorld.pancakeStack[length-j].upsideDown;
				j++;
			}

			currentWorld.moveCount--;
			currentWorld.numberFlip = this.oldNumber;
		};

		return FlipOperation;
	}
})();
