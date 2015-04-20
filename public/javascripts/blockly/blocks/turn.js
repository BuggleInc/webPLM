Blockly.Blocks['turn_right'] = {
    init: function () {
        this.setColour(120);
        this.appendDummyInput()
            .appendField("right");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};

Blockly.Blocks['turn_left'] = {
    init: function () {
        this.setColour(120);
        this.appendDummyInput()
            .appendField("left");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};

Blockly.Blocks['turn_back'] = {
    init: function () {
        this.setColour(120);
        this.appendDummyInput()
            .appendField("back");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};