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
 * @fileoverview Variable blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.variables');

goog.require('Blockly.Blocks');


Blockly.Blocks['variables_get'] = {
    /**
     * Block for variable getter.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
        this.setColour(330);
        this.appendDummyInput()
            .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
            .appendField(new Blockly.FieldVariable(
                Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
            .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
        this.setOutput(true);
        this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
        this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
        this.contextMenuType_ = 'variables_set';
    },
    /**
     * Return all variables referenced by this block.
     * @param {string} varType Type of variable. Uses field name.
     * @return {!Array.<string>} List of variable names.
     * @this Blockly.Block
     */
    getVars: function (varType) {
        if(varType == null)
            return [this.getFieldValue('VAR')];
        return [this.getFieldValue(varType)];
    },
    /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} varType Type of variable. Uses field name.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
    renameVar: function (varType, oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getFieldValue(varType))) {
            this.setFieldValue(newName, varType);
        }
    },
    /**
     * Add menu option to create getter/setter block for this setter/getter.
     * @param {!Array} options List of menu options to add to.
     * @this Blockly.Block
     */
    customContextMenu: function (options) {
        var option = {enabled: true};
        var name = this.getFieldValue('VAR');
        option.text = this.contextMenuMsg_.replace('%1', name);
        var xmlField = goog.dom.createDom('field', null, name);
        xmlField.setAttribute('name', 'VAR');
        var xmlBlock = goog.dom.createDom('block', null, xmlField);
        xmlBlock.setAttribute('type', this.contextMenuType_);
        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
        options.push(option);
    }
};

Blockly.Blocks['variables_set'] = {
    /**
     * Block for variable setter.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
        this.setColour(330);
        this.interpolateMsg(
            // TODO: Combine these messages instead of using concatenation.
                Blockly.Msg.VARIABLES_SET_TITLE + ' %1 ' +
                Blockly.Msg.VARIABLES_SET_TAIL + ' %2',
            ['VAR', new Blockly.FieldVariable(Blockly.Msg.VARIABLES_SET_ITEM)],
            ['VALUE', null, Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.VARIABLES_SET_TOOLTIP);
        this.contextMenuMsg_ = Blockly.Msg.VARIABLES_SET_CREATE_GET;
        this.contextMenuType_ = 'variables_get';
    },
    /**
     * Return all variables referenced by this block.
     * @param {string} varType Type of variable. Uses field name.
     * @return {!Array.<string>} List of variable names.
     * @this Blockly.Block
     */
    getVars: function (varType) {
        return [this.getFieldValue(varType)];
    },
    /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} varType Type of variable. Uses field name.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
    renameVar: function (varType, oldName, newName) {
        if (Blockly.Names.equals(oldName, this.getFieldValue(varType))) {
            this.setFieldValue(newName, varType);
        }
    },
    customContextMenu: Blockly.Blocks['variables_get'].customContextMenu
};