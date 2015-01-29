 var MongoClient = require('mongodb').MongoClient;
 var async = require('async');
 var childProcess = require('child_process');
 var fs = require('fs');
 var links = [];

 function addProduct(product) {

 	MongoClient.connect('mongodb://127.0.0.1:27017/AmazonScraper', function(err, db) {
 		if (err) throw err;
 		var collection = db.collection('cosmetics');
 		collection.insert(product, function(err, docs) {
 			console.log('Added one product');
 			db.close();
 		});
 	});
 }

 function IsJsonString(str) {
 	try {
 		JSON.parse(str);
 	} catch (e) {
 		return false;
 	}
 	return true;
 }

 var q = async.queue(function(l, callback) {
 	var converted = ''; // convert to unicode code needed to pass arguments to scraper
 	for (var i = 0; i < l.length; i++) {
 		converted += l.charCodeAt(i).toString() + '_';
 	}

 	MongoClient.connect('mongodb://127.0.0.1:27017/AmazonScraper', function(err, db) {
 		if (err) throw err;
 		var collection = db.collection('cosmetics');

 		var s = (l) ? 'casperjs scraper.js' + ' ' + converted : 'casperjs scraper.js';
 		var scraper = childProcess.exec(s, function(error, stdout, stderr) {
 			//console.log(stdout);
 		});

 		scraper.stdout.on('data', function(buf) {
 			if (IsJsonString(buf)) {
 				collection.insert(JSON.parse(buf), function(err, docs) {
 					console.log('Added one product');

 				});
 			}
 		});

 		scraper.on('exit', function(code) {
 			console.log('Exit with code ', code);
 			db.close();
 			callback();
 		});

 	});


 }, 5);

 /*  Uncoment when you want to get all product page links
  var child = childProcess.fork('./getLinks.js'); //first get links of all pages with list of products
  child.on('exit', function() {
  	var pages = fs.readdirSync('./pages');
  	pages.forEach(function(f) {
  		fs.readFile('./pages/' + f, 'utf8', function(err, data) {
  			var data = JSON.parse(data);
  			data.forEach(function(url) {
  				q.push(url);
  			});
  		});
  	});
  });
 */

 var pages = fs.readdirSync('./pages');
 pages.forEach(function(f) {
 	fs.readFile('./pages/' + f, 'utf8', function(err, data) {
 		var data = JSON.parse(data);
 		data.forEach(function(url) {
 			q.push(url);
 		});
 	});
 });