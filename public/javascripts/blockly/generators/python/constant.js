Blockly.Python['color'] = function (block) {
    var code = block.getFieldValue('VAL');
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['direction'] = function (block) {
    var code = block.getFieldValue('VAL');
    console.log(code);
    return [code, Blockly.Python.ORDER_ATOMIC];
};