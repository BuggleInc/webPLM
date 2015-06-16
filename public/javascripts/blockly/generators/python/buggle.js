Blockly.Python['buggle_get_color'] = function (block) {
    var code = 'getBodyColor()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['buggle_set_color'] = function (block) {
    var val = Blockly.Python.valueToCode(block, 'VAL', Blockly.Python.ORDER_ATOMIC);
    console.log(val);
    var code = 'setBodyColor(' + val + ')\n';
    return code;
};

Blockly.Python['buggle_facingWall'] = function (block) {
    var code = 'isFacingWall()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['buggle_backingWall'] = function (block) {
    var code = 'isBackingWall()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['buggle_get_heading'] = function (block) {
    var code = 'getDirection()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['buggle_set_heading'] = function (block) {
    var val = Blockly.Python.valueToCode(block, 'VAL', Blockly.Python.ORDER_ATOMIC);
    var code = 'setDirection('+val+')\n';
    return code;
};

Blockly.Python['buggle_is_selected'] = function (block) {
    var code = 'isSelected()';
    return [code, Blockly.Python.ORDER_NONE];
};