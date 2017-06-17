/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var bodyParser =	require("body-parser");
var multer	=	require('multer');
var app	=	express();
var cfenv = require('cfenv');
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

app.use(bodyParser.json());
var storage	=	multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
    },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});
var upload = multer({ storage : storage }).array('userPhoto',50);

app.get('/',function(req,res){
      res.sendFile(__dirname + "/index.html");
});

app.post('/api/photo',function(req,res){
	upload(req,res,function(err) {
     var filename = req.body.filename // send this from UI
    var filecontent = req.files
		console.log(req.body);
		console.log(req.files);
// object storage code
//if(typeof require !== 'undefined') XLSX = require('xlsx');
// var workbook = XLSX.readFile(filecontent);
var fileBuffer = new Buffer(filecontent,"base64");
  var ObjectStorage = require('bluemix-objectstorage').ObjectStorage;

  var credentials = {
	    projectId: '1b7c5afbaf2c4367930f3e6dae3ff707',
	    userId: '313aac6a21374d039ffddcc1067a876c',
	    password: 'U4/jeqX~1ba3Dr*U',
	    region: ObjectStorage.Region.DALLAS
	};
var objStorage = new ObjectStorage(credentials);

var container;

objStorage.getContainer('pocobjstg')
.then(function(cont) {
	container = cont;
	console.log('success');
container.createObject("newfile.xls",fileBuffer.toString())
.then(function(object) {
	console.log(object);
  res.status(200).json("success");
//  res.end("File is uploaded");
    // object - the ObjectStorageObject that was created
})
.catch(function(err) {
    // TimeoutError if the request timed out
    // AuthTokenError if there was a problem refreshing authentication token
    // ServerError if any unexpected status codes were returned from the request
});

    // container - the specified ObjectStorageContainer fetched from the IBM Object Storage service
})
.catch(function(err) {
    // ResourceNotFoundError if the specified container does not exist
    // AuthTokenError if there was a problem refreshing authentication token
    // ServerError if any unexpected status codes were returned from the request
});


		if(err) {
		//	return res.end("Error uploading file.");
		}
		
	});
});



// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
