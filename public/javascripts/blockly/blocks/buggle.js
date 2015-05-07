Blockly.Blocks['buggle_get_color'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("getBodyColor");
        this.setOutput(true, "Color");
        this.setTooltip('Get the color of the body.');
    }
};

Blockly.Blocks['buggle_set_color'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("setBodyColor");
        this.appendValueInput("VAL")
            .setCheck("Color");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Set the color of the body.');
    }
};

Blockly.Blocks['buggle_facingWall'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("isFacingWall");
        this.setOutput(true, 'Boolean');
        this.setTooltip('Look for a wall forward.');
    }
};

Blockly.Blocks['buggle_backingWall'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("isBackingWall");
        this.setOutput(true, 'Boolean');
        this.setTooltip('Look for a wall backward.');
    }
};

Blockly.Blocks['buggle_get_heading'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("getDirection");
        this.setOutput(true, "Direction");
        this.setTooltip('Get heading.');
    }
};

Blockly.Blocks['buggle_set_heading'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("setDirection");
        this.appendValueInput("VAL")
            .setCheck("Direction");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Set heading.');
    }
};

Blockly.Blocks['buggle_is_selected'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("isSelected");
        this.setOutput(true, 'Boolean');
        this.setTooltip('Check whether the buggle is currently selected in the interface.');
    }
};