var http = require('http');
var path = require('path');
var url  = require('url');
var fs   = require('fs');
var cssHelpers = require('./cssHelpers.js');

// -- FILE SERVER

var requestHandler = function (req, res) {
  console.log(req.method, 'request made for', req.url);
  manageFiles(req, res);
};

// -- HELPERS

var getContentType = function (requestedFile) {
  var parsed = requestedFile.split('.');
  var filetype = parsed[parsed.length-1];

  var contentTypes = {
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    js: "application/javascript",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    png: "image/png"
  }

  var contentType = contentTypes[filetype] || 'text/plain';
  return contentType;
};

var methodHandler = {
  GET: function (rurl, res) {
    var file = url.parse(rurl).pathname;
    if (file === '/' || file === '') {
      file = '/index.html';
    }

    var data = fs.readFileSync( __dirname + '/client' + file );
    corsHeaders['content-type'] = getContentType(file);

    res.writeHead(200, corsHeaders);
    res.end(data);
  },
  getCSS: function (rurl, res) {
    console.log('attempting to get CSS for', rurl);
    downloadPage(rurl, res);
  }
};

var manageFiles = function (req, res) {
  var statusCode = 200;
  if( req.url.split('=')[0] === '/?url' ){
    methodHandler.getCSS(unescape(req.url.split('=')[1]), res);
  } else {
    methodHandler[req.method](req.url, res);
  }
};

var downloadPage = function(rurl, res){
  console.log(url.parse(rurl));
  console.log('Downloading html:', rurl);
  http.get(rurl, function(response){

    var pageData = '';
    response.on('data', function(chunk){
      pageData += chunk;
    });

    response.on('end', function () {
      //console.log(url)
      savePage(pageData, rurl, res);
    });
  })
};

var savePage = function (page, rurl, res) {
  var localFile = __dirname + '/res/' + 'page.txt';
  fs.writeFile(localFile, page, function(err) {
    if( err ){
      console.log("Failed to create file for ", rurl);
    } else {
      console.log(localFile + " created.");
      cssHelpers.identifyCSS(localFile, rurl);
    }
  });
};

// -- POSSIBLE FUTURE FEATURE: Image color profiling for pages with background images.

// var downloadImage = function(rurl, res){
//   console.log(url.parse(rurl));
//   console.log('Downloading ', rurl);
//   http.get(rurl, function(response){

//     var imageData = '';
//     response.on('data', function(chunk){
//       imageData += chunk;
//     });

//     response.on('end', function () {
//       //console.log(url)
//       saveImage(imageData, rurl, res);
//     });
//   })
// };

// var serveImage = function (file) {
//   return false;
// };

// var saveImage = function (image, rurl, res) {
//   var filetype = url.parse(rurl).pathname.split('.')[url.parse(rurl).pathname.split('.').length-1];
//   console.log(filetype, url.parse(rurl).pathname)
//   var localFile = __dirname + '/res/' + 'image.' + filetype;
//   fs.writeFile(localFile, image, function(err) {
//     if( err ){
//       console.log("Failed to create file for ", file);
//     } else {
//       serveImage('image' + filetype, localFile);
//       // document.write(file + " created.");
//     }
//   });
// };

// -- CORS!

var corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

// Setup server
var port = process.env.PORT || 8080;
var server = http.createServer(requestHandler);
console.log('Listening on port:', port);
server.listen(port);