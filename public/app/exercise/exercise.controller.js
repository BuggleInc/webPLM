(function () {
  'use strict';

  angular
    .module('PLMApp')
    .controller('Exercise', Exercise);

  Exercise.$inject = [
    '$window', '$http', '$scope', '$sce', '$state', '$stateParams', '$location', '$anchorScroll',
    'connection', 'messageQueue', 'listenersHandler', 'langs', 'progLangs', 'exercisesList', 'navigation', 'toasterUtils',
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

  function Exercise($window, $http, $scope, $sce, $state, $stateParams, $location, $anchorScroll,
    connection, messageQueue, listenersHandler, langs, progLangs, exercisesList, navigation, toasterUtils,
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

    var exercise, panelID, canvasID;

    exercise = this;

    panelID = 'panel';
    canvasID = 'canvas';

    exercise.connection = connection;
    exercise.langs = langs;

    exercise.tabs = [];
    exercise.currentTab = 0;
    exercise.drawFnct = null;

    exercise.lessonID = $stateParams.lessonID;
    exercise.lessonName = exercise.lessonID.charAt(0).toUpperCase() + exercise.lessonID.slice(1);
    exercise.id = $stateParams.exerciseID;

    exercise.executionStopped = false;
    exercise.isRunning = false;
    exercise.isPlaying = false;
    exercise.playedDemo = false;

    exercise.instructions = null;
    exercise.help = null;
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
    exercise.animationOnGoing = false;
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
      var cmd, args, worldKind;
      console.log('message received: ', data);

      cmd = data.cmd;
      args = data.args;
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
      case 'demoOperations':
        worldKind = 'current';
        if (cmd === 'demoOperations') {
          worldKind = 'answer';
          exercise.playedDemo = true;
        }
        if (args.worldID) {
          handleOperations(args.worldID, worldKind, args.steps);
        } else if (args.type) {
          handleOut(args.msg);
        }
        break;
      case 'ack':
        exercise.result += 'Processing your execution request...\n';
      case 'log':
        exercise.logs += args.msg;
        break;
      case 'newProgLang':
        updateInstructions(args.instructions, args.help);
        updateCodeEditor(args.newProgLang, args.code);
        break;
      case 'newHumanLang':
        updateInstructions(args.instructions, args.help);
        break;
      case 'exerciseNotFound':
        toasterUtils.warning('Exercise ' + exercise.id + ' not found, you\'ve been redirect to the lesson\'s first exercise.');
        $state.go('exercise', { 'lessonID': exercise.lessonID }, { inherit: false });
        break;
      case 'lessonNotFound':
        toasterUtils.warning('Lesson ' + exercise.lessonID + ' not found, you\'ve been redirect to the homepage.');
        $state.go('home');
        break;
      case 'reset':
        exercise.code = args.defaultCode;
        break;
      case 'subscribe':
        messageQueue.subscribe(args.clientQueue, handleMessage);
        break;
      case 'unsubscribe':
        messageQueue.unsubscribe();
        break;
      }
    }

    function setExercise(data) {
      exercise.id = data.id;
      exercisesList.setCurrentExerciseID(exercise.id);
      exercise.name = data.name;

      navigation.setInlesson(true);
      navigation.setCurrentPageTitle(exercise.lessonName + ' / ' + exercise.name);

      exercise.currentWorldID = data.selectedWorldID;

      if (data.exception === 'nonImplementedWorldException') {
        exercise.nonImplementedWorldException = true;
      }

      if (!exercise.nonImplementedWorldException) {
        if (data.toolbox) {
          setToolbox(data.toolbox);
        }
        for (var i=0; i<data.initialWorlds.length; i++) {
          var dataInitialWorld = data.initialWorlds[i];
          var dataAnswerWorld = data.answerWorlds[i];
          var worldID = dataInitialWorld.name;
          dataInitialWorld.id = worldID;
          var world, answerWorld;
          var worldType = dataInitialWorld.type.split('.').pop();
          switch (worldType) {
          case 'BuggleWorld':
          case 'TurmiteWorld':
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
            world = new BuggleWorld(dataInitialWorld);
            answerWorld = new BuggleWorld(dataAnswerWorld);
            initCanvas(BuggleWorldView.draw);
            exercise.drawFnct = BuggleWorldView.draw;
            break;
          case 'BatWorld':
          case 'ConsWorld':
            exercise.tabs = [
              {
                name: 'World',
                worldKind: 'current',
                tabNumber: 0,
                drawFnct: BatWorldView.draw
              }
            ];
            exercise.drawFnct = BatWorldView.draw;
            world = new BatWorld(dataInitialWorld);
            answerWorld = new BatWorld(dataAnswerWorld);
            world.setExpected(answerWorld);
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
            world = new TurtleWorld(dataInitialWorld);
            answerWorld = new TurtleWorld(dataAnswerWorld);
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
            world = new SortingWorld(dataInitialWorld);
            answerWorld = new SortingWorld(dataAnswerWorld);
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
            world = new DutchFlagWorld(dataInitialWorld);
            answerWorld = new DutchFlagWorld(dataAnswerWorld);
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
            world = new PancakeWorld(dataInitialWorld);
            answerWorld = new PancakeWorld(dataAnswerWorld);
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
            world = new BaseballWorld(dataInitialWorld);
            answerWorld = new BaseballWorld(dataAnswerWorld);
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
            world = new HanoiWorld(dataInitialWorld);
            answerWorld = new HanoiWorld(dataAnswerWorld);
            initCanvas(HanoiView.draw);
            break;
          }
          world.id = worldID;
          answerWorld.id = worldID;
          exercise.initialWorlds[worldID] = world;
          exercise.answerWorlds[worldID] = answerWorld;
          exercise.currentWorlds[worldID] = world.clone();
        }

        exercise.worldIDs = Object.keys(exercise.currentWorlds);

        setCurrentWorld(exercise.currentWorldID, 'current');

        window.addEventListener('resize', resizeCodeMirror, false);

        updateInstructions(data.instructions, data.help);
        updateCodeEditor(progLangs.getCurrentProgLang(), data.code.trim());
      }

      $(document).foundation('dropdown', 'reflow');
      $(document).foundation('equalizer', 'reflow');

      exercise.resultType = null;
      exercise.result = '';
      exercise.logs = '';

      exercisesList.setCurrentLessonID(exercise.lessonID);
    }

    function updateInstructions(instructions, help) {
      exercise.instructions = instructions;
      exercise.help = $sce.trustAsHtml(help);
    }

    function setCurrentWorld(worldID, worldKind) {
      $timeout.cancel(exercise.updateModelLoop);
      stopUpdateViewLoop();
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
      connection.sendMessage('runDemo', {});
    }

    function runCode(worldID) {
      var args;

      // Cancel the previous subscription before all
      messageQueue.unsubscribe();

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
      exercise.executionStopped = false;

      $location.hash(exercise.drawingArea);
      $anchorScroll();
    }

    function stopExecution() {
      exercise.executionStopped = true;
      exercise.isPlaying = false;
      messageQueue.unsubscribe();
      $timeout.cancel(exercise.updateModelLoop);
      stopUpdateViewLoop();
      connection.sendMessage('stopExecution', null);
    }

    function handleResult(data) {
      var nbStates, msg, msgType, unbindListener;

      exercise.isRunning = false;

      nbStates = exercise.currentWorld.operations.length - 1;
      msgType = data.msgType;
      msg = data.msg;

      if(!exercise.executionStopped && nbStates !== -1) {
        unbindListener = $scope.$watch('exercise.animationOnGoing', function (newValue, oldValue) {
          if(newValue === oldValue) {
            // The watcher is fired right after the init
            // We do not want to display the result yet
            return;
          }
          // Will display the result a few moments after the animation's end
          $timeout(function() {
            exercise.result += msg;
            if (msgType === 1) {
              $('#successModal').foundation('reveal', 'open');
            }
            exercise.resultType = msgType;
          }, 500);
          unbindListener(); // Allows to remove the listener
        });
      }
      else {
        exercise.result += msg;
        if (msgType === 1) {
          $('#successModal').foundation('reveal', 'open');
        }
        exercise.resultType = msgType;
      }
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
      stopUpdateViewLoop();
      exercise.isPlaying = false;
    }

    function replay() {
      reset(exercise.currentWorldID, exercise.worldKind, true);
      if(exercise.worldKind === 'answer' && !exercise.playedDemo) {
        runDemo();
      }
      else {
        exercise.isPlaying = true;
        startUpdateModelLoop();
        startUpdateViewLoop();
      }
    }

    function handleOperations(worldID, worldKind, steps) {
      var i, world, step;
      world = exercise[worldKind + 'Worlds'][worldID];
      for(i = 0; i < steps.length; i += 1) {
        step = steps[i];
        world.addOperations(step);
      }
      if (world === exercise.currentWorld && exercise.updateViewLoop === null) {
        exercise.isPlaying = true;
        startUpdateModelLoop();
        startUpdateViewLoop();
      } else if(worldKind === 'answer' && world !== exercise.currentWorld) {
        world.currentState += 1;
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
      exercise.animationOnGoing = true;
    }

    function updateView() {
      if(exercise.currentWorld === null) {
        // FIXME: Somehow we can reach this point from time to time
        $timeout.cancel(exercise.updateModelLoop);
        $interval.cancel(exercise.updateViewLoop);
      } else if (exercise.lastStateDrawn !== exercise.currentWorld.currentState) {
        exercise.drawService.update();
        exercise.lastStateDrawn = exercise.currentWorld.currentState;
      }

      if (!exercise.isPlaying) {
        stopUpdateViewLoop();
      }
    }

    function stopUpdateViewLoop() {
      $interval.cancel(exercise.updateViewLoop);
      exercise.animationOnGoing = false;
    }

    function setWorldState(state) {
      resetIdleLoop();
      $timeout.cancel(exercise.updateModelLoop);
      stopUpdateViewLoop();
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
      console.log('On passe ici!');
      offDisplayMessage();
      messageQueue.unsubscribe();
      $timeout.cancel(exercise.idleLoop);
      $timeout.cancel(exercise.updateModelLoop);
      stopUpdateViewLoop();
      if(!exercise.nonImplementedWorldException) {
        exercise.initialWorlds = {};
        exercise.answerWorlds = {};
        exercise.currentWorlds = {};
        exercise.currentWorld = null;
        exercise.drawService.setWorld(null);
      }
      exercise.instructions = null;
      exercise.help = null;
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

    function updateCodeEditor(progLang, code) {
      if (progLang.lang === 'Blockly') {
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
        setIDEMode(progLang);
        if (code !== null)
          exercise.code = code;
        $timeout(function () {
          exercise.editor.refresh();
        }, 0);
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
  }
})();
