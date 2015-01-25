 var childProcess = require('child_process');
 var fs = require('fs');

 function getDirs() {
 	var dirs = childProcess.exec('casperjs subdir.js', function(error, stdout, stderr) {
 		console.log(stdout);
 	});

 	dirs.on('exit', function() {
 		var f = fs.readFileSync('subdirs.json');
 		links = JSON.parse(f.toString());
 		links = links.map(function(e) {
 			return e.slice(0, e.search('&'));

 		});

 		links.forEach(function(l, i) {
 			getPages(l, i); //get links for all pages with products list
 		});

 	});
 }

 function getPages(url, index) {
 	var s = (url) ? 'casperjs getPages.js ' + url + ' ' + index : 'casperjs getPages.js ' + index;
 	var child = childProcess.exec(s, function(error, stdout, stderr) {
 		console.log(stdout);
 	});

 	child.on('exit', function(code) {
 		if (code == 2) {
 			getPages('null', index);
 		} else {
 			console.log('finished');
 		}
 	});
 }

 getDirs();