
 var async = require('async');
 var childProcess = require('child_process');
 var fs = require('fs');
 var links = [];
 var toParse =  [];
 var initialLength = 0;
 var currentLength = 0;
/*
 var q = async.queue(function(url, callback) {
 
 	var scraper = childProcess.fork('./scraper.js',[url]);

 		scraper.on('exit', function(code) {
 			console.log('Exit with code ', code);
 			callback();
 		});

 }, 4);
*/
 
function parseData(url,callback){
	var scraper = childProcess.spawn('node', ['scraper.js',url],{cwd : process.cwd()});
scraper.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});


                scraper.on('exit', function(code) {
                        console.log('Exit with code ', code);
                        callback();
                });


}

function doTheJob(){
  if(!toParse.length) return;
  var url = toParse.splice(0,1);
  parseData(url, function(){
    currentLength++;
    if(currentLength === initialLength){
      // all data parsed
	console.log("Finish");
    }
    doTheJob();
  });
};
/*
  var child = childProcess.fork('./getLinks.js'); //first get links of all pages with list of products
  child.on('exit', function() {
  	var pages = fs.readdirSync('./pages');
  	pages.forEach(function(f) {
  		var data = fs.readFileSync('./pages/' + f, 'utf8')
  			 data = JSON.parse(data);
  			 toParse = toParse.concat(data);
  	});
	initialLength = toParse.length;
  	for(var i = 0; i<2; i++)
    		doTheJob();

  });
 
*/

  var pages = fs.readdirSync('./pages');
        pages.forEach(function(f) {
                var data = fs.readFileSync('./pages/' + f, 'utf8')
                         data = JSON.parse(data);
                         toParse = toParse.concat(data);
        });
        initialLength = toParse.length;
        for(var i = 0; i<1; i++)
                doTheJob();
