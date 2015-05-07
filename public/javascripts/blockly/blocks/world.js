Blockly.Blocks['world_ground_color'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("getGroundColor");
        this.setOutput(true, 'Color');
        this.setTooltip('Get the color of the ground.');
    }
};

Blockly.Blocks['world_baggle_ground'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("isOverBaggle");
        this.setOutput(true, 'Boolean');
        this.setTooltip('Look for a baggle on the ground.');
    }
};

Blockly.Blocks['world_baggle_bag'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("isCarryingBaggle")
        this.setOutput(true, 'Boolean');
        this.setTooltip('Look for a baggle in bag.');
    }
};

Blockly.Blocks['world_baggle_pickup'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("pickupBaggle");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Pickup a baggle.');
    }
};

Blockly.Blocks['world_baggle_drop'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("dropBaggle");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Drop a baggle.');
    }
};

Blockly.Blocks['world_message_ground'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("isOverMessage");
        this.setOutput(true, 'Boolean');
        this.setTooltip('Look for a message.');
    }
};

Blockly.Blocks['world_message_write'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("writeMessage");
        this.appendValueInput("VAL")
            .setCheck("String");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Add a message.');
    }
};

Blockly.Blocks['world_message_read'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("readMessage");
        this.setOutput(true, 'String');
        this.setTooltip('Read the message.');
    }
};

Blockly.Blocks['world_message_clear'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("clearMessage");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Erase the message.');
    }
};

Blockly.Blocks['world_crossing'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("crossing");
        this.setOutput(true, 'Boolean');
        this.setTooltip('');
    }
};

Blockly.Blocks['world_exitReached'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("exitReached");
        this.setOutput(true, 'Boolean');
        this.setTooltip('');
    }
};

Blockly.Blocks['world_ground_white'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("isGroundWhite");
        this.setOutput(true, 'Boolean');
        this.setTooltip('');
    }
};

Blockly.Blocks['world_ground_orange'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("isOverOrange");
        this.setOutput(true, 'Boolean');
        this.setTooltip('');
    }
};

Blockly.Blocks['world_height_get'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("getWorldHeight");
        this.setOutput(true, 'Number');
        this.setTooltip('');
    }
};

Blockly.Blocks['world_width_get'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("getWorldWidth");
        this.setOutput(true, 'Number');
        this.setTooltip('');
    }
};

Blockly.Blocks['world_indication_get'] = {
    init: function () {
        this.setColour(60);
        this.appendDummyInput()
            .appendField("getIndication");
        this.setOutput(true, 'Char');
        this.setTooltip('');
    }
};