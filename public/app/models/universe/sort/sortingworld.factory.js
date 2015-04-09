(function()
{
	'use strict';

	angular
		.module('PlMApp')
		.factory('SortingWorld', SortingWorld);

	function SortingWorld()
	{
		var SortingWorld = function(world)
		{
			this.type = world.type;
			this.width = world.width;
			this.height = world.height;
			this.operations = [];
			this.currentState = -1;
			this.steps[];
		};

		SortingWorld.prototype.clone = function()
		{
			return new BuggleWorld(this);
		}

		return SortingWorld;
	}
})();