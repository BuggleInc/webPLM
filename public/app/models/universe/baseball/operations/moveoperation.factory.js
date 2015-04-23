(function () 
{
	angular
		.module('PLMApp')
		.factory('MoveOperation', MoveOperation);

	function MoveOperation()
	{
		var MoveOperation = function(data)
		{
			this.base = data.base;
			this.position = data.position;
		}

		MoveOperation.prototype.apply = function (currentWorld)
		{

		};

		MoveOperation.prototype.reverse = function(currentWorld)
		{

		};

		return MoveOperation;
	}
})();