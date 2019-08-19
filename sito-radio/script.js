$("#play-radio").click(() => {
    console.log("clicked play");
    $.ajax({
    url: "/api/playRadio",
    success: function( result ) {
      console.log(result);
      if(result.status === "ok"){
        location.reload();
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
      location.reload();
    } else {
      console.log("Api went not ok");
    }
  }});
})
