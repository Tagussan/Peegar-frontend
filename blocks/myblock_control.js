Blockly.Blocks['controls_repeat_forever'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("repeat forever");
        //.appendField(Blockly.Msg.CONTROLS_REPEAT_FOREVER);
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
