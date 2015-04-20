Blockly.Blocks['move_forward'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("forward");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};

Blockly.Blocks['move_backward'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("backward");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};

Blockly.Blocks['move_forward_many'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("forward");
        this.appendValueInput("many")
            .setCheck("Number")
            .appendField("steps :");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};

Blockly.Blocks['move_backward_many'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField("backward")
            .appendField("steps :");
        this.appendValueInput("many")
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};