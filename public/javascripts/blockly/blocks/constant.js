Blockly.Blocks['color'] = {
    init: function () {
        this.setColour(255);
        this.appendDummyInput()
            .appendField("color")
            .appendField(new Blockly.FieldDropdown([[Blockly.Msg.COLOR_TITLE_BLACK, "Color.black"], [Blockly.Msg.COLOR_TITLE_BLUE, "Color.blue"], [Blockly.Msg.COLOR_TITLE_CYAN, "Color.cyan"], [Blockly.Msg.COLOR_TITLE_DARKGREY, "Color.darkgrey"], [Blockly.Msg.COLOR_TITLE_GRAY, "Color.gray"], [Blockly.Msg.COLOR_TITLE_GREEN, "Color.green"], [Blockly.Msg.COLOR_TITLE_LIGHTGREY, "Color.lightgray"], [Blockly.Msg.COLOR_TITLE_MAGENTA, "Color.magenta"], [Blockly.Msg.COLOR_TITLE_ORANGE, "Color.orange"], [Blockly.Msg.COLOR_TITLE_PINK, "Color.pink"], [Blockly.Msg.COLOR_TITLE_RED, "Color.red"], [Blockly.Msg.COLOR_TITLE_WHITE, "Color.white"], [Blockly.Msg.COLOR_TITLE_YELLOW, "Color.yellow"]]), "VAL");
        this.setOutput(true, 'Color');
        this.setTooltip(Blockly.Msg.COLOR_TOOLTIP);
    }
};

Blockly.Blocks['direction'] = {
    init: function () {
        this.setColour(255);
        this.appendDummyInput()
            .appendField("direction")
            .appendField(new Blockly.FieldDropdown([[Blockly.Msg.DIRECTION_TITLE_NORTH, "Direction.NORTH"], [Blockly.Msg.DIRECTION_TITLE_SOUTH, "Direction.SOUTH"], [Blockly.Msg.DIRECTION_TITLE_EAST, "Direction.EAST"], [Blockly.Msg.DIRECTION_TITLE_WEST, "Direction.WEST"]]), "VAL");
        this.setOutput(true, 'Direction');
        this.setTooltip('Direction.');
    }
};