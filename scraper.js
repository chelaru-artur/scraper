var fs = require('fs');
var args = require('system').args;

var casper = require('casper').create({
	pageSettings: {
		loadImages: false, // The WebPage instance used by Casper will
		loadPlugins: false, // use these settings		
	}
});
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

var url = '';
var arg = args[args.length - 1];

arg = arg.split('_');
arg.pop();
url = String.fromCharCode.apply(this, arg);

casper.start(url);
casper.then(function() {
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
			if (product !== null) {
				console.log(JSON.stringify(product)); // send product to stdout
			}
		});
	});
});

casper.run();
