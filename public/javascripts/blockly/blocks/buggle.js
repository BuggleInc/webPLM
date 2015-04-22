Blockly.Blocks['buggle_get_color'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("getBodyColor");
        this.setOutput(true, "String");
        this.setTooltip('Get the color of the body.');
    }
};

Blockly.Blocks['buggle_set_color'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("setBodyColor")
            .appendField(new Blockly.FieldDropdown([["black", "Color.black"], ["blue", "Color.blue"], ["cyan", "Color.cyan"], ["darkgrey", "Color.darkgrey"], ["gray", "Color.gray"], ["green", "Color.green"], ["lightgrey", "Color.lightgray"], ["magenta", "Color.magenta"], ["orange", "Color.orange"], ["pink", "Color.pink"], ["red", "Color.red"], ["white", "Color.white"], ["yellow", "Color.yellow"]]), "VAL");
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
            .appendField("setDirection")
            .appendField(new Blockly.FieldDropdown([["north", "Direction.NORTH"], ["south", "Direction.SOUTH"], ["east", "Direction.EAST"], ["west", "Direction.WEST"]]), "VAL");
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