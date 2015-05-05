// ===== Logic =====
Blockly.Blocks['newlogic_operation'] = {
    init: function () {
        var OPERATORS = [[Blockly.Msg.LOGIC_OPERATION_AND, 'AND'],
         [Blockly.Msg.LOGIC_OPERATION_OR, 'OR']];
        this.setColour(210);
        this.setOutput(true, 'Boolean');
        this.appendValueInput('A')
            .setCheck('Boolean');
        this.appendValueInput('B')
            .setCheck('Boolean')
            .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
        this.setInputsInline(true);
        var thisBlock = this;
        this.setTooltip(function () {
            var op = thisBlock.getFieldValue('OP');
            var TOOLTIPS = {
                'AND': Blockly.Msg.LOGIC_OPERATION_TOOLTIP_AND,
                'OR': Blockly.Msg.LOGIC_OPERATION_TOOLTIP_OR
            };
            return TOOLTIPS[op];
        });
    }
};

// ===== Procedures =====
Blockly.Blocks['newprocedures_defnoreturn'] = {
    /**
     * Block for defining a procedure with no return value.
     * @this Blockly.Block
     */
    init: function () {
        console.log('defnoreturn_init_arguments_top', this.arguments_);
        this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
        var name = Blockly.Procedures.findLegalName(
            Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE, this);
        var nameField = new Blockly.FieldTextInput(name,
            Blockly.Procedures.rename);
        //nameField.setSpellcheck(false);
        this.appendDummyInput()
            .appendField(Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE)
            .appendField(nameField, 'NAME')
            .appendField('', 'PARAMS');
        this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
        this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
        this.arguments_ = [];
        this.setStatements_(true);
        this.statementConnection_ = null;
        console.log('defnoreturn_init_arguments_bottom', this.arguments_);
    },
    /**
     * Add or remove the statement block from this function definition.
     * @param {boolean} hasStatements True if a statement block is needed.
     * @this Blockly.Block
     */
    setStatements_: function (hasStatements) {
        console.log('defnoreturn_setStatements_arguments_top', this.arguments_);
        if (this.hasStatements_ === hasStatements) {
            return;
        }
        if (hasStatements) {
            this.appendStatementInput('STACK')
                .appendField(Blockly.Msg.PROCEDURES_DEFNORETURN_DO);
            if (this.getInput('RETURN')) {
                this.moveInputBefore('STACK', 'RETURN');
            }
        } else {
            this.removeInput('STACK', true);
        }
        this.hasStatements_ = hasStatements;
        console.log('defnoreturn_setStatements_arguments_bottom', this.arguments_);
    },
    /**
     * Update the display of parameters for this procedure definition block.
     * Display a warning if there are duplicately named parameters.
     * @private
     * @this Blockly.Block
     */
    updateParams_: function () {
        console.log('defnoreturn_updateParams_arguments_top', this.arguments_);
        // Check for duplicated arguments.
        var badArg = false;
        var hash = {};
        for (var i = 0; i < this.arguments_.length; i++) {
            if (hash['arg_' + this.arguments_[i].toLowerCase()]) {
                badArg = true;
                break;
            }
            hash['arg_' + this.arguments_[i].toLowerCase()] = true;
        }
        if (badArg) {
            this.setWarningText(Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING);
        } else {
            this.setWarningText(null);
        }
        // Merge the arguments into a human-readable list.
        var paramString = '';
        if (this.arguments_.length) {
            paramString = Blockly.Msg.PROCEDURES_BEFORE_PARAMS +
                ' ' + this.arguments_.join(', ');
        }
        this.setFieldValue(paramString, 'PARAMS');
        console.log('defnoreturn_updateParams_arguments_bottom', this.arguments_);
    },
    /**
     * Create XML to represent the argument inputs.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        console.log('defnoreturn_mutationToDom_arguments_top', this.arguments_);
        var container = document.createElement('mutation');
        for (var i = 0; i < this.arguments_.length; i++) {
            var parameter = document.createElement('arg');
            parameter.setAttribute('name', this.arguments_[i]);
            container.appendChild(parameter);
        }

        // Save whether the statement input is visible.
        if (!this.hasStatements_) {
            container.setAttribute('statements', 'false');
        }
        console.log('defnoreturn_mutationToDom_arguments_bottom', this.arguments_);
        return container;
    },
    /**
     * Parse XML to restore the argument inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        console.log('defnoreturn_domToMutation_arguments_top', this.arguments_);
        this.arguments_ = [];
        for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
            if (childNode.nodeName.toLowerCase() == 'arg') {
                this.arguments_.push(childNode.getAttribute('name'));
            }
        }
        this.updateParams_();

        // Show or hide the statement input.
        this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
        console.log('defnoreturn_domToMutation_arguments_bottom', this.arguments_);
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this Blockly.Block
     */
    decompose: function (workspace) {
        console.log('defnoreturn_decompose_arguments_top', this.arguments_);
        var containerBlock = Blockly.Block.obtain(workspace,
            'procedures_mutatorcontainer');
        containerBlock.initSvg();

        // Check/uncheck the allow statement box.
        if (this.getInput('RETURN')) {
            containerBlock.setFieldValue(this.hasStatements_ ? 'TRUE' : 'FALSE',
                'STATEMENTS');
        } else {
            containerBlock.getInput('STATEMENT_INPUT').setVisible(false);
        }

        // Parameter list.
        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 0; i < this.arguments_.length; i++) {
            var paramBlock = Blockly.Block.obtain(workspace, 'procedures_mutatorarg');
            paramBlock.initSvg();
            paramBlock.setFieldValue(this.arguments_[i], 'NAME');
            // Store the old location.
            paramBlock.oldLocation = i;
            connection.connect(paramBlock.previousConnection);
            connection = paramBlock.nextConnection;
        }
        // Initialize procedure's callers with blank IDs.
        Blockly.Procedures.mutateCallers(this.getFieldValue('NAME'),
            this.workspace, this.arguments_, null);
        console.log('defnoreturn_decompose_arguments_bottom', this.arguments_);
        return containerBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function (containerBlock) {
        console.log('defnoreturn_mutationToDom_arguments_top', this.arguments_);
        // Parameter list.
        this.arguments_ = [];
        console.log('defnoreturn_mutationToDom_arguments_mid', this.arguments_);
        this.paramIds_ = [];
        var paramBlock = containerBlock.getInputTargetBlock('STACK');
        while (paramBlock) {
            this.arguments_.push(paramBlock.getFieldValue('NAME'));
            this.paramIds_.push(paramBlock.id);
            paramBlock = paramBlock.nextConnection &&
                paramBlock.nextConnection.targetBlock();
        }
        this.updateParams_();
        Blockly.Procedures.mutateCallers(this.getFieldValue('NAME'),
            this.workspace, this.arguments_, this.paramIds_);

        // Show/hide the statement input.
        var hasStatements = containerBlock.getFieldValue('STATEMENTS');
        if (hasStatements !== null) {
            hasStatements = hasStatements == 'TRUE';
            if (this.hasStatements_ != hasStatements) {
                if (hasStatements) {
                    this.setStatements_(true);
                    // Restore the stack, if one was saved.
                    var stackConnection = this.getInput('STACK').connection;
                    if (stackConnection.targetConnection ||
                        !this.statementConnection_ ||
                        this.statementConnection_.targetConnection ||
                        this.statementConnection_.sourceBlock_.workspace !=
                        this.workspace) {
                        // Block no longer exists or has been attached elsewhere.
                        this.statementConnection_ = null;
                    } else {
                        stackConnection.connect(this.statementConnection_);
                    }
                } else {
                    // Save the stack, then disconnect it.
                    var stackConnection = this.getInput('STACK').connection;
                    this.statementConnection_ = stackConnection.targetConnection;
                    if (this.statementConnection_) {
                        var stackBlock = stackConnection.targetBlock();
                        stackBlock.setParent(null);
                        stackBlock.bumpNeighbours_();
                    }
                    this.setStatements_(false);
                }
            }
        }
        console.log('defnoreturn_mutationToDom_arguments_bottom', this.arguments_);
    },
    /**
     * Dispose of any callers.
     * @this Blockly.Block
     */
    dispose: function () {
        console.log('defnoreturn_dispose_arguments_top', this.arguments_);
        var name = this.getFieldValue('NAME');
        Blockly.Procedures.disposeCallers(name, this.workspace);
        // Call parent's destructor.
        this.constructor.prototype.dispose.apply(this, arguments);
        console.log('defnoreturn_dispose_arguments_bottom', this.arguments_);
    },
    /**
     * Return the signature of this procedure definition.
     * @return {!Array} Tuple containing three elements:
     *     - the name of the defined procedure,
     *     - a list of all its arguments,
     *     - that it DOES NOT have a return value.
     * @this Blockly.Block
     */
    getProcedureDef: function () {
        console.log('defnoreturn_getProcedureDef_arguments', this.arguments_);
        return [this.getFieldValue('NAME'), this.arguments_, false];
    },
    /**
     * Return all variables referenced by this block.
     * @return {!Array.<string>} List of variable names.
     * @this Blockly.Block
     */
    getVars: function () {
        console.log('defnoreturn_getVars_arguments', this.arguments_);
        return this.arguments_;
    },
    /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
    renameVar: function (oldName, newName) {
        console.log('defnoreturn_renameVar_arguments_top', this.arguments_);
        var change = false;
        for (var i = 0; i < this.arguments_.length; i++) {
            if (Blockly.Names.equals(oldName, this.arguments_[i])) {
                this.arguments_[i] = newName;
                change = true;
            }
        }
        if (change) {
            this.updateParams_();
            // Update the mutator's variables if the mutator is open.
            if (this.mutator.isVisible()) {
                var blocks = this.mutator.workspace_.getAllBlocks();
                for (var i = 0, block; block = blocks[i]; i++) {
                    if (block.type == 'procedures_mutatorarg' &&
                        Blockly.Names.equals(oldName, block.getFieldValue('NAME'))) {
                        block.setFieldValue(newName, 'NAME');
                    }
                }
            }
        }
        console.log('defnoreturn_renameVar_arguments_bottom', this.arguments_);
    },
    /**
     * Add custom menu options to this block's context menu.
     * @param {!Array} options List of menu options to add to.
     * @this Blockly.Block
     */
    customContextMenu: function (options) {
        console.log('defnoreturn_customContextMenu_arguments_top', this.arguments_);
        // Add option to create caller.
        var option = {
            enabled: true
        };
        var name = this.getFieldValue('NAME');
        option.text = Blockly.Msg.PROCEDURES_CREATE_DO.replace('%1', name);
        var xmlMutation = goog.dom.createDom('mutation');
        xmlMutation.setAttribute('name', name);
        for (var i = 0; i < this.arguments_.length; i++) {
            var xmlArg = goog.dom.createDom('arg');
            xmlArg.setAttribute('name', this.arguments_[i]);
            xmlMutation.appendChild(xmlArg);
        }
        var xmlBlock = goog.dom.createDom('block', null, xmlMutation);
        xmlBlock.setAttribute('type', this.callType_);
        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
        options.push(option);

        // Add options to create getters for each parameter.
        if (!this.isCollapsed()) {
            for (var i = 0; i < this.arguments_.length; i++) {
                var option = {
                    enabled: true
                };
                var name = this.arguments_[i];
                option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
                var xmlField = goog.dom.createDom('field', null, name);
                xmlField.setAttribute('name', 'VAR');
                var xmlBlock = goog.dom.createDom('block', null, xmlField);
                xmlBlock.setAttribute('type', 'variables_get');
                option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
                options.push(option);
            }
        }
        console.log('defnoreturn_customContextMenu_arguments_bottom', this.arguments_);
    },
    callType_: 'newprocedures_callnoreturn'
};

