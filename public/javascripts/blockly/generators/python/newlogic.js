Blockly.Python['logic_ope'] = function (block) {
    // Operations 'and', 'or'.
    var operator = (block.getFieldValue('OP') == 'AND') ? 'and' : 'or';
    var order = (operator == 'and') ? Blockly.Python.ORDER_LOGICAL_AND :
        Blockly.Python.ORDER_LOGICAL_OR;
    var argument0 = Blockly.Python.valueToCode(block, 'A', order);
    var argument1 = Blockly.Python.valueToCode(block, 'B', order);
    if (!argument0 && !argument1) {
        // If there are no arguments, then the return value is false.
        argument0 = 'False';
        argument1 = 'False';
    } else {
        // Single missing arguments have no effect on the return value.
        var defaultArgument = (operator == 'and') ? 'True' : 'False';
        if (!argument0) {
            argument0 = defaultArgument;
        }
        if (!argument1) {
            argument1 = defaultArgument;
        }
    }
    var code = argument0 + ' ' + operator + ' ' + argument1;
    return [code, order];
};