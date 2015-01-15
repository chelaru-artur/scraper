 var childProcess = require('child_process'),
 	scraper;

 function execute() {
 	scraper = childProcess.exec('casperjs scraper.js', function(error, stdout, stderr) {
 		console.log(stdout);
 	});
 	scraper.on('exit', function(code) {
 		//if code 2 then open scraper.js again to get data from next page
 		if (code == 2)
 			execute();
 		console.log('Exit with code ', code);
 	});
 }
 execute();