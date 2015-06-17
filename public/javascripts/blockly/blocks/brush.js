Blockly.Blocks['brush_down'] = {
  init: function () {
    this.setColour(330);
    this.appendDummyInput()
      .appendField(Blockly.Msg.BRUSH_DOWN_TITLE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.BRUSH_DOWN_TOOLTIP);
  }
};

Blockly.Blocks['brush_up'] = {
  init: function () {
    this.setColour(330);
    this.appendDummyInput()
      .appendField(Blockly.Msg.BRUSH_UP_TITLE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.BRUSH_UP_TOOLTIP);
  }
};

Blockly.Blocks['brush_position'] = {
  init: function () {
    this.setColour(330);
    this.appendDummyInput()
      .appendField(Blockly.Msg.IS_BRUSH_DOWN_TITLE);
    this.setOutput(true, 'Boolean');
    this.setTooltip(Blockly.Msg.IS_BRUSH_DOWN_TOOLTIP);
  }
};

Blockly.Blocks['brush_get_color'] = {
  init: function () {
    this.setColour(330);
    this.appendDummyInput()
      .appendField(Blockly.Msg.BRUSH_GET_COLOR_TITLE);
    this.setOutput(true, 'Color');
    this.setTooltip(Blockly.Msg.BRUSH_GET_COLOR_TOOLTIP);
  }
};

Blockly.Blocks['brush_set_color'] = {
  init: function () {
    this.setColour(330);
    this.appendDummyInput()
      .appendField(Blockly.Msg.BRUSH_SET_COLOR_TITLE);
    this.appendValueInput("VAL")
      .setCheck("Color");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.BRUSH_SET_COLOR_TOOLTIP);
  }
};