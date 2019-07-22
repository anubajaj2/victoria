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

				var photoKey = req.body.id;
				var content = req.body.Content;
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


			app.post('/kaachiDownload', function(req, res) {

debugger;
				var custId = req.body.id;
				var name = req.body.name;
				var city = req.body.city;
				var Ggroup = "";
				//read customer name by id, group by group id, city by
				//read kacchi and print report with all coloring, formatting, totaling
				var responseData = [];
				var oSubCounter = {};
				var Customer = app.models.Customer;


				var async = require('async');
				;
				async.waterfall([
					function(callback) {
						Customer.findById(custId,{
							fields:{
								"CustomerCode": true,
								"Name":true,
								"Group":true,
								"City":true
							}
						}).then(function(customerRecord){
								callback(customerRecord);
						});
					},
					function(customerRecord, callback) {
						// arg1 now equals 'one' and arg2 now equals 'two'
						var City = app.models.City;
						City.findById(customerRecord.City,{
							fields:{
								"cityName": true
							}
						})
						.then(function(cityRecord, err) {
							callback(err,customerRecord, cityRecord);
						});

					},
					function(customerRecord, cityRecord, callback) {
						// arg1 now equals 'three'
						var Group = app.models.Group;
						Ggroup = Group;
						Group.findById(customerRecord.Group,{
							fields:{
								"groupName": true
							}
						})
							.then(function(groupRecord, err) {
							callback(err,customerRecord, cityRecord, groupRecord);
						});
					}
				], function(err,customerRecord, cityRecord, groupRecord) {
					// result now equals 'done'
						//set all values to local variables which we need inside next promise
						name = customerRecord.Name;
						city = cityRecord.cityName;
						Ggroup = groupRecord.groupName;
							try {
								//read the kacchi Records
								var Kacchi = app.models.Kacchi;
								Kacchi.find({where : {
									"Customer": custId
								}})
									.then(function(Records, err) {
											if (Records) {
												var excel = require('exceljs');
												var workbook = new excel.Workbook(); //creating workbook
												var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

												var heading = {heading:"Kachhi Report"};

												sheet.mergeCells('A1:E1');
												sheet.getCell('E1').value = 'Kacchi Report';
												sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
												sheet.getCell('A1').fill = {
  type: 'pattern',
  pattern:'solid',
  fgColor:{argb:'808080'}
};



sheet.mergeCells('A2:D2');
sheet.getCell('D2').value = 'Customer Name : ' + name + ' - ' + city + ' - ' + Ggroup;
sheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };





var currentdate = new Date();
var datetime = "Report Date: " + currentdate.getDate() + "."
                + (currentdate.getMonth()+1)  + "."
                + currentdate.getFullYear() + " / "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
sheet.getCell('E2').value = datetime;
// sheet.getCell('E2').font = {
//   bold: true
// };
// sheet.getCell('A2').font = {
//   bold: true
// };
sheet.getRow(2).font === { bold: true };


var header = Object.keys(Records[0].__data);
header.splice(1,1);
header.splice(5,5);

												sheet.addRow().values = header;


												sheet.getCell('A3').fill = {
												type: 'pattern',
												pattern:'solid',
												fgColor:{argb:'A9A9A9'}
												};
												sheet.getCell('B3').fill = {
												type: 'pattern',
												pattern:'solid',
												fgColor:{argb:'A9A9A9'}
												};
												sheet.getCell('C3').fill = {
												type: 'pattern',
												pattern:'solid',
												fgColor:{argb:'A9A9A9'}
												};
												sheet.getCell('D3').fill = {
												type: 'pattern',
												pattern:'solid',
												fgColor:{argb:'A9A9A9'}
												};
												sheet.getCell('E3').fill = {
												type: 'pattern',
												pattern:'solid',
												fgColor:{argb:'A9A9A9'}
												};


												for (var i = 0; i < Records["length"]; i++) {
					var items = Object.values(Records[i].__data);
					items.splice(1,1);
					items.splice(5,5);
													sheet.addRow().values = items;

												}

var totText = Records["length"] + 4;
var totCol = totText - 1;
												sheet.getCell('A' + totText).value = "Total";
												sheet.getCell('B' + totText).value = Records["length"];
												sheet.getCell('C' + totText).value = { formula: '=CONCATENATE(SUM(C4:C'+totCol+')," gm")' };
												sheet.getCell('D' + totText).value = { formula: '=CONCATENATE(ROUND(AVERAGE(D4:D'+totCol+'),0)," T")' };
												sheet.getCell('E' + totText).value = { formula: '=CONCATENATE(SUM(E4:E'+totCol+')," gm")' };


												sheet.getCell('A' + totText).fill = {
													type: 'pattern',
													pattern:'solid',
													fgColor:{argb:'A9A9A9'}
												};
												sheet.getCell('B' + totText).fill = {
													type: 'pattern',
													pattern:'solid',
													fgColor:{argb:'A9A9A9'}
												};
												sheet.getCell('C' + totText).fill = {
													type: 'pattern',
													pattern:'solid',
													fgColor:{argb:'A9A9A9'}
												};
												sheet.getCell('D' + totText).fill = {
													type: 'pattern',
													pattern:'solid',
													fgColor:{argb:'A9A9A9'}
												};
												sheet.getCell('E' + totText).fill = {
												  type: 'pattern',
												  pattern:'solid',
												  fgColor:{argb:'A9A9A9'}
												};

for(var j=1; j<=totText; j++){
												sheet.getCell('A'+(j)).border = {
top: {style:'thin'},
left: {style:'thin'},
bottom: {style:'thin'},
right: {style:'thin'}
};
sheet.getCell('B'+(j)).border = {
top: {style:'thin'},
left: {style:'thin'},
bottom: {style:'thin'},
right: {style:'thin'}
};
sheet.getCell('C'+(j)).border = {
top: {style:'thin'},
left: {style:'thin'},
bottom: {style:'thin'},
right: {style:'thin'}
};
sheet.getCell('D'+(j)).border = {
top: {style:'thin'},
left: {style:'thin'},
bottom: {style:'thin'},
right: {style:'thin'}
};
sheet.getCell('E'+(j)).border = {
top: {style:'thin'},
left: {style:'thin'},
bottom: {style:'thin'},
right: {style:'thin'}
};


}




												var tempfile = require('tempfile');
												var tempFilePath = tempfile('.xlsx');
												console.log("tempFilePath : ", tempFilePath);
												workbook.xlsx.writeFile(tempFilePath).then(function() {
													res.sendFile(tempFilePath, function(err) {
														if (err) {
															console.log('---------- error downloading file: ', err);
														}
													});
													console.log('file is written @ ' + tempFilePath);
												});

											}
										}

									).catch(function(oError) {
											that.getView().setBusy(false);
											var oPopover = that.getErrorMessage(oError);
								});
							} catch (e) {

							} finally {

							}
						}
						//res.send(responseData);

			 );
		 })

			app.get('/anubhavDemo', function(req, res) {

				var Customer = app.models.Customer;
				Customer.find({})
					.then(function(Records, err) {
							if (Records) {

								var excel = require('exceljs');
								var workbook = new excel.Workbook(); //creating workbook
								var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

								sheet.addRow().values = Object.keys(Records[0].__data);

								for (var i = 0; i < Records["length"]; i++) {
									sheet.addRow().values = Object.values(Records[i].__data);
								}

								var tempfile = require('tempfile');
								var tempFilePath = tempfile('.xlsx');
								console.log("tempFilePath : ", tempFilePath);
								workbook.xlsx.writeFile(tempFilePath).then(function() {
									res.sendFile(tempFilePath, function(err) {
										if (err) {
											console.log('---------- error downloading file: ', err);
										}
									});
									console.log('file is written @ ' + tempFilePath);
								});

							}
						}

					);
			});

		app.post('/deleteRecords', function(req, res) {
			;
				var customerId = req.body.customerId;
				var entityName = req.body.entityName;
				switch (entityName) {
					case "Entry":
						var Entry = app.models.Entry;
						Entry.destroyAll({
								"Customer": customerId
						}).then(function(records){
							res.send({
								"msg": "All the records has been deleted successfully for the customer"
							});
						}).catch(function(err,ns){
							;
						});
						break;
					case "Kacchi":
						var Kacchi = app.models.Kacchi;
						break;
					case "RetailOrders":

						break;
					case "WholesaleOrders":

 						break;
					default:

				}



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
