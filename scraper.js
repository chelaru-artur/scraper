var fs = require('fs');
var args = require('system').args;

var casper = require('casper').create({
	pageSettings: {
		loadImages: false, // The WebPage instance used by Casper will
		loadPlugins: false, // use these settings		
	}
});
// var file = JSON(fs.readFile('link.json'));
// console.log(file);
// var search = file[0];
// var index = file[1]; 
var data = [];
var nextPage = '';
var t = new Date();
var next = './nextpage.txt';
//js code that will be injectet into page and will return product data
function getProductInfo() {
	var data = {};
	data.title = (document.getElementById('productTitle')) ? document.getElementById('productTitle').innerText : null;
	data.salePrice = (document.getElementById('priceblock_saleprice')) ? document.getElementById('priceblock_saleprice').innerText : null;
	data.ourPrice = (document.getElementById('priceblock_ourprice')) ? document.getElementById('priceblock_ourprice').innerText : null;
	data.availability = (document.getElementById('availability')) ? document.getElementById('availability').innerText : null;
	data.feature_bullets = (document.getElementById('feature-bullets')) ? document.getElementById('feature-bullets').innerText : null;
	data.description = (document.querySelector('.productDescriptionWrapper')) ? document.querySelector('.productDescriptionWrapper').innerText : null;
	//get product details 
	data.productDetails = {};
	var details = (document.getElementById('detail-bullets')) ? document.getElementById('detail-bullets').querySelectorAll('.content li') : null;
	if (details !== null) {
		for (var i = 0; i < details.length; i++) {
			var key = details[i].querySelector('b').innerText;
			var val = details[i].innerText;
			val = val.slice(key.length);
			data.productDetails[key] = val;
		}
	}
	return data;
}
console.log(args[args.length - 1]);
//open next_page url if exists
if (!fs.exists(next)) {
	casper.start(args[args.length - 1]);
} else {
	var url = fs.read(next);
	casper.start(url);
}

casper.then(function() {
	nextPage = casper.evaluate(function() {
		var next = document.querySelector('#pagnNextLink');
		if (next === null)
			return null;
		return next.href;
	});
	var links = [];
	links = this.evaluate(function() {
		var links = document.querySelectorAll('.s-access-detail-page');
		return Array.prototype.map.call(links, function(e) {
			return e.getAttribute('href');
		});
	});

	//open all products from page and get product data
	casper.eachThen(links, function(link) {
		this.thenOpen(link.data, function() {
			var product = casper.evaluate(getProductInfo);
			if (product !== null)
				data.push(product);
		});
	});
});

casper.then(function() {
	//write or append prodtucts data to data.json
	var path = 'data.json';
	if (!fs.exists(path)) {
		fs.write(path, JSON.stringify(data), 'w');
		this.echo(data.length + ' products');
	} else {
		var file = fs.read(path);
		var fileData = JSON.parse(file);
		fs.write(path, JSON.stringify(fileData.concat(data), 'w'));
		this.echo(fileData.length + data.length + ' products');
	}
});

casper.then(function() {
	//if there is nextPage button then exit with code 2 , if there aree no more pages exit with code 0
	t = new Date().getTime() - t.getTime();
	console.log('Complete in ', t, 'ms');
	if (nextPage) {
		fs.write(next, nextPage, 'w');
		casper.exit(2);
	} else {
		fs.remove(next);
		console.log('Scraping finished')
		casper.exit(0);
	}
});
casper.run();