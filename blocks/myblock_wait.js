Blockly.Blocks['wait_sec'] = {
  init: function() {
    this.appendValueInput("VAL")
        .setCheck(null)
        .appendField("wait sec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(10);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['wait_millisec'] = {
  init: function() {
    this.appendValueInput("VAL")
        .setCheck(null)
        .appendField("wait millisec");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(10);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
