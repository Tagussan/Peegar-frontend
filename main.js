var Peegar = Peegar || {};
injectBlockly();

$(window).resize(function () {
  setWorkspaceHeight();
});

$(document).ready(function() {
//hide navbar automatically in mobile devices
  $('.navbar-collapse a').click(function(){
    $(".navbar-collapse").collapse('hide');
  });
});

function setWorkspaceHeight() {
  hsize = $(window).height();
  $("#blocklyDiv").css("height", Math.round(hsize * 0.8) + "px");
}

function injectBlockly() {
  $.ajax({
    url:'./toolbox.xml',
    type:'GET',
    dataType:'xml',
    timeout:1000,
    error:function() {
      alert("loading toolbox failed");
    },
    success:function(xml){
      var xmlStr = new XMLSerializer().serializeToString(xml);
      $("#toolboxWrapper").html(xmlStr);
      setWorkspaceHeight();
      var startScale = 1.3;
      if($(window).width() < 767){
        startScale = 1.5;
      }
      Peegar.workspace = Blockly.inject('blocklyDiv',
          {
            media: './blockly/media/',
            //collapse : true, 
            //comments : true, 
            //disable : true, 
            //maxBlocks : Infinity, 
            trashcan : true, 
            //horizontalLayout : false, 
            //toolboxPosition : 'start', 
            //css : true, 
            //rtl : false, 
            //scrollbars : true, 
            //sounds : true, 
            //oneBasedIndex : true, 
            grid : {
              spacing : 20, 
              length : 1, 
              colour : '#888', 
              snap : false
            }, 
            zoom : {
              controls : true, 
              wheel : false, 
              startScale : startScale, 
              maxcale : 3, 
              minScale : 0.3,
              scaleSpeed : 1.2
            },
            toolbox: $("#toolbox")[0]
          }
      );
      if($(window).width() < 767){
        toggleToolbox();//hide toolbox if mobile phone
      }
    }
  });
}

function downloadWorkspace() {
  var xml = Blockly.Xml.workspaceToDom(workspace);
  var txt = Blockly.Xml.domToText(xml);

  var blob = new Blob([ txt ], { "type" : "text/plain" });
  if (window.navigator.msSaveBlob) { 
    window.navigator.msSaveBlob(blob, "test.txt"); 

    // msSaveOrOpenBlobの場合はファイルを保存せずに開ける
    window.navigator.msSaveOrOpenBlob(blob, "test.txt"); 
  } else {
    document.getElementById("downloadWorkspace").href = window.URL.createObjectURL(blob);
  }
}

function uploadWorkspace() {
  var filebutton = document.getElementById("uploadWorkspaceFile");
  var file = filebutton.files[0];
  var reader = new FileReader();
  reader.onload = function(e){
    console.log("loaded:" + reader.result);
    var xml = Blockly.Xml.textToDom(reader.result);
    Blockly.Xml.domToWorkspace(xml, workspace);
  };
  reader.readAsText(file);
}

function toggleToolbox() {
  $(".blocklyToolboxDiv").toggle();
}

function showErrModal(title, body) {
  showModal(title, body);
}

function showModal(title, body) {
  var modaltitle = $("#modal-title");
  var modalbody = $("#modal-body");
  modaltitle.text(title);
  modalbody.html(body);
  $("#modal").modal('show');
}
