(function () {
  'use strict';

  angular
    .module("PLMApp")
    .service("blocklyService", blocklyService);

  blocklyService.$inject = ['BlocklyMsg'];

  function blocklyService(BlocklyMsg) {
    var options = {
      path: "/assets/javascripts/blockly/media/",
      trashcan: true,
      toolbox: [{
        name: "Brush",
        blocks: [{
          type: "brush_down"
                  }, {
          type: "brush_up"
                  }, {
          type: "brush_position"
                  }, {
          type: "brush_get_color"
                  }, {
          type: "brush_set_color"
                  }]
              }, {
        name: "Buggle",
        blocks: [{
          type: "buggle_get_color"
                  }, {
          type: "buggle_set_color"
                  }, {
          type: "buggle_facingWall"
                  }, {
          type: "buggle_backingWall"
                  }, {
          type: "buggle_get_heading"
                  }, {
          type: "buggle_set_heading"
                  }, {
          type: "buggle_is_selected"
                  }]
              }, {
        name: "Constant",
        blocks: [{
          type: "color"
                  }, {
          type: "direction"
                  }]
              }, {
        name: "Lists",
        blocks: [{
          type: "lists_create_empty"
                  }, {
          type: "lists_create_with"
                  }, {
          type: "lists_repeat"
                  }, {
          type: "lists_length"
                  }, {
          type: "lists_isEmpty"
                  }, {
          type: "lists_indexOf"
                  }, {
          type: "lists_getIndex"
                  }, {
          type: "lists_setIndex"
                  }, {
          type: "lists_getSublist"
                  }]
              }, {
        name: "Logic",
        blocks: [{
          type: "controls_if"
                  }, {
          type: "logic_compare"
                  }, {
          type: "newlogic_operation"
                  }, {
          type: "logic_negate"
                  }, {
          type: "logic_boolean"
                  }, {
          type: "logic_null"
                  }, {
          type: "logic_ternary"
                  }]
              }, {
        name: "Loops",
        blocks: [{
          type: "controls_repeat"
                  }, {
          type: "controls_whileUntil"
                  }, {
          type: "controls_for"
                  }, {
          type: "controls_forEach"
                  }, {
          type: "controls_flow_statements"
                  }]
              }, {
        name: "Math",
        blocks: [{
          type: "math_number"
                  }, {
          type: "math_arithmetic"
                  }, {
          type: "math_single"
                  }, {
          type: "math_trig"
                  }, {
          type: "math_constant"
                  }, {
          type: "math_change"
                  }, {
          type: "math_round"
                  }, {
          type: "math_on_list"
                  }, {
          type: "math_modulo"
                  }, {
          type: "math_constrain"
                  }, {
          type: "math_random_float"
                  }]
              }, {
        name: "Move",
        blocks: [{
          type: "move_forward"
                  }, {
          type: "move_backward"
                  }, {
          type: "move_forward_many"
                  }, {
          type: "move_backward_many"
                  }, {
          type: "turn_right"
                  }, {
          type: "turn_left"
                  }, {
          type: "turn_back"
                  }, {
          type: "get_x"
                  }, {
          type: "get_y"
                  }, {
          type: "set_x"
                  }, {
          type: "set_y"
                  }, {
          type: "set_position"
                  }]
              }, {
        name: "Procedures",
        custom: "PROCEDURE",
        blocks: [{
          type: "newprocedures_defnoreturn"
                  }, {
          type: "newprocedures_defreturn"
                  }, {
          type: "newprocedures_callnoreturn"
                  }, {
          type: "newprocedures_callreturn"
                  }]
              }, {
        name: "Text",
        blocks: [{
          type: "text"
                  }, {
          type: "text_join"
                  }, {
          type: "text_create_join_container"
                  }, {
          type: "text_create_join_item"
                  }, {
          type: "text_append"
                  }, {
          type: "text_length"
                  }, {
          type: "text_isEmpty"
                  }, {
          type: "text_indexOf"
                  }, {
          type: "text_charAt"
                  }, {
          type: "text_getSubstring"
                  }, {
          type: "text_changeCase"
                  }, {
          type: "text_trim"
                  }, {
          type: "text_print"
                  }, {
          type: "text_prompt"
                  }, {
          type: "text_prompt_ext"
                  }]
              }, {
        name: "Variables",
        custom: "VARIABLE",
        blocks: [{
          type: "variables_get"
                  }, {
          type: "variables_set"
                  }]
              }, {
        name: "World",
        blocks: [{
          type: "world_ground_color"
                  }, {
          type: "world_baggle_ground"
                  }, {
          type: "world_baggle_bag"
                  }, {
          type: "world_baggle_pickup"
                  }, {
          type: "world_baggle_drop"
                  }, {
          type: "world_message_ground"
                  }, {
          type: "world_message_write"
                  }, {
          type: "world_message_read"
                  }, {
          type: "world_message_clear"
                  }, {
          type: "world_crossing"
                  }, {
          type: "world_exitReached"
                  }, {
          type: "world_ground_white"
                  }, {
          type: "world_ground_orange"
                  }, {
          type: "world_height_get"
                  }, {
          type: "world_width_get"
                  }, {
          type: "world_indication_get"
                  }]
              }]
    };

    updateMsg();
    console.log(Blockly.Msg);
    var service = {
      getOptions: getOptions,
      setOptions: setOptions,
      updateMsg: updateMsg
    };
    return service;

    function updateMsg() {
      Blockly.Msg = BlocklyMsg.getModel();
    }

    function getOptions() {
      return options;
    };

    function setOptions(opt) {
      options = opt;
    };
  }

})();