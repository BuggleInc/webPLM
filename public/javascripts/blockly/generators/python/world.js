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

Blockly.Python['world_crossing'] = function (block) {
    // Only use if crossing() is already defined in the exercise
    var code = 'crossing()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['world_exitReached'] = function (block) {
    // Only use if exitReached() is already defined in the exercise
    var code = 'exitReached()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['world_ground_white'] = function (block) {
    // Only use if isGroundWhite() is already defined in the exercise
    var code = 'isGroundWhite()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['world_ground_orange'] = function (block) {
    // Only use if isGroundWhite() is already defined in the exercise
    var code = 'isGroundWhite()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['world_height_get'] = function (block) {
    var code = 'getWorldHeight()';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['world_width_get'] = function (block) {
    var code = 'getWorldWidth()';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['world_indication_get'] = function (block) {
    var code = 'getIndication()';
    return [code, Blockly.Python.ORDER_NONE];
};