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
  }});
}

$("#volume-slider").change(() => {
  $.ajax({
  url: "/api/setVolume",
  data: { volume : $("#volume-slider").val() },
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
