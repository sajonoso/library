function create_UUID() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}



const https = require('https');
const http = require('http');
const url = require('url');

const HttpRequest = (fullurl, options, body) =>
  new Promise((resolve, reject) => {
    const urlObject = url.parse(fullurl);
    const allOptions = Object.assign(options, {
      hostname: urlObject.hostname,
      path: urlObject.path,
      port: urlObject.port,
    });

    const request = fullurl.toUpperCase().indexOf('HTTPS') === 0 ? https.request : http.request;

    const req = request(allOptions, res => {
      let result = '';
      res.setEncoding('utf8');
      res.on('data', chunk => (result += chunk));
      res.on('end', () => {
        resolve(result);
      });
    });

    req.on('error', err => reject(err));
    req.write(body);
    req.end();
  });
