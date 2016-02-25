(function () {
  'use strict';

  angular
    .module('PLMApp')
    .controller('Exercise', Exercise);

  Exercise.$inject = [
  '$window', '$http', '$scope', '$sce', '$stateParams',
  'connection', 'listenersHandler', 'langs', 'progLangs', 'exercisesList', 'navigation',
  'canvas', 'drawWithDOM',
  'blocklyService',
  '$timeout', '$interval',
  'locker',
  'BuggleWorld', 'BuggleWorldView',
  'BatWorld', 'BatWorldView',
  'TurtleWorld', 'TurtleWorldView',
  'SortingWorld', 'SortingWorldView',
  'SortingWorldSecondView',
  'DutchFlagWorld', 'DutchFlagView', 'DutchFlagSecondView',
  'PancakeWorld', 'PancakeView',
  'BaseballWorld', 'BaseballView', 'BaseballSecondView',
  'HanoiWorld', 'HanoiView'
 ];

  function Exercise($window, $http, $scope, $sce, $stateParams,
    connection, listenersHandler, langs, progLangs, exercisesList, navigation,
    canvas, drawWithDOM,
    blocklyService,
    $timeout, $interval,
    locker,
    BuggleWorld, BuggleWorldView,
    BatWorld, BatWorldView,
    TurtleWorld, TurtleWorldView,
    SortingWorld, SortingWorldView, SortingWorldSecondView,
    DutchFlagWorld, DutchFlagView, DutchFlagSecondView,
    PancakeWorld, PancakeView,
    BaseballWorld, BaseballView, BaseballSecondView,
    HanoiWorld, HanoiView) {

    var exercise = this;

    var panelID = 'panel';
    var canvasID = 'canvas';

    exercise.connection = connection;
    exercise.langs = langs;
    
    exercise.tabs = [];
    exercise.currentTab = 0;
    exercise.drawFnct = null;

    exercise.lessonID = $stateParams.lessonID;
    exercise.lessonName = exercise.lessonID.charAt(0).toUpperCase() + exercise.lessonID.slice(1);
    exercise.id = $stateParams.exerciseID;

    exercise.isRunning = false;
    exercise.isPlaying = false;
    exercise.playedDemo = false;

    exercise.instructions = null;
    exercise.api = null;
    exercise.resultType = null;
    exercise.result = '';
    exercise.logs = '';

    exercise.nonImplementedWorldException = false;

    exercise.initialWorlds = {};
    exercise.answerWorlds = {};
    exercise.currentWorlds = {};
    exercise.currentWorld = null;
    exercise.currentWorldID = null;
    exercise.worldKind = 'current';
    exercise.worldIDs = []; // Mandatory to generate dynamically the select
    exercise.updateModelLoop = null;
    exercise.updateViewLoop = null;

    locker.bind($scope, 'timer', 1000);
    $scope.timer = locker.get('timer');

    exercise.currentState = -1;
    exercise.lastStateDrawn = -1;

    locker.bind($scope, 'showInstructions', true);
    $scope.showInstructions = locker.get('showInstructions');
    locker.bind($scope, 'showCodeEditor', true);
    $scope.showCodeEditor = locker.get('showCodeEditor');
    locker.bind($scope, 'showAPI', false);
    $scope.showAPI = locker.get('showAPI');

    exercise.currentProgrammingLanguage = null;
    exercise.programmingLanguages = [];

    exercise.editor = null;
    exercise.ide = 'codemirror';
    exercise.toolbox = null;
    exercise.studentCode = null;

    exercise.drawServiceType = '';
    exercise.drawService = null;
    exercise.drawingArea = 'drawingArea';

    exercise.objectiveViewNeeded = false;
    exercise.animationPlayerNeeded = false;
    exercise.secondViewNeeded = false;
    exercise.displaySecondView = false;

    exercise.instructionsIsFullScreen = false;
    exercise.instructionsClass = '';
    exercise.worldsViewClass = '';

    exercise.runDemo = runDemo;
    exercise.runCode = runCode;
    exercise.reset = reset;
    exercise.replay = replay;
    exercise.stopExecution = stopExecution;
    exercise.setWorldState = setWorldState;
    exercise.setCurrentWorld = setCurrentWorld;
    exercise.switchToTab = switchToTab;
    exercise.toggleAPI = toggleAPI;

    exercise.resetExercise = resetExercise;
    exercise.resizeInstructions = resizeInstructions;
    exercise.resizeCanvas = resizeCanvas;

    exercise.readTip = readTip;
    
    exercise.idle = false;

    startIdleLoop();

    function signalIdle() {
      // User is away
      exercise.idle = true;
      connection.sendMessage('userIdle', {});
    }

    function startIdleLoop() {
      exercise.idleLoop = $timeout(signalIdle, 5 * 60 * 1000); // 5 min
    }

    function resetIdleLoop() {
      if (exercise.idle === false) {
        $timeout.cancel(exercise.idleLoop);
      } else {
        // User is back
        exercise.idle = false;
        connection.sendMessage('userBack', {});
      }
      // Save the editor content in the local storage
      $window.localStorage.setItem("editor." + exercise.id, editor.getValue());
      startIdleLoop();
    }

    $scope.codemirrorLoaded = function (_editor) {
      exercise.editor = _editor;
      window.editor = _editor; // To allow tests to interact with the editor
      exercise.editor.on('change', resetIdleLoop);
      resizeCodeMirror();
    };

    function getExercise() {
      var args = {
        lessonID: exercise.lessonID
      };
      if (exercise.id !== '') {
        args.exerciseID = exercise.id;
      }
      connection.sendMessage('getExercise', args);
    }

    var offDisplayMessage = listenersHandler.register('onmessage', handleMessage);
    getExercise();

    function handleMessage(data) {
      console.log('message received: ', data);
      var cmd = data.cmd;
      var args = data.args;
      switch (cmd) {
      case 'exercise':
        setExercise(args.exercise);
        break;
      case 'executionResult':
        handleResult(args);
        break;
      case 'demoEnded':
        console.log('The demo ended!');
        exercise.isRunning = false;
        break;
      case 'operations':
        var buffer = getOperationsBuffer(args.buffer);
        buffer.forEach(function (item) {
          if (item.worldID) {
            handleOperations(item.worldID, 'current', item.operations);
          } else if (item.type) {
            handleOut(item.msg);
          }
        });
        break;
      case 'log':
        exercise.logs += args.msg;
        break;
      case 'newProgLang':
        updateUI(args.newProgLang, args.instructions, args.api, args.code);
        break;
      case 'newHumanLang':
        updateUI(exercise.currentProgrammingLanguage, args.instructions, args.api, null);
        break;
      }
    }

    function setExercise(data) {
      exercise.id = data.id;
      exercise.name = data.id.split('.').pop();

      var editorValue = $window.localStorage.getItem("editor." + exercise.id);
      if (editorValue != null)
          editor.setValue(editorValue);
      
      navigation.setInlesson(true);
      navigation.setCurrentPageTitle(exercise.lessonName + ' / ' + exercise.name);

      exercise.instructions = $sce.trustAsHtml(data.instructions);
      exercise.api = $sce.trustAsHtml(data.api);
      exercise.code = data.code.trim();
      exercise.currentWorldID = data.selectedWorldID;

      if (data.exception === 'nonImplementedWorldException') {
        exercise.nonImplementedWorldException = true;
      }

      if (!exercise.nonImplementedWorldException) {
        if (data.toolbox) {
          setToolbox(data.toolbox);
        }
        for (var worldID in data.initialWorlds) {
          if (data.initialWorlds.hasOwnProperty(worldID)) {
            exercise.initialWorlds[worldID] = {};
            var initialWorld = data.initialWorlds[worldID];
            data.initialWorlds[worldID].id = worldID;
            var world;
            exercise.nameWorld = initialWorld.type;
            switch (initialWorld.type) {
            case 'BuggleWorld':
              exercise.tabs = [
                {
                  name: 'World',
                  worldKind: 'current',
                  tabNumber: 0,
                  drawFnct: BuggleWorldView.draw
         },
                {
                  name: 'Objective',
                  worldKind: 'answer',
                  tabNumber: 1,
                  drawFnct: BuggleWorldView.draw
         }
        ];
              exercise.objectiveViewNeeded = true;
              exercise.animationPlayerNeeded = true;
              world = new BuggleWorld(initialWorld);
              initCanvas(BuggleWorldView.draw);
              exercise.drawFnct = BuggleWorldView.draw;
              break;
            case 'BatWorld':
              exercise.tabs = [
                {
                  name: 'World',
                  worldKind: 'current',
                  tabNumber: 0,
                  drawFnct: BatWorldView.draw
         }
        ];
              exercise.drawFnct = BatWorldView.draw;
              world = new BatWorld(initialWorld);
              BatWorldView.setScope($scope);
              initDrawWithDOM(BatWorldView.draw);
              break;
            case 'TurtleWorld':
              exercise.tabs = [
                {
                  name: 'World',
                  worldKind: 'current',
                  tabNumber: 0,
                  drawFnct: TurtleWorldView.draw
          },
                {
                  name: 'Objective',
                  worldKind: 'answer',
                  tabNumber: 1,
                  drawFnct: TurtleWorldView.draw
          }
        ];
                exercise.objectiveViewNeeded = true;
                exercise.animationPlayerNeeded = true;
                world = new TurtleWorld(initialWorld);
                exercise.drawFnct = TurtleWorldView.draw;
                initCanvas(exercise.drawFnct);
                break;
            case 'SortingWorld':
              exercise.tabs = [
                {
                  name: 'World',
                  worldKind: 'current',
                  tabNumber: 0,
                  drawFnct: SortingWorldView.draw
         },
                {
                  name: 'Objective',
                  worldKind: 'answer',
                  tabNumber: 1,
                  drawFnct: SortingWorldView.draw
         },
                {
                  name: 'ChronoView',
                  worldKind: 'current',
                  tabNumber: 2,
                  drawFnct: SortingWorldSecondView.draw
         },
                {
                  name: 'ChronoDemo',
                  worldKind: 'answer',
                  tabNumber: 3,
                  drawFnct: SortingWorldSecondView.draw
         }
        ];
              exercise.drawFnct = SortingWorldView.draw;
              exercise.objectiveViewNeeded = true;
              exercise.animationPlayerNeeded = true;
              exercise.secondViewNeeded = true;
              world = new SortingWorld(initialWorld);
              initCanvas(SortingWorldView.draw);
              break;
            case 'DutchFlagWorld':
              exercise.tabs = [
                {
                  name: 'World',
                  worldKind: 'current',
                  tabNumber: 0,
                  drawFnct: DutchFlagView.draw
         },
                {
                  name: 'Objective',
                  worldKind: 'answer',
                  tabNumber: 1,
                  drawFnct: DutchFlagView.draw
         },
                {
                  name: 'ChronoView',
                  worldKind: 'current',
                  tabNumber: 2,
                  drawFnct: DutchFlagSecondView.draw
         },
                {
                  name: 'ChronoDemo',
                  worldKind: 'answer',
                  tabNumber: 3,
                  drawFnct: DutchFlagSecondView.draw
         }
        ];
              exercise.drawFnct = DutchFlagView.draw;
              exercise.objectiveViewNeeded = true;
              exercise.animationPlayerNeeded = true;
              exercise.secondViewNeeded = true;
              world = new DutchFlagWorld(initialWorld);
              initCanvas(DutchFlagView.draw);
              break;
            case 'PancakeWorld':
              exercise.tabs = [
                {
                  name: 'World',
                  worldKind: 'current',
                  tabNumber: 0,
                  drawFnct: PancakeView.draw
         },
                {
                  name: 'Objective',
                  worldKind: 'answer',
                  tabNumber: 1,
                  drawFnct: PancakeView.draw
         }
        ];
              exercise.drawFnct = PancakeView.draw;
              exercise.objectiveViewNeeded = true;
              exercise.animationPlayerNeeded = true;
              world = new PancakeWorld(initialWorld);
              initCanvas(PancakeView.draw);
              break;
            case 'BaseballWorld':
              exercise.tabs = [
                {
                  name: 'World',
                  worldKind: 'current',
                  tabNumber: 0,
                  drawFnct: BaseballView.draw
        },
                {
                  name: 'Objective',
                  worldKind: 'answer',
                  tabNumber: 1,
                  drawFnct: BaseballView.draw
        },
                {
                  name: 'ChronoView',
                  worldKind: 'current',
                  tabNumber: 2,
                  drawFnct: BaseballSecondView.draw
        },
                {
                  name: 'ChronoDemo',
                  worldKind: 'answer',
                  tabNumber: 3,
                  drawFnct: BaseballSecondView.draw
        }
        ];
              exercise.drawFnct = BaseballView.draw;
              exercise.objectiveViewNeeded = true;
              exercise.animationPlayerNeeded = true;
              exercise.secondViewNeeded = true;
              world = new BaseballWorld(initialWorld);
              initCanvas(BaseballView.draw);
              break;
            case 'HanoiWorld':
              exercise.tabs = [
                {
                  name: 'World',
                  worldKind: 'current',
                  tabNumber: 0,
                  drawFnct: HanoiView.draw
        },
                {
                  name: 'Objective',
                  worldKind: 'answer',
                  tabNumber: 1,
                  drawFnct: HanoiView.draw
        }
        ];
              exercise.drawFnct = HanoiView.draw;
              exercise.objectiveViewNeeded = true;
              exercise.animationPlayerNeeded = true;
              world = new HanoiWorld(initialWorld);
              initCanvas(HanoiView.draw);
              break;
            }
            world.id = worldID;
            exercise.initialWorlds[worldID] = world;
            exercise.answerWorlds[worldID] = world.clone();
            exercise.currentWorlds[worldID] = world.clone();
          }
        }

        exercise.worldIDs = Object.keys(exercise.currentWorlds);

        setCurrentWorld(exercise.currentWorldID, 'current');

        window.addEventListener('resize', resizeCodeMirror, false);

        progLangs.setProgLangs(data.programmingLanguages);
        var progLang = data.programmingLanguages[0];
        for (var i = 0; i < data.programmingLanguages.length; i++) {
          var pl = data.programmingLanguages[i];
          if (pl.lang === data.currentProgrammingLanguage) {
            progLang = pl;
          }
        }
        progLangs.setCurrentProglang(progLang);
        updateUI(progLang, data.instructions, data.api, data.code.trim());
      }

      $(document).foundation('dropdown', 'reflow');
      $(document).foundation('equalizer', 'reflow');

      exercise.resultType = null;
      exercise.result = '';
      exercise.logs = '';
      exercisesList.setCurrentLessonID(exercise.lessonID);

    }

    function updateInstructions(instructions, api) {
      exercise.instructions = $sce.trustAsHtml(instructions);
      exercise.api = $sce.trustAsHtml(api);
    }

    function setCurrentWorld(worldID, worldKind) {
      $timeout.cancel(exercise.updateModelLoop);
      $interval.cancel(exercise.updateViewLoop);
      exercise.currentWorldID = worldID;
      exercise.worldKind = worldKind;
      exercise.currentWorld = exercise[exercise.worldKind + 'Worlds'][exercise.currentWorldID];
      $timeout(function () {
        exercise.currentState = exercise.currentWorld.currentState;
      }, 0);
      exercise.drawService.setWorld(exercise.currentWorld);
    }

    function runDemo() {
      exercise.updateViewLoop = null;
      exercise.isPlaying = true;
      if (!exercise.playedDemo) {
        $http.get("assets/json/demos/" + exercise.id + ".json").success(function(data){
          console.log('data: ', data);
          data.forEach(function(args) {
            handleOperations(args.worldID, 'answer', args.operations);
          });
          exercise.playedDemo = true;
        });
      } else {
        // We don't need to query the server again
        // Just to replay the animation
        replay();
      }
    }

    function runCode(worldID) {
      var args;
      exercise.result = '';
      exercise.resultType = null;
      exercise.updateViewLoop = null;
      exercise.isPlaying = true;
      exercise.worldIDs.map(function (key) {
        reset(key, 'current', false);
      });
      setCurrentWorld(worldID, 'current');
      exercise.tabs.map(function (element) {
        if (element.worldKind === 'current' && element.drawFnct === exercise.drawFnct) {
          exercise.currentTab = element.tabNumber;
        }
      })
      if (exercise.ide === 'blockly') {
        Blockly.Python.INFINITE_LOOP_TRAP = null;
        exercise.code = Blockly.Python.workspaceToCode();
        var xml = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
        exercise.studentCode = Blockly.Xml.domToText(xml);

        args = {
          lessonID: exercise.lessonID,
          exerciseID: exercise.id,
          code: exercise.code,
          workspace: exercise.studentCode
        };
      } else {
        args = {
          lessonID: exercise.lessonID,
          exerciseID: exercise.id,
          code: exercise.code
        };
      }
      connection.sendMessage('runExercise', args);
      exercise.isRunning = true;
    }

    function stopExecution() {
      connection.sendMessage('stopExecution', null);
    }

    function handleResult(data) {
      var msgType = data.msgType;
      var msg = data.msg;
      console.log(msgType, ' - ', msg);
      exercise.result += msg;
      if (msgType === 1) {
        $('#successModal').foundation('reveal', 'open');
      }
      exercise.resultType = msgType;
      exercise.display = 'result';
      exercise.isRunning = false;
    }

    function reset(worldID, worldKind, keepOperations) {
      // We may want to keep the operations in order to replay the execution
      var operations = [];
      var steps = [];
      if (keepOperations === true) {
        operations = exercise[worldKind + 'Worlds'][worldID].operations;
        steps = exercise[worldKind + 'Worlds'][worldID].steps;
      }

      var initialWorld = exercise.initialWorlds[worldID];
      exercise[worldKind + 'Worlds'][worldID] = initialWorld.clone();
      exercise[worldKind + 'Worlds'][worldID].operations = operations;
      exercise[worldKind + 'Worlds'][worldID].steps = steps;

      if (worldID === exercise.currentWorldID) {
        exercise.currentState = -1;
        exercise.currentWorld = exercise[worldKind + 'Worlds'][worldID];
        exercise.drawService.setWorld(exercise.currentWorld);
      }

      exercise.lastStateDrawn = -1;

      $timeout.cancel(exercise.updateModelLoop);
      $timeout.cancel(exercise.updateViewLoop);
      exercise.isPlaying = false;
    }

    function replay() {
      reset(exercise.currentWorldID, exercise.worldKind, true);
      exercise.isPlaying = true;
      startUpdateModelLoop();
      startUpdateViewLoop();
    }

    function handleOperations(worldID, worldKind, operations) {
      var world = exercise[worldKind + 'Worlds'][worldID];
      world.addOperations(operations);
      if (world === exercise.currentWorld && exercise.updateViewLoop === null) {
        exercise.isPlaying = true;
        startUpdateModelLoop();
        startUpdateViewLoop();
      }
    }

	function handleOut(msg) {
      exercise.result += msg;
	}

    function startUpdateModelLoop() {
      exercise.updateModelLoop = $timeout(updateModel, $scope.timer);
    }

    function updateModel() {
      var currentState = exercise.currentWorld.currentState;
      var nbStates = exercise.currentWorld.operations.length - 1;
      if (currentState !== nbStates) {
        exercise.currentWorld.setState(++currentState);
        exercise.currentState = currentState;
      }

      if (!exercise.isRunning && currentState === nbStates) {
        exercise.updateModelLoop = null;
        exercise.isPlaying = false;
      } else {
        exercise.updateModelLoop = $timeout(updateModel, $scope.timer);
      }
    }

    function startUpdateViewLoop() {
      exercise.updateViewLoop = $interval(updateView, 1 / 10);
    }

    function updateView() {
      if (exercise.lastStateDrawn !== exercise.currentWorld.currentState) {
        exercise.drawService.update();
        exercise.lastStateDrawn = exercise.currentWorld.currentState;
      }

      if (!exercise.isPlaying) {
        $interval.cancel(exercise.updateViewLoop);
      }
    }

    function setWorldState(state) {
      resetIdleLoop();
      $timeout.cancel(exercise.updateModelLoop);
      $interval.cancel(exercise.updateViewLoop);
      exercise.isPlaying = false;
      state = parseInt(state);
      exercise.currentWorld.setState(state);
      exercise.currentState = state;
      exercise.drawService.update();
    }

    function resetExercise() {
      $('#resetExerciseModal').foundation('reveal', 'close');
      connection.sendMessage('revertExercise', {});
    }

    $scope.$on('$destroy', function () {
      offDisplayMessage();
      $timeout.cancel(exercise.idleLoop);
      $timeout.cancel(exercise.updateModelLoop);
      $interval.cancel(exercise.updateViewLoop);
      if(!exercise.nonImplementedWorldException) {
        exercise.initialWorlds = {};
        exercise.answerWorlds = {};
        exercise.currentWorlds = {};
        exercise.currentWorld = null;
        exercise.drawService.setWorld(null);
      }
      exercise.instructions = null;
      exercise.api = null;
      exercise.resultType = null;
      exercise.result = null;
      exercise.logs = null;
      window.removeEventListener('resize', resizeCanvas, false);
      window.removeEventListener('resize', resizeCodeMirror, false);
    });

    function initCanvas(draw) {
      var canvasElt;
      var canvasWidth;
      var canvasHeight;

      exercise.drawServiceType = 'canvas';
      exercise.drawService = canvas;

      canvasElt = document.getElementById(canvasID);
      canvasWidth = $('#' + exercise.drawingArea).parent().width();
      canvasHeight = canvasWidth;

      canvas.init(canvasElt, canvasWidth, canvasHeight, draw);

      window.addEventListener('resize', resizeCanvas, false);
    }

    function initDrawWithDOM(draw) {
      var domElt;
      var panelWidth;

      exercise.drawServiceType = 'drawWithDOM';
      exercise.drawService = drawWithDOM;

      domElt = $('#' + panelID);
      panelWidth = $('#' + exercise.drawingArea).parent().width();
      domElt.css('height', panelWidth);
      domElt.css('overflow-y', 'auto');

      drawWithDOM.init(domElt, draw);
    }

    function resizeCanvas() {
      var canvasWidth = $('#' + exercise.drawingArea).parent().width();
      var canvasHeight = canvasWidth;
      exercise.drawService.resize(canvasWidth, canvasHeight);
      $(document).foundation('equalizer', 'reflow');
    }

    function resizeCodeMirror() {
      // Want to keep the IDE's height equals to the draw surface's one
      var drawingAreaHeight = $('ui-codemirror').parent().parent().height() * 0.8;
      exercise.editor.setSize(null, drawingAreaHeight);
      exercise.editor.refresh();
    }

    function switchToTab(tab) {
      resetIdleLoop();
      exercise.currentTab = tab.tabNumber;
      if (exercise.drawFnct !== tab.drawFnct) {
        setDrawFnct(tab.drawFnct);
      }
      if (exercise.worldKind !== tab.worldKind) {
        setCurrentWorld(exercise.currentWorldID, tab.worldKind);
        if (!exercise.playedDemo && tab.worldKind === 'answer') {
          runDemo();
        }
      }
    }
    
    function setDrawFnct(drawFnct) {
      exercise.drawService.setDraw(drawFnct);
      exercise.drawFnct = drawFnct;
      exercise.drawService.update();
    }

    function resizeInstructions() {
      if (!exercise.instructionsIsFullScreen) {
        exercise.instructionsIsFullScreen = true;
        exercise.instructionsClass = 'instructions-fullscreen';
        exercise.worldsViewClass = 'worlds-view-reduce';
      } else {
        exercise.instructionsIsFullScreen = false;
        exercise.instructionsClass = '';
        exercise.worldsViewClass = '';
      }
    }

    function updateToolbox() {
      if (exercise.toolbox !== null) {
        Blockly.languageTree = exercise.toolbox;
      }
      Blockly.Toolbox.populate_();
    }

    function setToolbox(toolbox) {
      if (toolbox !== '<no blocks>') {
        exercise.toolbox = JSON.parse(toolbox);
      } else {
        exercise.toolbox = blocklyService.getOptions().toolbox;
      }
      updateToolbox();
    }

    function setIDEMode(pl) {
      if (exercise.editor) {
        switch (pl.lang.toLowerCase()) {
        case 'java':
          exercise.editor.setOption('mode', 'text/x-java');
          break;
        case 'scala':
          exercise.editor.setOption('mode', 'text/x-scala');
          break;
        case 'c':
          exercise.editor.setOption('mode', 'text/x-csrc');
          break;
        case 'python':
          exercise.editor.setOption('mode', 'text/x-python');
          break;
        }
      }
    }

    function toggleAPI() {
      $scope.showAPI = !$scope.showAPI;
      $scope.showInstructions = !$scope.showInstructions;
      if($scope.showInstructions) {
        $timeout(exercise.resizeCanvas, 0);
      }
    }
    
    function updateUI(pl, instructions, api, code) {
      if (pl !== null) {
        if (pl.lang === 'Blockly') {
          exercise.ide = 'blockly';
          if (code !== null) {
            exercise.studentCode = code;
            if (exercise.studentCode !== '') {
              var xml = Blockly.Xml.textToDom(exercise.studentCode);
              Blockly.getMainWorkspace().clear();
              Blockly.Xml.domToWorkspace(Blockly.getMainWorkspace(), xml);
              $timeout(function () {
                var blocks = Blockly.getMainWorkspace().getAllBlocks();
                for (var i = 0; i < blocks.length; i++) {
                  blocks[i].render();
                }
              }, 0);
            }
          }
          updateToolbox();
        } else {
          if (exercise.ide === 'blockly') {
            Blockly.getMainWorkspace().clear();
          }
          exercise.ide = 'codemirror';
          setIDEMode(pl);
          if (code !== null)
            exercise.code = code;
          $timeout(function () {
            exercise.editor.refresh();
          }, 0);
        }
      }
      updateInstructions(instructions, api);
    }
  }
  function readTip(tipID) {
    this.connection.sendMessage('readTip', { tipID: tipID+'' });
  }
  
  function getOperationsBuffer(buffer) {
    if (buffer.constructor !== Array) {
      return JSON.parse(buffer);
    }
    return buffer;
  }
})();