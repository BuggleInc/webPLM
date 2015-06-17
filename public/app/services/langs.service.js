(function () {
    'use strict';

    angular
        .module('PLMApp')
        .factory('langs', langs);

    langs.$inject = ['$rootScope', '$cookies', '$auth', 'gettextCatalog', 'listenersHandler', 'connection', 'blocklyService'];

    function langs($rootScope, $cookies, $auth, gettextCatalog, listenersHandler, connection, blocklyService) {
        var availableLangs = [];
        var selectedLang = $cookies.lang;

        listenersHandler.register('onmessage', handleMessage);
        connection.sendMessage('getLangs', {});

        var service = {
            getAvailableLangs: getAvailableLangs,
            updateAvailableLangs: updateAvailableLangs,
            getSelectedLang: getSelectedLang,
            setRemotelySelectedLang: setRemotelySelectedLang
        };

        return service;

        function handleMessage(data) {
            var cmd = data.cmd;
            var args = data.args;
            switch (cmd) {
            case 'langs':
                setSelectedLang(args.selected);
                updateAvailableLangs(args.availables);
                break;
            case 'newHumanLang':
                setSelectedLang(args.newHumanLang);
                break;
            }
        }

        function updateAvailableLangs(availables) {
            availableLangs = availables;
        }

        function getAvailableLangs()  {
            return availableLangs;
        }

        function getSelectedLang() {
            return selectedLang;
        }

        function setRemotelySelectedLang(lang) {
            connection.sendMessage('setLang', {
                'lang': lang.code
            });
        }

        function setSelectedLang(lang) {
            if (!$auth.isAuthenticated()) {
                $cookies.lang = lang.code;
            }
            selectedLang = lang;
            gettextCatalog.setCurrentLanguage(lang.code);
            blocklyService.updateMsg();
        }
    }
})();