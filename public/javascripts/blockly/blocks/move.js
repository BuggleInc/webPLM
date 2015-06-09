Blockly.Blocks['move_forward'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField(Blockly.Msg.MOVE_FORWARD_TITLE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.MOVE_FORWARD_TOOLTIP);
    }
};

Blockly.Blocks['move_backward'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField(Blockly.Msg.MOVE_BACKWARD_TITLE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.MOVE_BACKWARD_TOOLTIP);
    }
};

Blockly.Blocks['move_forward_many'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField(Blockly.Msg.MOVE_FORWARD_MANY_TITLE);
        this.appendValueInput("VAL")
            .appendField(Blockly.Msg.MOVE_FORWARD_MANY_STEP)
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.MOVE_FORWARD_MANY_TOOLTIP);
    }
};

Blockly.Blocks['move_backward_many'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField(Blockly.Msg.MOVE_BACKWARD_MANY_TITLE);
        this.appendValueInput("VAL")
            .appendField(Blockly.Msg.MOVE_BACKWARD_MANY_STEP)
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.MOVE_BACKWARD_MANY_TOOLTIP);
    }
};

Blockly.Blocks['turn_right'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField(Blockly.Msg.TURN_RIGHT_TITLE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.TURN_RIGHT_TOOLTIP);
    }
};

Blockly.Blocks['turn_left'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField(Blockly.Msg.TURN_LEFT_TITLE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.TURN_LEFT_TOOLTIP);
    }
};

Blockly.Blocks['turn_back'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField(Blockly.Msg.TURN_BACK_TITLE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.TURN_BACK_TOOLTIP);
    }
};

Blockly.Blocks['get_x'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField(Blockly.Msg.GET_X_TITLE);
        this.setOutput(true, 'Number');
        this.setTooltip(Blockly.Msg.GET_X_TOOLTIP);
    }
};

Blockly.Blocks['get_y'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField(Blockly.Msg.GET_Y_TITLE);
        this.setOutput(true, 'Number');
        this.setTooltip(Blockly.Msg.GET_Y_TOOLTIP);
    }
};

Blockly.Blocks['set_x'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField(Blockly.Msg.SET_X_TITLE);
        this.appendValueInput("VAL")
            .appendField(Blockly.Msg.SET_X_FIELD)
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.SET_X_TOOLTIP);
    }
};

Blockly.Blocks['set_y'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField(Blockly.Msg.SET_Y_TITLE);
        this.appendValueInput("VAL")
            .appendField(Blockly.Msg.SET_Y_FIELD)
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.SET_Y_TOOLTIP);
    }
};

Blockly.Blocks['set_position'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField(Blockly.Msg.SET_POS_TITLE);
        this.appendValueInput("VAL_X")
            .appendField(Blockly.Msg.SET_POS_FIELD_X)
            .setCheck("Number");
        this.appendValueInput("VAL_Y")
            .appendField(Blockly.Msg.SET_POS_FIELD_Y)
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.SET_POS_TOOLTIP);
    }
};