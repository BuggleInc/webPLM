/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Logic blocks for Blockly.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Blocks.logic');

goog.require('Blockly.Blocks');


Blockly.Blocks['controls_if'] = {
    /**
     * Block for if/elseif/else condition.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.CONTROLS_IF_HELPURL);
        this.setColour(210);
        this.appendValueInput('IF0')
            .setCheck('Boolean')
            .appendField(Blockly.Msg.CONTROLS_IF_MSG_IF);
        this.appendStatementInput('DO0')
            .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setMutator(new Blockly.Mutator(['controls_if_elseif',
            'controls_if_else']));
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            if (!thisBlock.elseifCount_ && !thisBlock.elseCount_) {
                return Blockly.Msg.CONTROLS_IF_TOOLTIP_1;
            } else if (!thisBlock.elseifCount_ && thisBlock.elseCount_) {
                return Blockly.Msg.CONTROLS_IF_TOOLTIP_2;
            } else if (thisBlock.elseifCount_ && !thisBlock.elseCount_) {
                return Blockly.Msg.CONTROLS_IF_TOOLTIP_3;
            } else if (thisBlock.elseifCount_ && thisBlock.elseCount_) {
                return Blockly.Msg.CONTROLS_IF_TOOLTIP_4;
            }
            return '';
        });
        this.elseifCount_ = 0;
        this.elseCount_ = 0;
    },
    /**
     * Create XML to represent the number of else-if and else inputs.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        if (!this.elseifCount_ && !this.elseCount_) {
            return null;
        }

        var container = [];
        if (this.elseifCount_) {
            var parameter = {};
            parameter.name = 'elseif';
            parameter.value = this.elseifCount_;
            container.push(parameter);
        }
        if (this.elseCount_) {
            var parameter = {};
            parameter.name = 'else';
            parameter.value = this.elseCount_;
            container.push(parameter);
        }
        return container;
    },
    /**
     * Parse XML to restore the else-if and else inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        this.arguments_ = [];
        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'else') {
                this.elseCount_ = parseInt(elements[x].value, 10);
            }
            if (elements[x].name.toLowerCase() == 'elseif') {
                this.elseifCount_ = parseInt(elements[x].value, 10);
            }
        }
        for (var x = 1; x <= this.elseifCount_; x++) {
            this.appendValueInput('IF' + x)
                .setCheck('Boolean')
                .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF);
            this.appendStatementInput('DO' + x)
                .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
        }
        if (this.elseCount_) {
            this.appendStatementInput('ELSE')
                .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
        }
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this Blockly.Block
     */
    decompose: function (workspace) {
        var containerBlock = Blockly.Block.obtain(workspace, 'controls_if_if');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var x = 1; x <= this.elseifCount_; x++) {
            var elseifBlock = Blockly.Block.obtain(workspace, 'controls_if_elseif');
            elseifBlock.initSvg();
            connection.connect(elseifBlock.previousConnection);
            connection = elseifBlock.nextConnection;
        }
        if (this.elseCount_) {
            var elseBlock = Blockly.Block.obtain(workspace, 'controls_if_else');
            elseBlock.initSvg();
            connection.connect(elseBlock.previousConnection);
        }
        return containerBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function (containerBlock) {
        // Disconnect the else input blocks and remove the inputs.
        if (this.elseCount_) {
            this.removeInput('ELSE');
        }
        this.elseCount_ = 0;
        // Disconnect all the elseif input blocks and remove the inputs.
        for (var x = this.elseifCount_; x > 0; x--) {
            this.removeInput('IF' + x);
            this.removeInput('DO' + x);
        }
        this.elseifCount_ = 0;
        // Rebuild the block's optional inputs.
        var clauseBlock = containerBlock.getInputTargetBlock('STACK');
        while (clauseBlock) {
            switch (clauseBlock.type) {
                case 'controls_if_elseif':
                    this.elseifCount_++;
                    var ifInput = this.appendValueInput('IF' + this.elseifCount_)
                        .setCheck('Boolean')
                        .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF);
                    var doInput = this.appendStatementInput('DO' + this.elseifCount_);
                    doInput.appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
                    // Reconnect any child blocks.
                    if (clauseBlock.valueConnection_) {
                        ifInput.connection.connect(clauseBlock.valueConnection_);
                    }
                    if (clauseBlock.statementConnection_) {
                        doInput.connection.connect(clauseBlock.statementConnection_);
                    }
                    break;
                case 'controls_if_else':
                    this.elseCount_++;
                    var elseInput = this.appendStatementInput('ELSE');
                    elseInput.appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
                    // Reconnect any child blocks.
                    if (clauseBlock.statementConnection_) {
                        elseInput.connection.connect(clauseBlock.statementConnection_);
                    }
                    break;
                default:
                    throw 'Unknown block type.';
            }
            clauseBlock = clauseBlock.nextConnection &&
                clauseBlock.nextConnection.targetBlock();
        }
    },
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    saveConnections: function (containerBlock) {
        var clauseBlock = containerBlock.getInputTargetBlock('STACK');
        var x = 1;
        while (clauseBlock) {
            switch (clauseBlock.type) {
                case 'controls_if_elseif':
                    var inputIf = this.getInput('IF' + x);
                    var inputDo = this.getInput('DO' + x);
                    clauseBlock.valueConnection_ =
                        inputIf && inputIf.connection.targetConnection;
                    clauseBlock.statementConnection_ =
                        inputDo && inputDo.connection.targetConnection;
                    x++;
                    break;
                case 'controls_if_else':
                    var inputDo = this.getInput('ELSE');
                    clauseBlock.statementConnection_ =
                        inputDo && inputDo.connection.targetConnection;
                    break;
                default:
                    throw 'Unknown block type.';
            }
            clauseBlock = clauseBlock.nextConnection &&
                clauseBlock.nextConnection.targetBlock();
        }
    }
};

