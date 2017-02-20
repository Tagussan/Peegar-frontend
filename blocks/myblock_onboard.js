Blockly.Blocks['onboard_led'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("onboard LED Output")
        .appendField("group")
        .appendField(new Blockly.FieldDropdown([["A", "A"], ["B", "B"]]), "GROUP")
        .appendField("state")
        .appendField(new Blockly.FieldDropdown([["ON", "ON"], ["OFF", "OFF"]]), "STATE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(45);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['onboard_switch'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("onboard Switch Input")
        .appendField("group")
        .appendField(new Blockly.FieldDropdown([["A", "A"], ["B", "B"]]), "GROUP");
    this.setOutput(true, null);
    this.setColour(45);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
