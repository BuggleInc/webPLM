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
 * @fileoverview Non-editable text field.  Used for titles, labels, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldLabel');

goog.require('Blockly.Field');
goog.require('Blockly.Tooltip');


/**
 * Class for a non-editable field.
 * @param {string} text The initial content of the field.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldLabel = function (text) {
    this.sourceBlock_ = null;
    // Build the DOM.
    this.textElement_ = Blockly.createSvgElement('text', {
        'class': 'blocklyText'
    }, null);
    this.size_ = {
        height: 25,
        width: 0
    };
    this.setText(text);
};
goog.inherits(Blockly.FieldLabel, Blockly.Field);

/**
 * Clone this FieldLabel.
 * @return {!Blockly.FieldLabel} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldLabel.prototype.clone = function () {
    return new Blockly.FieldLabel(this.getText());
};

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldLabel.prototype.EDITABLE = false;

/**
 * Install this text on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldLabel.prototype.init = function (block) {
    console.log('field_label_init_block_01', block);
    if (this.sourceBlock_) {
        console.log('field_label_init_block_02', block);
        throw 'Text has already been initialized once.';
    }
    console.log('field_label_init_block_03', block);
    this.sourceBlock_ = block;
    console.log('field_label_init_block_040', block);
    console.log('field_label_init_block_041', block.getSvgRoot());
    console.log('field_label_init_block_042', block.getSvgRoot().appendChild(this.textElement_));
    block.getSvgRoot().appendChild(this.textElement_);
    console.log('field_label_init_block_05', block);

    // Configure the field to be transparent with respect to tooltips.
    this.textElement_.tooltip = this.sourceBlock_;
    console.log('field_label_init_block_06', block);
    Blockly.Tooltip.bindMouseEvents(this.textElement_);
    console.log('field_label_init_block_07', block);
};

/**
 * Dispose of all DOM objects belonging to this text.
 */
Blockly.FieldLabel.prototype.dispose = function () {
    goog.dom.removeNode(this.textElement_);
    this.textElement_ = null;
};

/**
 * Gets the group element for this field.
 * Used for measuring the size and for positioning.
 * @return {!Element} The group element.
 */
Blockly.FieldLabel.prototype.getRootElement = function () {
    return /** @type {!Element} */ (this.textElement_);
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.FieldLabel.prototype.setTooltip = function (newTip) {
    this.textElement_.tooltip = newTip;
};