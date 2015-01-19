 var childProcess = require('child_process'),
 	scraper, dirs;
 var fs = require('fs');
 var links = [];
 var i = 0;

 function getDirs() {
 	dirs = childProcess.exec('casperjs subdir.js', function(error, stdout, stderr) {
 		//console.log(stdout);
 	});

 	dirs.on('exit', function() {
 		var f = fs.readFileSync('subdirs.json');
 		links = JSON.parse(f.toString());
 		links = links.map(function(e) {
 			return e.slice(0, e.search('&'));
 		});
 		(links.length > 0) ? execute(links[i]): console.log('err');
 	});
 }

 function execute(l) {
 	var s = (l) ? 'casperjs scraper.js' + ' ' + l : 'casperjs scraper.js';
 	scraper = childProcess.exec(s, function(error, stdout, stderr) {
 		console.log(stdout);
 	});
 	scraper.on('exit', function(code) {
 		//if code 2 then open scraper.js again to get data from next page
 		if (code == 2) {
 			execute();
 		} else {
 			i++;
 			execute(links[i]);
 		}
 		if (i > links.length - 1) {
 			console.log('Finish');
 			process.exit();
 		}
 		console.log('Exit with code ', code);
 	});
 }
 getDirs();