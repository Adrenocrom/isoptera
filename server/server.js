const HTTP_PORT = 7777;

const fs = require('fs');
const http = require('http');
const prefix = "www";

const handleRequest = function(request, response) {
  console.log('request received: ' + request.url);

  if(request.url === '/') {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(fs.readFileSync(prefix + '/index.html'));
  }
  else if(request.url === "/cordova.js") {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end("");
  } else if(request.url.endsWith(".js")) {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync(prefix + request.url));
  } else if(request.url.endsWith(".css")) {
    response.writeHead(200, {'Content-Type': 'text/css'});
    response.end(fs.readFileSync(prefix + request.url));
  }
  else if(request.url.endsWith(".woff")) {
    response.writeHead(200, {'Content-Type': 'application/font-woff'});
    response.end(fs.readFileSync(prefix + request.url));
  }
  else if(request.url.endsWith(".woff2")) {
    response.writeHead(200, {'Content-Type': 'application/font-woff'});
    response.end(fs.readFileSync(prefix + request.url));
  }
  else if(request.url === "/favicon.ico") {
    response.writeHead(200, {'Content-Type': 'image/x-icon'});
    var favicon = fs.readFileSync(prefix + request.url);
    response.end(favicon, "binary");
  }
  else if(request.url === "/manifest.json") {
    response.writeHead(200, {'Content-Type': 'application/manifest+json'});
    response.end(fs.readFileSync(prefix + request.url));
  }
  else if(request.url.endsWith(".png")) {
    response.writeHead(200, {'Content-Type': 'image/png'});
    var image = fs.readFileSync(prefix + request.url);
    response.end(image, "binary");
  }
	else if(request.url.endsWith(".jpg")) {
    response.writeHead(200, {'Content-Type': 'image/jpg'});
    var image = fs.readFileSync(prefix + request.url);
    response.end(image, "binary");
  }
};

const httpServer = http.createServer(handleRequest);
httpServer.listen(HTTP_PORT);

console.log("server is running at port: " + HTTP_PORT);
