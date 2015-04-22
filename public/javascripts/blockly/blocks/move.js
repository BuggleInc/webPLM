Blockly.Blocks['move_forward'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("forward");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Moving forward.');
    }
};

Blockly.Blocks['move_backward'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("backward");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Moving back.');
    }
};

Blockly.Blocks['move_forward_many'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("forward");
        this.appendValueInput("VAL")
            .setCheck("Number")
            .appendField("| steps =");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Moving forward.');
    }
};

Blockly.Blocks['move_backward_many'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("backward")
            .appendField("| steps =");
        this.appendValueInput("VAL")
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Moving back.');
    }
};

Blockly.Blocks['turn_right'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("right");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Turn right.');
    }
};

Blockly.Blocks['turn_left'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("left");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Turn left.');
    }
};

Blockly.Blocks['turn_back'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("back");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Turn back.');
    }
};

Blockly.Blocks['get_x'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("getX");
        this.setOutput(true, 'Number');
        this.setTooltip('Get X coordinate.');
    }
};

Blockly.Blocks['get_y'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("getY");
        this.setOutput(true, 'Number');
        this.setTooltip('Get Y coordinate.');
    }
};

Blockly.Blocks['set_x'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("setX");
        this.appendValueInput("VAL")
            .appendField("| x =")
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Set X coordinate.');
    }
};

Blockly.Blocks['set_y'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("setY");
        this.appendValueInput("VAL")
            .appendField("| y =")
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Set Y coordinate.');
    }
};

Blockly.Blocks['set_position'] = {
    init: function () {
        this.setColour(30);
        this.appendDummyInput()
            .appendField("setPos");
        this.appendValueInput("VAL_X")
            .appendField("| x =")
            .setCheck("Number");
        this.appendValueInput("VAL_Y")
            .appendField("y =")
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Set position');
    }
};