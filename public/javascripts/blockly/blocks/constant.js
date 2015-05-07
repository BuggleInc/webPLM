Blockly.Blocks['color'] = {
    init: function () {
        this.setColour(255);
        this.appendDummyInput()
            .appendField("color")
            .appendField(new Blockly.FieldDropdown([["black", "Color.black"], ["blue", "Color.blue"], ["cyan", "Color.cyan"], ["darkgrey", "Color.darkgrey"], ["gray", "Color.gray"], ["green", "Color.green"], ["lightgrey", "Color.lightgray"], ["magenta", "Color.magenta"], ["orange", "Color.orange"], ["pink", "Color.pink"], ["red", "Color.red"], ["white", "Color.white"], ["yellow", "Color.yellow"]]), "VAL");
        this.setOutput(true, 'Color');
        this.setTooltip('Color.');
    }
};

Blockly.Blocks['direction'] = {
    init: function () {
        this.setColour(255);
        this.appendDummyInput()
            .appendField("direction")
            .appendField(new Blockly.FieldDropdown([["north", "Direction.NORTH"], ["south", "Direction.SOUTH"], ["east", "Direction.EAST"], ["west", "Direction.WEST"]]), "VAL");
        this.setOutput(true, 'Direction');
        this.setTooltip('Direction.');
    }
};