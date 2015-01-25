var fs = require('fs');
var args = require('system').args;
var casper = require('casper').create({
	pageSettings: {
		loadImages: false, // The WebPage instance used by Casper will
		loadPlugins: false, // use these settings		
	}
});

var link = args[args.length-2];
var index = './pages/' + args[args.length-1];

if (!fs.exists(index)) {
	casper.start(link);
} else {
	var url = JSON.parse(fs.read(index));
	casper.start(url[url.length-1]);
}
casper.then(function() {
	nextPage = casper.evaluate(function() {
		var next = document.querySelector('#pagnNextLink');
		if (next === null)
			return null;
		return next.href;
	});

	if(nextPage.length < 1){		
		this.ext(); // ignores exit fucntion so just simulated syntax error
	}
	if (nextPage !== null) {
				console.log(nextPage);
		if (!fs.exists(index)){
			fs.write(index, JSON.stringify([nextPage]), 'w');
		}else{
			var f = JSON.parse(fs.read(index));
			f.push(nextPage);
			fs.write(index, JSON.stringify(f), 'w');
		}
     casper.exit(2);
	};
});
casper.run();