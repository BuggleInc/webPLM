Blockly.Python['move_forward'] = function (block) {
    var code = 'forward()\n';
    return code;
};

Blockly.Python['move_backward'] = function (block) {
    var code = 'backward()\n';
    return code;
};

Blockly.Python['move_forward_many'] = function (block) {
    var i = 0;
    var val = Blockly.Python.valueToCode(block, 'VAL', Blockly.Python.ORDER_NONE) || '0';
    var code = 'forward(' + val + ')\n';
    return code;
};

Blockly.Python['move_backward_many'] = function (block) {
    var i = 0;
    var val = Blockly.Python.valueToCode(block, 'VAL', Blockly.Python.ORDER_NONE) || '0';
    var code = 'backward(' + val + ')\n';
    return code;
};

Blockly.Python['turn_left'] = function (block) {
    var code = 'left()\n';
    return code;
};

Blockly.Python['turn_right'] = function (block) {
    var code = 'right()\n';
    return code;
};

Blockly.Python['turn_back'] = function (block) {
    var code = 'back()\n';
    return code;
};

Blockly.Python['get_x'] = function (block) {
    var code = 'getX()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_y'] = function (block) {
    var code = 'getY()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['set_x'] = function (block) {
    var val = Blockly.Python.valueToCode(block, 'VAL', Blockly.Python.ORDER_NONE) || '0';
    var code = 'setX('+val+')\n';
    return code;
};

Blockly.Python['set_y'] = function (block) {
    var val = Blockly.Python.valueToCode(block, 'VAL', Blockly.Python.ORDER_NONE) || '0';
    var code = 'setY('+val+')\n';
    return code;
};

Blockly.Python['set_position'] = function (block) {
    var val_x = Blockly.Python.valueToCode(block, 'VAL_X', Blockly.Python.ORDER_NONE) || '0';
    var val_y = Blockly.Python.valueToCode(block, 'VAL_Y', Blockly.Python.ORDER_NONE) || '0';
    var code = 'setPos('+val_x+','+val_y+')\n';
    return code;
};