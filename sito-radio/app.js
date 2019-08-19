const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const child_process = require("child_process")

const header = {'Content-Type': 'text/html'};

const indexTemplate = fs.readFileSync("index.ejs").toString();

function systemSync(cmd){
  try {
    child_process.execSync(cmd);
  } catch (error) {
    return error.status;
  }
  return 0;
}

const send = (source, destination, status = 200, headers = header) => {
  destination.writeHead(status, headers);
  fs.createReadStream(source).pipe(destination);
};

const sendJson = (data, destination, status = 200, headers = {'Content-Type': 'text/json'}) => {
  destination.writeHead(status, headers);
  destination.end(JSON.stringify(data));
}

const render = (source, param, destination, status = 200, headers = header) => {
  destination.writeHead(status, headers);
  const output = ejs.render(source, param);
  destination.end(output);
}

const server = http.createServer((req, res) => {

  const url = req.url;

  if (url === '/') {
    const radioStatus = systemSync("systemctl is-active --quiet radio") === 0 ? "Playing" : "Stopped";
    return render(indexTemplate, {radio: {status : radioStatus}}, res);
  } else if (url === "/script.js") {
    return send('script.js', res, 200, {'Content-Type' : 'text/javascript'});
  } else if (url.startsWith("/api/")) {
    const api = url.substr(5, url.length);
    console.log("requested api: " + api);
    if(api === "playRadio") {
      const ret = systemSync("systemctl start radio") === 0 ? "ok" : "fail";
      sendJson({status : ret}, res);
    } else if(api === "pauseRadio") {
      const ret = systemSync("systemctl stop radio") === 0 ? "ok" : "fail";
      sendJson({status : ret}, res);
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