Blockly.Blocks['newprocedures_defreturn'] = {
    /**
     * Block for defining a procedure with a return value.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFRETURN_HELPURL);
        this.setColour(Blockly.Blocks.procedures.HUE);
        var name = Blockly.Procedures.findLegalName(
            Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE, this);
        var nameField = new Blockly.FieldTextInput(name,
            Blockly.Procedures.rename);
        //nameField.setSpellcheck(false);
        this.appendDummyInput()
            .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_TITLE)
            .appendField(nameField, 'NAME')
            .appendField('', 'PARAMS');
        this.appendValueInput('RETURN')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
        this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
        this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
        this.arguments_ = [];
        this.setStatements_(true);
        this.statementConnection_ = null;
    },
    setStatements_: Blockly.Blocks['newprocedures_defnoreturn'].setStatements_,
    updateParams_: Blockly.Blocks['newprocedures_defnoreturn'].updateParams_,
    mutationToDom: Blockly.Blocks['newprocedures_defnoreturn'].mutationToDom,
    domToMutation: Blockly.Blocks['newprocedures_defnoreturn'].domToMutation,
    decompose: Blockly.Blocks['newprocedures_defnoreturn'].decompose,
    compose: Blockly.Blocks['newprocedures_defnoreturn'].compose,
    dispose: Blockly.Blocks['newprocedures_defnoreturn'].dispose,
    /**
     * Return the signature of this procedure definition.
     * @return {!Array} Tuple containing three elements:
     *     - the name of the defined procedure,
     *     - a list of all its arguments,
     *     - that it DOES have a return value.
     * @this Blockly.Block
     */
    getProcedureDef: function () {
        return [this.getFieldValue('NAME'), this.arguments_, true];
    },
    getVars: Blockly.Blocks['newprocedures_defnoreturn'].getVars,
    renameVar: Blockly.Blocks['newprocedures_defnoreturn'].renameVar,
    customContextMenu: Blockly.Blocks['newprocedures_defnoreturn'].customContextMenu,
    callType_: 'newprocedures_callreturn'
};

