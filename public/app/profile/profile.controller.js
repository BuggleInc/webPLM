(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.controller('Profile', Profile);

	Profile.$inject = ['userService'];

	function Profile(userService) {
		var profile = this;

		profile.getUser = getUser;

		function getUser() {
			return userService.getUser();
		}
	}
})();