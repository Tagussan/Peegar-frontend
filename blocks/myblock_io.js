Blockly.Blocks['user_port_output'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("user port output");
    this.appendValueInput("VAL")
        .setCheck(null)
        .appendField("port")
        .appendField(new Blockly.FieldDropdown([["A", "GROUPA"], ["B", "GROUPB"]]), "GROUP")
        .appendField(new Blockly.FieldDropdown([["Onboard LED", "ONBOARD"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "PORTNUM")
        .appendField("mode")
        .appendField(new Blockly.FieldDropdown([["Digital", "DIGITAL"], ["Analog", "ANALOG"]]), "IOTYPE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(45);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['user_port_input'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("user port input");
    this.appendDummyInput()
        .appendField("port")
        .appendField(new Blockly.FieldDropdown([["A", "GROUPA"], ["B", "GROUPB"]]), "GROUP")
        .appendField(new Blockly.FieldDropdown([["Onboard SW", "ONBOARD"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]]), "PORTNUM")
        .appendField("mode")
        .appendField(new Blockly.FieldDropdown([["Digital", "DIGITAL"], ["Digital(Slow)", "DIGITALSLOW"], ["Analog", "ANALOG"]]), "IOTYPE");
    this.setOutput(true, null);
    this.setColour(45);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