Blockly.Blocks['newprocedures_callnoreturn'] = {
    /**
     * Block for calling a procedure with no return value.
     * @this Blockly.Block
     */
    init: function () {
        console.log('callnoreturn_init_arguments_top', this.arguments_);
        this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
        this.setColour(Blockly.Blocks.procedures.HUE);
        this.appendDummyInput('TOPROW')
            .appendField(Blockly.Msg.PROCEDURES_CALLNORETURN_CALL)
            .appendField('', 'NAME');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        // Tooltip is set in domToMutation.
        this.arguments_ = [];
        this.quarkConnections_ = {};
        this.quarkArguments_ = null;
        console.log('callnoreturn_init_arguments_bottom', this.arguments_);
    },
    /**
     * Returns the name of the procedure this block calls.
     * @return {string} Procedure name.
     * @this Blockly.Block
     */
    getProcedureCall: function () {
        console.log('callnoreturn_getProcedureCall_arguments', this.arguments_);
        // The NAME field is guaranteed to exist, null will never be returned.
        return /** @type {string} */ (this.getFieldValue('NAME'));
    },
    /**
     * Notification that a procedure is renaming.
     * If the name matches this block's procedure, rename it.
     * @param {string} oldName Previous name of procedure.
     * @param {string} newName Renamed procedure.
     * @this Blockly.Block
     */
    renameProcedure: function (oldName, newName) {
        console.log('callnoreturn_renameProcedure_arguments_top', this.arguments_);
        if (Blockly.Names.equals(oldName, this.getProcedureCall())) {
            this.setFieldValue(newName, 'NAME');
            this.setTooltip(
                (this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP :
                    Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP)
                .replace('%1', newName));
        }
        console.log('callnoreturn_renameProcedure_arguments_bottom', this.arguments_);
    },
    /**
     * Notification that the procedure's parameters have changed.
     * @param {!Array.<string>} paramNames New param names, e.g. ['x', 'y', 'z'].
     * @param {!Array.<string>} paramIds IDs of params (consistent for each
     *     parameter through the life of a mutator, regardless of param renaming),
     *     e.g. ['piua', 'f8b_', 'oi.o'].
     * @this Blockly.Block
     */
    setProcedureParameters: function (paramNames, paramIds) {
        console.log('=== callnoreturn_setProcedureParameters_arguments_top', this.arguments_);
        console.log('=== callnoreturn_setProcedureParameters_paramNames_top', paramNames);
        console.log('=== callnoreturn_setProcedureParameters_paramIds_top', paramIds);
        // Data structures:
        // this.arguments = ['x', 'y']
        //     Existing param names.
        // this.quarkConnections_ {piua: null, f8b_: Blockly.Connection}
        //     Look-up of paramIds to connections plugged into the call block.
        // this.quarkArguments_ = ['piua', 'f8b_']
        //     Existing param IDs.
        // Note that quarkConnections_ may include IDs that no longer exist, but
        // which might reappear if a param is reattached in the mutator.
        console.log('===== 01 =====', this.arguments_);
        if (!paramIds) {
            console.log('===== 02 =====', this.arguments_);
            // Reset the quarks (a mutator is about to open).
            this.quarkConnections_ = {};
            this.quarkArguments_ = null;
            console.log('===== 03 =====', this.arguments_);
            return;
        }
        console.log('===== 04 =====', this.arguments_);
        if (goog.array.equals(this.arguments_, paramNames)) {
            console.log('===== 05 =====', this.arguments_);
            // No change.
            this.quarkArguments_ = paramIds;
            console.log('===== 06 =====', this.arguments_);
            return;
        }
        console.log('===== 07 =====', this.arguments_);
        this.setCollapsed(false);
        if (paramIds.length != paramNames.length) {
            console.log('===== 08 =====', this.arguments_);
            throw 'Error: paramNames and paramIds must be the same length.';
        }
        console.log('===== 09 =====', this.arguments_);
        if (!this.quarkArguments_) {
            console.log('===== 10 =====', this.arguments_);
            // Initialize tracking for this block.
            this.quarkConnections_ = {};
            console.log('===== 11 =====', this.arguments_);
            if (paramNames.join('\n') == this.arguments_.join('\n')) {
                console.log('===== 12 =====', this.arguments_);
                // No change to the parameters, allow quarkConnections_ to be
                // populated with the existing connections.
                this.quarkArguments_ = paramIds;
                console.log('===== 13 =====', this.arguments_);
            } else {
                console.log('===== 14 =====', this.arguments_);
                this.quarkArguments_ = [];
                console.log('===== 15 =====', this.arguments_);
            }
            console.log('===== 16 =====', this.arguments_);
        }
        console.log('===== 17 =====', this.arguments_);
        // Switch off rendering while the block is rebuilt.
        var savedRendered = this.rendered;
        this.rendered = false;
        // Update the quarkConnections_ with existing connections.
        console.log('===== 18 =====', this.arguments_);
        for (var i = this.arguments_.length - 1; i >= 0; i--) {
            console.log('===== 19 =====', this.arguments_);
            var input = this.getInput('ARG' + i);
            console.log('===== 20 =====', this.arguments_);
            if (input) {
                console.log('===== 21 =====', this.arguments_);
                var connection = input.connection.targetConnection;
                this.quarkConnections_[this.quarkArguments_[i]] = connection;
                console.log('===== 22 =====', this.arguments_);
                // Disconnect all argument blocks and remove all inputs.
                this.removeInput('ARG' + i);
                console.log('===== 23 =====', this.arguments_);
            }
        }
        // Rebuild the block's arguments.
        console.log('===== 24 =====', this.arguments_);
        this.arguments_ = [].concat(paramNames);
        console.log('===== 25 =====', this.arguments_);
        this.quarkArguments_ = paramIds;
        console.log('===== 26 =====', this.arguments_);
        for (var i = 0; i < this.arguments_.length; i++) {
            console.log('===== 27 =====', this.arguments_);
            var input = this.appendValueInput('ARG' + i)
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(this.arguments_[i]);
            console.log('===== 28 =====', this.arguments_);
            if (this.quarkArguments_) {
                console.log('===== 29 =====', this.arguments_);
                // Reconnect any child blocks.
                var quarkName = this.quarkArguments_[i];
                console.log('===== 30 =====', this.arguments_);
                if (quarkName in this.quarkConnections_) {
                    console.log('===== 31 =====', this.arguments_);
                    var connection = this.quarkConnections_[quarkName];
                    console.log('===== 32 =====', this.arguments_);
                    if (!connection || connection.targetConnection || connection.sourceBlock_.workspace != this.workspace) {
                        console.log('===== 34 =====', this.arguments_);
                        // Block no longer exists or has been attached elsewhere.
                        delete this.quarkConnections_[quarkName];
                        console.log('===== 35 =====', this.arguments_);
                    } else {
                        console.log('===== 36 =====', this.arguments_);
                        input.connection.connect(connection);
                        console.log('===== 37 =====', this.arguments_);
                    }
                    console.log('===== 38 =====', this.arguments_);
                }
                console.log('===== 39 =====', this.arguments_);
            }
            console.log('===== 40 =====', this.arguments_);
            input.init();
            console.log('===== 41 =====', this.arguments_);
        }
        console.log('===== 42 =====', this.arguments_);
        // Add 'with:' if there are parameters.
        var input = this.getInput('TOPROW');
        console.log('===== 43 =====', this.arguments_);
        if (input) {
            console.log('===== 44 =====', this.arguments_);
            if (this.arguments_.length) {
                console.log('===== 45 =====', this.arguments_);
                if (!this.getField_('WITH')) {
                    console.log('===== 46 =====', this.arguments_);
                    input.appendField(Blockly.Msg.PROCEDURES_CALL_BEFORE_PARAMS, 'WITH');
                    console.log('===== 47 =====', this.arguments_);
                    input.init();
                    console.log('===== 48 =====', this.arguments_);
                }
                console.log('===== 49 =====', this.arguments_);
            } else {
                console.log('===== 50 =====', this.arguments_);
                if (this.getField_('WITH')) {
                    console.log('===== 51 =====', this.arguments_);
                    input.removeField('WITH');
                    console.log('===== 52 =====', this.arguments_);
                }
                console.log('===== 53 =====', this.arguments_);
            }
            console.log('===== 54 =====', this.arguments_);
        }
        console.log('===== 55 =====', this.arguments_);
        // Restore rendering and show the changes.
        this.rendered = savedRendered;
        console.log('===== 56 =====', this.arguments_);
        if (this.rendered) {
            console.log('===== 57 =====', this.arguments_);
            this.render();
            console.log('===== 58 =====', this.arguments_);
        }
        console.log('=== callnoreturn_setProcedureParameters_arguments_bottom', this.arguments_);
        console.log('=== callnoreturn_setProcedureParameters_paramNames_bottom', paramNames);
        console.log('=== callnoreturn_setProcedureParameters_paramIds_bottom', paramIds);
    },
    /**
     * Create XML to represent the (non-editable) name and arguments.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        console.log('callnoreturn_mutationToDom_arguments_top', this.arguments_);
        var container = document.createElement('mutation');
        container.setAttribute('name', this.getProcedureCall());
        for (var i = 0; i < this.arguments_.length; i++) {
            var parameter = document.createElement('arg');
            parameter.setAttribute('name', this.arguments_[i]);
            container.appendChild(parameter);
        }
        console.log('callnoreturn_mutationToDom_arguments_bottom', this.arguments_);
        return container;
    },
    /**
     * Parse XML to restore the (non-editable) name and parameters.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        console.log('callnoreturn_domToMutation_arguments_top', this.arguments_);
        var name = xmlElement.getAttribute('name');
        this.setFieldValue(name, 'NAME');
        this.setTooltip(
            (this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP :
                Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP).replace('%1', name));
        var def = Blockly.Procedures.getDefinition(name, this.workspace);
        if (def && def.mutator && def.mutator.isVisible()) {
            // Initialize caller with the mutator's IDs.
            this.setProcedureParameters(def.arguments_, def.paramIds_);
        } else {
            var args = [];
            for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
                if (childNode.nodeName.toLowerCase() == 'arg') {
                    args.push(childNode.getAttribute('name'));
                }
            }
            // For the second argument (paramIds) use the arguments list as a dummy
            // list.
            this.setProcedureParameters(args, args);
        }
        console.log('callnoreturn_domToMutation_arguments_bottom', this.arguments_);
    },
    /**
     * Notification that a variable is renaming.
     * If the name matches one of this block's variables, rename it.
     * @param {string} oldName Previous name of variable.
     * @param {string} newName Renamed variable.
     * @this Blockly.Block
     */
    renameVar: function (oldName, newName) {
        console.log('callnoreturn_renameVar_arguments_top', this.arguments_);
        for (var i = 0; i < this.arguments_.length; i++) {
            if (Blockly.Names.equals(oldName, this.arguments_[i])) {
                this.arguments_[i] = newName;
                this.getInput('ARG' + i).fieldRow[0].setText(newName);
            }
        }
        console.log('callnoreturn_renameVar_arguments_bottom', this.arguments_);
    },
    /**
     * Add menu option to find the definition block for this call.
     * @param {!Array} options List of menu options to add to.
     * @this Blockly.Block
     */
    customContextMenu: function (options) {
        console.log('callnoreturn_customContextMenu_arguments_top', this.arguments_);
        var option = {
            enabled: true
        };
        option.text = Blockly.Msg.PROCEDURES_HIGHLIGHT_DEF;
        var name = this.getProcedureCall();
        var workspace = this.workspace;
        option.callback = function () {
            var def = Blockly.Procedures.getDefinition(name, workspace);
            def && def.select();
        };
        options.push(option);
        console.log('callnoreturn_customContextMenu_arguments_bottom', this.arguments_);
    }
};

