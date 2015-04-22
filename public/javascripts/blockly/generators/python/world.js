Blockly.Python['world_ground_color'] = function (block) {
    var code = 'getGroundColor()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['world_baggle_ground'] = function (block) {
    var code = 'isOverBaggle()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['world_baggle_bag'] = function (block) {
    var code = 'isCarryingBaggle()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['world_baggle_pickup'] = function (block) {
    var code = 'pickupBaggle()\n';
    return code;
};

Blockly.Python['world_baggle_drop'] = function (block) {
    var code = 'dropBaggle()\n';
    return code;
};

Blockly.Python['world_message_ground'] = function (block) {
    var code = 'isOverMessage()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['world_message_write'] = function (block) {
    var val = Blockly.Python.valueToCode(block, 'VAL', Blockly.Python.ORDER_ATOMIC);
    var code = 'writeMessage(' + val + ')\n';
    return code;
};

Blockly.Python['world_message_read'] = function (block) {
    var code = 'readMessage()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['world_message_clear'] = function (block) {
    var code = 'clearMessage()\n';
    return code;
};