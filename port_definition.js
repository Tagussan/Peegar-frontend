function portobj(text, functionality){
  return {text: text, functionality: functionality};
}

var port_definition_A = [
  portobj("Sw: ", "DIn"),
  portobj("LED: ", "DOut AOut"),
  portobj("A1: ", "DOut AOut DIn"),
  portobj("A2: ", "DOut AOut DIn"),
  portobj("A3: ", "DOut AOut DIn"),
  portobj("A4: ", "DOut DIn"),
  portobj("A5: ", "DOut DIn"),
  portobj("A6: ", "DOut AOut DIn"),
  portobj("A7: ", "DOut DIn"),
  portobj("A8: ", "DOut DIn"),
];

var port_definition_B = [
  portobj("Sw: ", "DIn"),
  portobj("LED: ", "DOut"),
  portobj("B1: ", "DOut AOut DIn AIn"),
  portobj("B2: ", "DOut DIn AIn"),
  portobj("B3: ", "DOut DIn AIn"),
  portobj("B4: ", "DOut AOut DIn AIn"),
  portobj("B5: ", "DOut AOut DIn AIn"),
  portobj("B6: ", "DOut AOut DIn AIn"),
  portobj("B7: ", "DOut DIn"),
  portobj("B8: ", "DOut DIn")
];

function getPortSettings(){
  return $(".port select").map(function(i, e){ 
    return $(e).val()
  });   
}

function addPortDefs(port_definition){
  var portSettings = $('<div>')
      .addClass("portSettings");

  for(var i = 0; i < port_definition.length; i++){
    var port = $('<div>')
      .addClass("port")
      .addClass('form-group');
    var portlabel = $('<label>')
      .addClass("control-label col-lg-3")
      .text(port_definition[i].text);
    port.append(portlabel);
    var select = $('<select>')
      .addClass(port_definition[i].functionality)
      .addClass('col-lg-9')
      .addClass('selectpicker')
      .attr('data-width', '75%');

    if(select.hasClass('DOut')){
      var option = $('<option>')
        .val("DOut")
        .text("Digital Out");
      select.append(option);
    }
    if(select.hasClass('AOut')){
      var option = $('<option>')
        .val("AOut")
        .text("Analog Out");
      select.append(option);
    }
    if(select.hasClass('DIn')){
      var option = $('<option>')
        .val("DInRaw")
        .text("Digital In");
      select.append(option);
      option = $('<option>')
        .val("DInSlow")
        .text("Digital In(slow)");
      select.append(option);
    }
    if(select.hasClass('AIn')){
      var option = $('<option>')
        .val("AIn")
        .text("Analog In");
      select.append(option);
    }
    port.append(select);
    portSettings.append(port);
  }

  return portSettings;
}

$(document).ready(function() {
  $('#portGroupA').append(addPortDefs(port_definition_A));
  $('#portGroupB').append(addPortDefs(port_definition_B));
});

