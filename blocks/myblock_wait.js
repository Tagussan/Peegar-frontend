Blockly.Blocks['wait_sec'] = {
  init: function() {
    this.appendValueInput("VAL")
        .setCheck(null)
        .appendField("wait sec");
        //.appendField(Blockly.Msg.WAIT_SEC);
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
        //.appendField(Blockly.Msg.WAIT_MILLISEC);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(10);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
