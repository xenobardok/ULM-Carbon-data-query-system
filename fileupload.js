var formidable = require('formidable'),
    http = require('http'),
    util = require('util'),
    fs = require("fs");
var csvParser = require('csv-parse');
http.createServer(function(req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + "\\";
    form.keepExtensions = true;
    form.on('file', function(field, file) {
        //rename the incoming file to the file's name
            fs.rename(file.path, form.uploadDir + "/newUploads/" + file.name);
    });
    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));
      
    });

    return;
  }

  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
}).listen(8080);