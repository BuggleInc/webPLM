Blockly.Python['brush_down'] = function (block) {
    var code = 'brushDown()\n';
    return code;
};

Blockly.Python['brush_up'] = function (block) {
    var code = 'brushUp()\n';
    return code;
};

Blockly.Python['brush_position'] = function (block) {
    var code = 'isBrushDown()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['brush_get_color'] = function (block) {
    var code = 'getBrushColor()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['brush_set_color'] = function (block) {
    var val = Blockly.Python.valueToCode(block, 'VAL', Blockly.Python.ORDER_ATOMIC);
    var code = 'setBrushColor('+val+')\n';
    return code;
};