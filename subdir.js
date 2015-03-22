var fs = require('fs');
var casper = require('casper').create({
	pageSettings: {
		loadImages: false, // The WebPage instance used by Casper will
		loadPlugins: false // use these settings
	}
});

casper.start('http://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Dbeauty&field-keywords=', function() {

	var links = casper.evaluate(function(){
           var e = document.querySelectorAll('.acs-tiles-row ul a');
           var l = [];
           for(var i = 0 ; i < e.length;i++ ){
           	  var link = e[i].querySelector('a').href; 
           	   l.push(link);
           };
           return l;
	});
 fs.write('subdirs.json',JSON.stringify(links),'w');
 casper.exit();
});

casper.run();