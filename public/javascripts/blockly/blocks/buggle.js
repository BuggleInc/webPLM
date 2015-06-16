Blockly.Blocks['buggle_get_color'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField(Blockly.Msg.BUGGLE_GET_COLOR_TITLE);
        this.setOutput(true, "Color");
        this.setTooltip(Blockly.Msg.BUGGLE_GET_COLOR_TOOLTIP);
    }
};

Blockly.Blocks['buggle_set_color'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField(Blockly.Msg.BUGGLE_SET_COLOR_TITLE);
        this.appendValueInput("VAL")
            .setCheck("Color");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.BUGGLE_SET_COLOR_TOOLTIP);
    }
};

Blockly.Blocks['buggle_facingWall'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField(Blockly.Msg.BUGGLE_FACINGWALL_TITLE);
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.BUGGLE_FACINGWALL_TOOLTIP);
    }
};

Blockly.Blocks['buggle_backingWall'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField(Blockly.Msg.BUGGLE_BACKINGWALL_TITLE);
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.BUGGLE_BACKINGWALL_TOOLTIP);
    }
};

Blockly.Blocks['buggle_get_heading'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField(Blockly.Msg.BUGGLE_GET_HEADING_TITLE);
        this.setOutput(true, "Direction");
        this.setTooltip(Blockly.Msg.BUGGLE_GET_HEADING_TOOLTIP);
    }
};

Blockly.Blocks['buggle_set_heading'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField(Blockly.Msg.BUGGLE_SET_HEADING_TITLE);
        this.appendValueInput("VAL")
            .setCheck("Direction");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.BUGGLE_SET_HEADING_TOOLTIP);
    }
};

Blockly.Blocks['buggle_is_selected'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField(Blockly.Msg.BUGGLE_IS_SELECTED_TITLE);
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.BUGGLE_IS_SELECTED_TOOLTIP);
    }
};