Blockly.Blocks['world_ground_color'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_GROUND_COLOR_TITLE);
        this.setOutput(true, 'Color');
        this.setTooltip(Blockly.Msg.WORLD_GROUND_COLOR_TOOLTIP);
    }
};

Blockly.Blocks['world_baggle_ground'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_BAGGLE_GROUND_TITLE);
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.WORLD_BAGGLE_GROUND_TOOLTIP);
    }
};

Blockly.Blocks['world_baggle_bag'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_BAGGLE_BAG_TITLE)
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.WORLD_BAGGLE_BAG_TOOLTIP);
    }
};

Blockly.Blocks['world_baggle_pickup'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_BAGGLE_PICKUP_TITLE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.WORLD_BAGGLE_PICKUP_TOOLTIP);
    }
};

Blockly.Blocks['world_baggle_drop'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_BAGGLE_DROP_TITLE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.WORLD_BAGGLE_DROP_TOOLTIP);
    }
};

Blockly.Blocks['world_message_ground'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_MESSAGE_GROUND_TITLE);
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.WORLD_MESSAGE_GROUND_TOOLTIP);
    }
};

Blockly.Blocks['world_message_write'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_MESSAGE_WRITE_TITLE);
        this.appendValueInput("VAL")
            .setCheck("String");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.WORLD_MESSAGE_WRITE_TOOLTIP);
    }
};

Blockly.Blocks['world_message_read'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_MESSAGE_READ_TITLE);
        this.setOutput(true, 'String');
        this.setTooltip(Blockly.Msg.WORLD_MESSAGE_READ_TOOLTIP);
    }
};

Blockly.Blocks['world_message_clear'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_MESSAGE_CLEAR_TITLE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.WORLD_MESSAGE_CLEAR_TOOLTIP);
    }
};

Blockly.Blocks['world_crossing'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_CROSSING_TITLE);
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.WORLD_CROSSING_TOOLTIP);
    }
};

Blockly.Blocks['world_exitReached'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_EXITREACHED_TITLE);
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.WORLD_EXITREACHED_TOOLTIP);
    }
};

Blockly.Blocks['world_ground_white'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_GROUND_WHITE_TITLE);
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.WORLD_GROUND_WHITE_TOOLTIP);
    }
};

Blockly.Blocks['world_ground_orange'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_GROUND_ORANGE_TITLE);
        this.setOutput(true, 'Boolean');
        this.setTooltip(Blockly.Msg.WORLD_GROUND_ORANGE_TOOLTIP);
    }
};

Blockly.Blocks['world_height_get'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_HEIGHT_GET_TITLE);
        this.setOutput(true, 'Number');
        this.setTooltip(Blockly.Msg.WORLD_HEIGHT_GET_TOOLTIP);
    }
};

Blockly.Blocks['world_width_get'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_WIDTH_GET_TITLE);
        this.setOutput(true, 'Number');
        this.setTooltip(Blockly.Msg.WORLD_WIDTH_GET_TOOLTIP);
    }
};

Blockly.Blocks['world_indication_get'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField(Blockly.Msg.WORLD_INDICATION_GET_TITLE);
        this.setOutput(true, 'Char');
        this.setTooltip(Blockly.Msg.WORLD_INDICATION_GET_TOOLTIP);
    }
};