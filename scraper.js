try {
	var Spooky = require('spooky');
} catch (e) {
	var Spooky = require('../lib/spooky');
}

var MongoClient = require('mongodb').MongoClient;


var url = process.argv[process.argv.length - 1];
console.log(url);

MongoClient.connect('mongodb://127.0.0.1:27017/AmazonScraper', function(err, db) {
	if (err) throw err;
	var collection = db.collection('cosmetics');

	var spooky = new Spooky({
		child: {
			transport: 'http'
		},
		casper: {
			logLevel: 'debug',
			verbose: true,
			pageSettings: {
				loadImages: false, // The WebPage instance used by Casper will
				loadPlugins: false, // use these settings		
			}
		}
	}, function(err) {
		if (err) {
			e = new Error('Failed to initialize SpookyJS');
			e.details = err;
			throw e;
		}

		spooky.start(url);
		spooky.then(function() {

			var links = [];
			links = this.evaluate(function() {
				var links = document.querySelectorAll('.s-access-detail-page');
				return Array.prototype.map.call(links, function(e) {
					return e.getAttribute('href');
				});
			});

			//open all products from page and get product data
			this.eachThen(links, function(link) {
				this.thenOpen(link.data, function() {
					var product = this.evaluate(function() {
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
					});
					if (product !== null) {
						this.emit('product', product);
					}
				});
			});
		});
		spooky.run();
	});


	spooky.on('error', function(e, stack) {
		console.error(e);

		if (stack) {
			console.log(stack);
		}
	});


	spooky.on('product', function(product) {
		collection.insert(product, function(err, docs) {
			console.log('Added one product');
		});
	});
	spooky.on('exit', function() {
		db.close();
		process.exit(0);
	});


});