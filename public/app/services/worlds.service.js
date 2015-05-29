( function () {
    'use strict';
    
    angular
        .module('PLMApp')
        .factory('worlds', worlds);
    
    worlds.$inject = ['$timeout', '$interval',
                      'locker', 
                      'BuggleWorld', 'BatWorld', 'SortingWorld', 'DutchFlagWorld', 'PancakeWorld'];

	function worlds($timeout, $interval,
                     locker, 
                     BuggleWorld, BatWorld, SortingWorld, DutchFlagWorld, PancakeWorld) {
        
        var initialWorlds;
        var answerWorlds;
        var currentWorlds;
        var _currentWorld;
        var _currentWorldID;
        var _currentState;
        var _drawService;
        var _drawServiceType;
        var _isPlaying;
        var _isRunning;
        var _worldIDs;
        var _worldKind;
        var preventLoop;
        var lastStateDrawn;
        var updateModelLoop;
        var updateViewLoop;
        var _timer;
        
        var service = {
            init: init,
            currentWorld: currentWorld,
            setCurrentWorld: setCurrentWorld,
            currentWorldID: currentWorldID,
            currentState: currentState,
            drawServiceType: drawServiceType,
            setDrawService: setDrawService,
            isPlaying: isPlaying,
            isRunning: isRunning,
            timer: timer,
            worldIDs: worldIDs,
            worldKind: worldKind,
            getWorldsByKind: getWorldsByKind,
            getWorld: getWorld,
            setWorlds: setWorlds,
            startUpdateModelLoop: startUpdateModelLoop,
            startUpdateViewLoop: startUpdateViewLoop,
            updateModel: updateModel,
            updateView: updateView,
            handleOperations: handleOperations,
            replay: replay,
            setUpdateViewLoop: setUpdateViewLoop,
            reset: reset,
            resetAll: resetAll
        };
        
        return service;
        
        function init() {
            initialWorlds = {};
            answerWorlds = {};
            currentWorlds = {};
            _currentWorld = null;
            _currentState = -1;
            _drawService = null;
            _drawServiceType = '';
            _isPlaying = false;
            _isRunning = false;
            _currentWorldID = null;
            _worldKind = 'current';
            _worldIDs = [];
            preventLoop = false;
            lastStateDrawn = -1;
            updateModelLoop = null;
            updateViewLoop = null;
            _timer = locker.get('timer');
        }
        
        function currentWorld() {
            return _currentWorld;
        }
        
        function currentWorldID(id) {
            return arguments.length ? (_currentWorldID = id) : _currentWorldID;
        }
        
        function setCurrentWorld(worldKind) {
            $timeout.cancel(updateModelLoop);
            $interval.cancel(updateViewLoop);
            _worldKind = worldKind;
            _currentWorld = getWorldsByKind(_worldKind)[_currentWorldID];
            $timeout(function () {
                _currentState = _currentWorld.currentState;
            }, 0);
            _drawService.setWorld(_currentWorld);
        }
        
        function currentState(state) {
            if(arguments.length) {
                $timeout.cancel(updateModelLoop);
                $interval.cancel(updateViewLoop);
                _isPlaying = false;
                state = parseInt(state);
                _currentWorld.setState(state);
                _currentState = state;
                _drawService.update();
            }
            return _currentState;
        }
        
        function drawServiceType() {
            return _drawServiceType;
        }
        
        function setDrawService(ds, dst) {
            _drawService = ds;
            _drawServiceType = dst;
        }
        
        function isPlaying(playing) {
            return arguments.length ? (_isPlaying = playing) : _isPlaying;
        }
        
        function isRunning(running) {
            return arguments.length ? (_isRunning = running) : _isRunning;
        }
        
        function timer(time) {
            return arguments.length ? (_timer = time) : _timer;
        }
        
        function worldIDs() {
            return _worldIDs;
        }
        
        function worldKind() {
            return _worldKind;
        }
        
        function setUpdateViewLoop(uvl) {
            updateViewLoop = uvl;
        }
        
        function getWorldsByKind(wk) {
            var worlds;
            switch(wk) {
                case 'initial':
                    worlds = initialWorlds;
                    break;
                case 'current':
                    worlds = currentWorlds;
                    break;
                case 'answer':
                    worlds = answerWorlds;
                    break;
            }
            return worlds;
        }
        
        function getWorld(wid, wk) {
            return getWorldsByKind(wk)[wid];
        }
        
        function setWorlds(newSelectedWorldID, newInitalWorlds) {
            _currentWorldID = newSelectedWorldID;
            
            for(var worldID in newInitalWorlds) {
                if(newInitalWorlds.hasOwnProperty(worldID)) {
                    initialWorlds[worldID] = {};
				    var initialWorld = newInitalWorlds[worldID];
				    var world;
				    switch(initialWorld.type) {
                        case 'BuggleWorld':
                            world = new BuggleWorld(initialWorld);
                            break;
                        case 'BatWorld':
                            world = new BatWorld(initialWorld);
                            break;
                        case 'SortingWorld':
                            world = new SortingWorld(initialWorld);
                            break;
                        case 'DutchFlagWorld':
                            world = new DutchFlagWorld(initialWorld);
                            break;
                        case 'PancakeWorld':
                            world = new PancakeWorld(initialWorld);
                            break;
                    }
                    
                    initialWorlds[worldID] = world;
                    answerWorlds[worldID] = world.clone();
				    currentWorlds[worldID] = world.clone();
                }
            }
            
            _worldIDs = Object.keys(currentWorlds);
            
            setCurrentWorld('current');
        }
        
        function handleOperations(wID, wk, op) {
			var world = getWorldsByKind(wk)[wID];
			world.addOperations(op);
			if(world === _currentWorld && updateViewLoop === null) {
				_isPlaying = true;
				startUpdateModelLoop();
				startUpdateViewLoop();
			}
		}
        
        function replay() {
			reset(_currentWorldID, _worldKind, true);
			_isPlaying = true;
			startUpdateModelLoop();
			startUpdateViewLoop();
		}
        
        function reset(wID, wk, keepOp) {
			// We may want to keep the operations in order to replay the execution
			var operations = [];
			var steps = [];
            var worlds = getWorldsByKind(wk);
            
			if(keepOp === true) {
				operations = worlds[wID].operations;
				steps = worlds[wID].steps;
			}

			var initialWorld = initialWorlds[wID];
			worlds[wID] = initialWorld.clone();
			worlds[wID].operations = operations;
			worlds[wID].steps = steps;

			if(wID === _currentWorldID) {
				_currentState = -1;
				_currentWorld = worlds[wID];
				_drawService.setWorld(_currentWorld);
			}

			lastStateDrawn = -1;
			
			$timeout.cancel(updateViewLoop);
			_isPlaying = false;
		}
        
        function resetAll(wk, keepOp) {
            _worldIDs.map(function(key) {
				reset(key, wk, keepOp);
			});
        }
        
        function startUpdateModelLoop() {
			updateModelLoop = $timeout(updateModel, _timer);
		}
        
        function updateModel() {
			var currentState = _currentWorld.currentState;
			var nbStates = _currentWorld.operations.length-1;
			if(currentState !== nbStates) {
				_currentWorld.setState(++currentState);
				_currentState = currentState;
			}
			
			if(!_isRunning && currentState === nbStates){
				updateModelLoop = null;
				_isPlaying = false;
			}
			else {
				updateModelLoop = $timeout(updateModel, _timer);
			}
		}
        
        function startUpdateViewLoop() {
			updateViewLoop = $interval(updateView, 1/10);
		}
        
        function updateView() {
			if(lastStateDrawn !== _currentWorld.currentState) {
				_drawService.update();
				lastStateDrawn = _currentWorld.currentState;
			}

			if(!_isPlaying){
				$interval.cancel(updateViewLoop);
			}
		}
    }
})();
