const updateRadioStatus = () => {
  $.ajax({
  url: "/api/getRadioStatus",
  success: function( result ) {
    $("#status-radio").text(result.status);
    $("#status-radio").css({ color : result.status === "Playing" ? "green" : "red" });
  }});
}

const updateVolume = () => {
  $.ajax({
  url: "/api/getVolume",
  success: function( result ) {
    $("#volume-slider").val(result.volume);
    $("#volume-label").text(result.volume);
  }});
}

const getAudioList = () => {
  $.ajax({
  url: "/api/getAudioList",
  success: function( result ) {
    updateRecondingsPanel(result.audio)
  }});
}

function playRecording(rec) {
  console.log("Playing recording: " + rec);
  $.ajax({
    url: "/api/playRecording",
    data: { audio : rec },
    success: function( result ) {
      if(result.status === "ok") {
        console.log("Success playing " + rec);
      } else {
        console.log("Error playing " + rec);
      }
  }});
}

function updateRecondingsPanel(recordings) {

  var html = "";

  for(var i = 0; i < recordings.length; i++) {
    html += "<div class='mt-5'><h3>" + recordings[i].split('.')[0] + "</h3><div class='mt-4'><button type='button' class='btn btn-default' onclick='playRecording(\"" + recordings[i] + "\")'><span class='glyphicon glyphicon-play'></span>  Play</button></div></div>";
  }

  $("#recondingsList").html(html);
}

$("#volume-slider").change(() => {
  var val = $("#volume-slider").val();
  $("#volume-label").text(val);
  $.ajax({
  url: "/api/setVolume",
  data: { volume : val },
  success: function( result ) {
    if(result.status === "ok") {
      updateVolume();
      console.log("Success updating volume")
    } else {
      console.log("Error updating volume");
    }
  }});
});

$("#play-radio").click(() => {
    console.log("clicked play");
    $.ajax({
    url: "/api/playRadio",
    success: function( result ) {
      if(result.status === "ok"){
        updateRadioStatus();
      } else {
        console.log("Api went not ok");
      }
    }});
});

$("#pause-radio").click(() => {
  console.log("clicked pause");
  $.ajax({
  url: "/api/pauseRadio",
  success: function( result ) {
    if(result.status === "ok"){
      updateRadioStatus();
    } else {
      console.log("Api went not ok");
    }
  }});
});

updateRadioStatus();
updateVolume();
getAudioList();