Blockly.Blocks['controls_if_if'] = {
    /**
     * Mutator block for if container.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(210);
        this.appendDummyInput()
            .appendField(Blockly.Msg.CONTROLS_IF_IF_TITLE_IF);
        this.appendStatementInput('STACK');
        this.setTooltip(Blockly.Msg.CONTROLS_IF_IF_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['controls_if_elseif'] = {
    /**
     * Mutator bolck for else-if condition.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(210);
        this.appendDummyInput()
            .appendField(Blockly.Msg.CONTROLS_IF_ELSEIF_TITLE_ELSEIF);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSEIF_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['controls_if_else'] = {
    /**
     * Mutator block for else condition.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(210);
        this.appendDummyInput()
            .appendField(Blockly.Msg.CONTROLS_IF_ELSE_TITLE_ELSE);
        this.setPreviousStatement(true);
        this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSE_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['logic_compare'] = {
    /**
     * Block for comparison operator.
     * @this Blockly.Block
     */
    init: function () {
        var OPERATORS = Blockly.RTL ? [
            ['=', 'EQ'],
            ['\u2260', 'NEQ'],
            ['>', 'LT'],
            ['\u2265', 'LTE'],
            ['<', 'GT'],
            ['\u2264', 'GTE']
        ] : [
            ['=', 'EQ'],
            ['\u2260', 'NEQ'],
            ['<', 'LT'],
            ['\u2264', 'LTE'],
            ['>', 'GT'],
            ['\u2265', 'GTE']
        ];
        this.setHelpUrl(Blockly.Msg.LOGIC_COMPARE_HELPURL);
        this.setColour(210);
        this.setOutput(true, 'Boolean');
        this.appendValueInput('A');
        this.appendValueInput('B')
            .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
        this.setInputsInline(true);
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            var op = thisBlock.getFieldValue('OP');
            var TOOLTIPS = {
                'EQ': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ,
                'NEQ': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_NEQ,
                'LT': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT,
                'LTE': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LTE,
                'GT': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT,
                'GTE': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GTE
            };
            return TOOLTIPS[op];
        });
    }
};

