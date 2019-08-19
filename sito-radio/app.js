const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const child_process = require("child_process");
const { parse } = require('querystring');
const auth = require('http-auth');

const header = {'Content-Type': 'text/html'};

function systemSync(cmd){
  try {
    child_process.execSync(cmd);
  } catch (error) {
    return error.status;
  }
  return 0;
}

function systemStdout(cmd) {
  return child_process.execSync(cmd);
}

function getCurrentVolume() {
  return parseInt(systemStdout("amixer sget 'Line Out' | grep 'Front Left: Playback' | cut -b 24-25"));
}

const send = (source, destination, status = 200, headers = header) => {
  destination.writeHead(status, headers);
  fs.createReadStream(source).pipe(destination);
};

const sendJson = (data, destination, status = 200, headers = {'Content-Type': 'text/json'}) => {
  destination.writeHead(status, headers);
  destination.end(JSON.stringify(data));
}

const basic = auth.basic({
    realm: "Carlo Ramponi.",
    file: "users.htpasswd"
});

const server = http.createServer(basic, (req, res) => {

  const url = req.url;

  if (url === '/') {
    return send("index.html", res);
  } else if (url.endsWith(".html")) {
    var file = url.substr(1, url.length);
    if(fs.existsSync(file)) {
      return send(file, res);
    } else {
      send('404.html', res, 404, {});
    }
  } else if(url.endsWith(".js") && url !== "/app.js") {
    var file = url.substr(1, url.length);
    if(fs.existsSync(file)) {
      return send(file, res, 200, {'Content-Type' : 'text/javascript'});
    } else {
      send('404.html', res, 404, {});
    }
  } else if (url.startsWith("/api/")) {

    const api = url.substr(5, url.length);
    console.log("requested api: " + api);
    if(api === "playRadio") {
      const ret = systemSync("systemctl start radio") === 0 ? "ok" : "fail";
      sendJson({status : ret}, res);
    } else if(api === "pauseRadio") {
      const ret = systemSync("systemctl stop radio") === 0 ? "ok" : "fail";
      sendJson({status : ret}, res);
    } else if(api === "getRadioStatus") {
      const radioStatus = systemSync("systemctl is-active --quiet radio") === 0 ? "Playing" : "Stopped";
      sendJson({status : radioStatus}, res);
    } else if(api === "getVolume") {
      const volume = getCurrentVolume();
      sendJson({volume : volume}, res);
    } else if(api.startsWith("setVolume")) {
      const data = parse(api.substr(10, api.length));
      if(systemSync("amixer sset 'Line Out' " + data.volume) === 0) {
        sendJson({status : "ok"}, res);
      } else {
        sendJson({status : "fail"}, res);
      }
    } else if(api === "getAudioList") {
      const list = fs.readdirSync("recordings");
      sendJson({audio : list}, res);
    } else if(api.startsWith("playRecording")) {
      const data = parse(api.substr(14, api.length));
      if(systemSync("mpv recordings/" + data.audio) === 0) {
        sendJson({status : "ok"}, res);
      } else {
        sendJson({status : "fail"}, res);
      }
    } else {
      console.log("api \"" + api + "\" not found");
      sendJson("", res, 404);
    }
  }else {
    send('404.html', res, 404, {});
  }

});

const callback = () => {
  const address = server.address().address;
  const port = server.address().port;
  console.log(`Server avviato all'indirizzo https://${address}:${port}`);
};

server.listen(80, callback);
