(function(){
	'use strict';
	
	angular
		.module('PLMApp')
		.factory('langs', langs);
	
	langs.$inject = ['$rootScope', '$cookies', 'gettextCatalog', 'listenersHandler', 'connection'];

	function langs ($rootScope, $cookies, gettextCatalog, listenersHandler, connection) {
		var availableLangs = [];
		var selectedLang = $cookies.lang;

		listenersHandler.register('onmessage', handleMessage);
		connection.sendMessage('getLangs', {});

		var service = {
			getAvailableLangs: getAvailableLangs,
			updateAvailableLangs: updateAvailableLangs,
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

		function getAvailableLangs() {
			return availableLangs;
		}

		function getSelectedLang() {
			return selectedLang;
		}

		function setSelectedLang (lang) {
			$cookies.lang = lang.code;
			selectedLang = lang;
			gettextCatalog.setCurrentLanguage(lang.code);
			$rootScope.$broadcast('newLangSelected');
		}
	}
})();