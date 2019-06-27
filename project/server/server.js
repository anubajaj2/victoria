var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var express = require('express');
var fs = require('fs');
var app = express();
app = module.exports = loopback();

// parse application/json
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
// 	extended: true
// }));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	secret: 'anuragApp'
}));
app.use(fileUpload());
app.start = function() {
	// start the web server
	return app.listen(function() {
		app.emit('started');
		var baseUrl = app.get('url').replace(/\/$/, '');
		console.log('Web server listening at: %s', baseUrl);
		if (app.get('loopback-component-explorer')) {
			var explorerPath = app.get('loopback-component-explorer').mountPath;
			console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
		}

		app.post('/updatePhotoFlag', function(req, res) {
			debugger;
			var customerOrderKey = req.body.id;
			var isPhoto = req.body.PhotoValue;
			var oCustomerOrder = app.models.CustomerOrder;
			var updateObj = {
				Picture: isPhoto
			};
			oCustomerOrder.findById(customerOrderKey).then(function(instance) {
				 instance.updateAttributes(updateObj);
				 return res.send("done");
			});
		});

		app.post('/updatePhoto', function(req,res){
				debugger;
				var photoKey = req.body.id;
				var content = req.body.content;
				var name = req.body.name;
				var type = req.body.type;
				var oPhoto = app.models.Photo;
				var updateObj = {
					Content: content,
					Filename: name,
					Filetype: type
				};
				oPhoto.findById(photoKey).then(function(instance) {
					 instance.updateAttributes(updateObj);
					 return res.send("done");
				});
			});

		app.post('/getTotalEntryCustomer', function(req, res) {

			var customerId = req.body.Customer;
			var Entry = app.models.Entry;
			Entry.find({
				where : {
					"Customer": customerId
				}
			}).then(function(records){
				var tSilver = 0, tGold = 0, tCash = 0;
				for (var i = 0; i < records.length; i++) {
					tSilver = tSilver + records[i].Silver;
					tGold = tGold + records[i].Gold;
					tCash = tCash + records[i].Cash;
				}

				res.send({
					"SilverTotal": tSilver,
					"GoldTotal": tGold,
					"CashTotal": tCash
				});
			});

		});



	});
};


// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
	if (err) throw err;

	// start the server if `$ node server.js`
	if (require.main === module)
		app.start();
});
