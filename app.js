
 var async = require('async');
 var childProcess = require('child_process');
 var fs = require('fs');
 var links = [];


 var q = async.queue(function(url, callback) {
 
 	var scraper = childProcess.fork('./scraper.js',[url]);

 		scraper.on('exit', function(code) {
 			console.log('Exit with code ', code);
 			callback();
 		});

 }, 4);

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
 