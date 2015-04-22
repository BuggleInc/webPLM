Blockly.Blocks['brush_down'] = {
    init: function () {
        this.setColour(330);
        this.appendDummyInput()
            .appendField("brushDown");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Brush down');
    }
};

Blockly.Blocks['brush_up'] = {
    init: function () {
        this.setColour(330);
        this.appendDummyInput()
            .appendField("brushUp");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Brush up');
    }
};

Blockly.Blocks['brush_position'] = {
    init: function () {
        this.setColour(330);
        this.appendDummyInput()
            .appendField("isBrushDown");
        this.setOutput(true, 'Boolean');
        this.setTooltip('Get brush position.');
    }
};

Blockly.Blocks['brush_get_color'] = {
    init: function () {
        this.setColour(330);
        this.appendDummyInput()
            .appendField("getBrushColor");
        this.setOutput(true, 'Color');
        this.setTooltip('Get the color of the brush.');
    }
};

Blockly.Blocks['brush_set_color'] = {
    init: function () {
        this.setColour(330);
        this.appendDummyInput()
            .appendField("setBrushColor")
            .appendField(new Blockly.FieldDropdown([["black", "Color.black"], ["blue", "Color.blue"], ["cyan", "Color.cyan"], ["darkgrey", "Color.darkgrey"], ["gray", "Color.gray"], ["green", "Color.green"], ["lightgrey", "Color.lightgray"], ["magenta", "Color.magenta"], ["orange", "Color.orange"], ["pink", "Color.pink"], ["red", "Color.red"], ["white", "Color.white"], ["yellow", "Color.yellow"]]), "VAL");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Change the brush color.');
    }
};