Blockly.Blocks['logic_operation'] = {
    /**
     * Block for logical operations: 'and', 'or'.
     * @this Blockly.Block
     */
    init: function () {
        this.OPERATORS =
            [
                [Blockly.Msg.LOGIC_OPERATION_AND, 'AND'],
                [Blockly.Msg.LOGIC_OPERATION_OR, 'OR']
            ];
        this.setHelpUrl(Blockly.Msg.LOGIC_OPERATION_HELPURL);
        this.setColour(210);
        this.setOutput(true, 'Boolean');
        this.appendValueInput('IN0')
            .setCheck('Boolean');
        this.appendValueInput('IN1')
            .setCheck('Boolean')
            .appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP1');
        this.setInputsInline(true);
        this.setMutator(new Blockly.Mutator(['logic_compare_number']));
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        this.setTooltip(function () {
            var op = thisBlock.getFieldValue('OP1');
            var TOOLTIPS = {
                'AND': Blockly.Msg.LOGIC_OPERATION_TOOLTIP_AND,
                'OR': Blockly.Msg.LOGIC_OPERATION_TOOLTIP_OR
            };
            return TOOLTIPS[op];
        });
    },
    /**
     * Create XML to represent the number of else-if and else inputs.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        if (!this.opCount_) {
            return null;
        }

        var container = [];
        if (this.opCount_) {
            var parameter = {};
            parameter.name = 'operators';
            parameter.value = this.opCount_;
            container.push(parameter);
        }
        return container;
    },
    domToMutation: function (xmlElement) {
        this.arguments_ = [];
        var elements = [].concat(xmlElement);
        for (var x = 0; x < elements.length; x++) {
            if (elements[x].name.toLowerCase() == 'operators') {
                this.opCount_ = parseInt(elements[x].value, 10);
            }

            for (var x = 1; x <= this.opCount_; x++) {
                this.appendValueInput('IN' + (x+1))
                    .setCheck('Boolean')
                    .appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP' + (x+1));
            }
        }
    },
    decompose: function (workspace) {
        var containerBlock = Blockly.Block.obtain(workspace, 'logic_compare_base');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var x = 1; x <= this.opCount_; x++) {
            var numberBlock = Blockly.Block.obtain(workspace, 'logic_compare_number');
            numberBlock.initSvg();
            connection.connect(numberBlock.previousConnection);
            connection = numberBlock.nextConnection;
        }
        return containerBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function (containerBlock) {
        // this.opCount_ = 0;
        // Disconnect all the input blocks and remove the inputs.
        for (var x = this.opCount_; x > 0; x--) {
            this.removeInput('IN' + (x + 1));
        }
        this.opCount_ = 0;
        // Rebuild the block's optional inputs.
        var clauseBlock = containerBlock.getInputTargetBlock('STACK');
        while (clauseBlock) {
            switch (clauseBlock.type) {
                case 'logic_compare_number':
                    this.opCount_++;

                    var ifInput = this.appendValueInput('IN' + (this.opCount_ + 1))
                        .setCheck('Boolean')
                        .appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP' + (this.opCount_ + 1));

                    // Reconnect any child blocks.
                    if (clauseBlock.valueConnection_) {
                        ifInput.connection.connect(clauseBlock.valueConnection_);
                    }
                    if (clauseBlock.statementConnection_) {
                        doInput.connection.connect(clauseBlock.statementConnection_);
                    }
                    break;
                default:
                    console.log('Unknown block type ' + clauseBlock.type);
            }
            clauseBlock = clauseBlock.nextConnection &&
                clauseBlock.nextConnection.targetBlock();
        }
    },
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    saveConnections: function (containerBlock) {
        var clauseBlock = containerBlock.getInputTargetBlock('STACK');
        var x = 1;
        while (clauseBlock) {
            switch (clauseBlock.type) {
                case 'logic_compare_number':
                    var inputIf = this.getInput('IN' + x);
                    var inputDo = this.getInput('OP' + x);
                    clauseBlock.valueConnection_ =
                        inputIf && inputIf.connection.targetConnection;
                    clauseBlock.statementConnection_ =
                        inputDo && inputDo.connection.targetConnection;
                    x++;
                    break;
                default:
                    throw 'Unknown block type.';
            }
            clauseBlock = clauseBlock.nextConnection &&
                clauseBlock.nextConnection.targetBlock();
        }
    }
};

Blockly.Blocks['logic_compare_base'] = {
    /**
     * Mutator block for compare container.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(210);
        this.appendDummyInput()
            .appendField("Logic Compare");
        this.appendStatementInput('STACK');
        this.setTooltip(Blockly.Msg.CONTROLS_IF_IF_TOOLTIP);
        this.contextMenu = false;
    }
};

Blockly.Blocks['logic_compare_number'] = {
    /**
     * Mutator block for additional numbers.
     * @this Blockly.Block
     */
    init: function () {
        this.setColour(210);
        this.appendDummyInput()
            .appendField("number");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip("number tooltip");
        this.contextMenu = false;
    }
};

Blockly.Blocks['logic_negate'] = {
    /**
     * Block for negation.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.LOGIC_NEGATE_HELPURL);
        this.setColour(210);
        this.setOutput(true, 'Boolean');
        this.interpolateMsg(Blockly.Msg.LOGIC_NEGATE_TITLE,
            ['BOOL', 'Boolean', Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.setTooltip(Blockly.Msg.LOGIC_NEGATE_TOOLTIP);
    }
};

Blockly.Blocks['logic_boolean'] = {
    /**
     * Block for boolean data type: true and false.
     * @this Blockly.Block
     */
    init: function () {
        var BOOLEANS =
            [
                [Blockly.Msg.LOGIC_BOOLEAN_TRUE, 'TRUE'],
                [Blockly.Msg.LOGIC_BOOLEAN_FALSE, 'FALSE']
            ];
        this.setHelpUrl(Blockly.Msg.LOGIC_BOOLEAN_HELPURL);
        this.setColour(210);
        this.setOutput(true, 'Boolean');
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(BOOLEANS), 'BOOL');
        this.setTooltip(Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP);
    }
};

Blockly.Blocks['logic_null'] = {
    /**
     * Block for null data type.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.LOGIC_NULL_HELPURL);
        this.setColour(210);
        this.setOutput(true);
        this.appendDummyInput()
            .appendField(Blockly.Msg.LOGIC_NULL);
        this.setTooltip(Blockly.Msg.LOGIC_NULL_TOOLTIP);
    }
};

Blockly.Blocks['logic_ternary'] = {
    /**
     * Block for ternary operator.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.LOGIC_TERNARY_HELPURL);
        this.setColour(210);
        this.appendValueInput('IF')
            .setCheck('Boolean')
            .appendField(Blockly.Msg.LOGIC_TERNARY_CONDITION);
        this.appendValueInput('THEN')
            .appendField(Blockly.Msg.LOGIC_TERNARY_IF_TRUE);
        this.appendValueInput('ELSE')
            .appendField(Blockly.Msg.LOGIC_TERNARY_IF_FALSE);
        this.setOutput(true);
        this.setTooltip(Blockly.Msg.LOGIC_TERNARY_TOOLTIP);
    }
};