Blockly.Blocks['newprocedures_callreturn'] = {
    /**
     * Block for calling a procedure with a return value.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLRETURN_HELPURL);
        this.setColour(Blockly.Blocks.procedures.HUE);
        this.appendDummyInput('TOPROW')
            .appendField(Blockly.Msg.PROCEDURES_CALLRETURN_CALL)
            .appendField('', 'NAME');
        this.setOutput(true);
        // Tooltip is set in domToMutation.
        this.arguments_ = [];
        this.quarkConnections_ = {};
        this.quarkArguments_ = null;
    },
    getProcedureCall: Blockly.Blocks['newprocedures_callnoreturn'].getProcedureCall,
    renameProcedure: Blockly.Blocks['newprocedures_callnoreturn'].renameProcedure,
    setProcedureParameters: Blockly.Blocks['newprocedures_callnoreturn'].setProcedureParameters,
    mutationToDom: Blockly.Blocks['newprocedures_callnoreturn'].mutationToDom,
    domToMutation: Blockly.Blocks['newprocedures_callnoreturn'].domToMutation,
    renameVar: Blockly.Blocks['newprocedures_callnoreturn'].renameVar,
    customContextMenu: Blockly.Blocks['newprocedures_callnoreturn'].customContextMenu
};

Blockly.Blocks['newprocedures_ifreturn'] = {
    /**
     * Block for conditionally returning a value from a procedure.
     * @this Blockly.Block
     */
    init: function () {
        this.setHelpUrl('http://c2.com/cgi/wiki?GuardClause');
        this.appendValueInput('CONDITION')
            .setCheck('Boolean')
            .appendField(Blockly.Msg.CONTROLS_IF_MSG_IF);
        this.appendValueInput('VALUE')
            .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg.PROCEDURES_IFRETURN_TOOLTIP);
        this.hasReturnValue_ = true;
    },
    /**
     * Create XML to represent whether this block has a return value.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = document.createElement('mutation');
        container.setAttribute('value', Number(this.hasReturnValue_));
        return container;
    },
    /**
     * Parse XML to restore whether this block has a return value.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        var value = xmlElement.getAttribute('value');
        this.hasReturnValue_ = (value == 1);
        if (!this.hasReturnValue_) {
            this.removeInput('VALUE');
            this.appendDummyInput('VALUE')
                .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
        }
    },
    /**
     * Called whenever anything on the workspace changes.
     * Add warning if this flow block is not nested inside a loop.
     * @this Blockly.Block
     */
    onchange: function () {
        if (!this.workspace) {
            // Block has been deleted.
            return;
        }
        var legal = false;
        // Is the block nested in a procedure?
        var block = this;
        do {
            if (block.type == 'newprocedures_defnoreturn' ||
                block.type == 'newprocedures_defreturn') {
                legal = true;
                break;
            }
            block = block.getSurroundParent();
        } while (block);
        if (legal) {
            // If needed, toggle whether this block has a return value.
            if (block.type == 'newprocedures_defnoreturn' && this.hasReturnValue_) {
                this.removeInput('VALUE');
                this.appendDummyInput('VALUE')
                    .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
                this.hasReturnValue_ = false;
            } else if (block.type == 'newprocedures_defreturn' &&
                !this.hasReturnValue_) {
                this.removeInput('VALUE');
                this.appendValueInput('VALUE')
                    .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
                this.hasReturnValue_ = true;
            }
            this.setWarningText(null);
        } else {
            this.setWarningText(Blockly.Msg.PROCEDURES_IFRETURN_WARNING);
        }
    }
};