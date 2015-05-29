(function(){
    'use strict';
    
    angular
        .module('PLMApp')
        .factory('ide', ide);
    
    ide.$inject = ['listenersHandler', 'connection'];

	function ide(listenersHandler, connection) {
        
        var _code;
        var _codeEditor;
        var _currentProgrammingLanguage;
        var _isChangingProgLang;
        var _programmingLanguages;
        
        listenersHandler.register('onmessage', handleMessage);
        
        var service = {
            init: init,
            code: code,
            codeEditor: codeEditor,
            isChangingProgLang: isChangingProgLang,
            programmingLanguage: programmingLanguage,
            programmingLanguages: programmingLanguages,
            setIDEMode: setIDEMode,
            update: update
		};
		
		return service;
        
        function handleMessage(data) {
			var cmd = data.cmd;
			var args = data.args;
			switch(cmd) {
				case 'newProgLang':
					update(args.newProgLang, args.code);
                    _isChangingProgLang = false;
					break;
			}
		}
        
        function init(editorElt) {
            _code = '';
            _codeEditor = editorElt;
            _currentProgrammingLanguage = null;
            _isChangingProgLang = false;
            _programmingLanguages = [];
        }
        
        function code(newCode) {
            if(angular.isDefined(newCode)) {
                _code = newCode;
            }
            return _code;
        }
        
        function codeEditor() {
            return _codeEditor;
        }
        
        function isChangingProgLang(isChanging) {
            if(angular.isDefined(isChanging)) {
               _isChangingProgLang = isChanging;
            }
            return _isChangingProgLang;
        }
        
        function programmingLanguage(newLang) {
            if(angular.isDefined(newLang)) {
                _isChangingProgLang = true;
                connection.sendMessage('setProgrammingLanguage', { programmingLanguage: newLang.lang });
            }
            else {
                return _currentProgrammingLanguage;
            }
		}
        
        function programmingLanguages(progLangs, currentProgLang) {
            if(angular.isDefined(progLangs) && angular.isDefined(currentProgLang)) {
                _programmingLanguages = progLangs;

                for(var i = 0; i < _programmingLanguages.length; i++) {
                    var pl = _programmingLanguages[i];
                    if(pl.lang === currentProgLang) {
                       _currentProgrammingLanguage = pl;
                       setIDEMode(pl);
                    }
                }
            }
            return _programmingLanguages;
		}

        function setIDEMode(pl) {
			switch(pl.lang.toLowerCase()) {
				case 'java':
					_codeEditor.setOption('mode', 'text/x-java');
					break;
				case 'scala':
					_codeEditor.setOption('mode', 'text/x-scala');
					break;
				case 'c':
					_codeEditor.setOption('mode', 'text/x-csrc');
					break;
				case 'python':
					_codeEditor.setOption('mode', 'text/x-python');
					break;
			}
		}

        function update(pl, code) {
			if(pl !== null) {
				_currentProgrammingLanguage = pl;
				setIDEMode(pl);
			}
			if(code !== null) {
				_code = code;
			}
		}
    }
})();
