(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('langs', langs);
	
	langs.$inject = ['$rootScope', '$cookies', 'listenersHandler', 'connection'];

	function langs ($rootScope, $cookies, listenersHandler, connection) {
		var availableLangs;
		var selectedLang;

		listenersHandler.register('onmessage', handleMessage);

		var service = {
			getAvailableLangs: getAvailableLangs,
			getSelectedLang: getSelectedLang,
			setSelectedLang: setSelectedLang
		};
		
		return service;
		
		function handleMessage(data) {
			var cmd = data.cmd;
			var args = data.args;
			switch(cmd) {
				case 'langs':
					setSelectedLang(args.selected);
					updateAvailableLangs(args.availables);
					break;
			}
		}

		function updateAvailableLangs(availables) {
			availableLangs = availables;
			$rootScope.$broadcast('availableLangsReady');
		}

		function getSelectedLang() {
			return selectedLang;
		}

		function setSelectedLang (lang) {
			$cookie.put('lang', lang.code);
			selectedLang = lang;			
		}
	}
})();