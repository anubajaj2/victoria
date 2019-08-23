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
		app.post('/updateRetailOrderHdr', function(req,res){

					var OrderHeader = app.models.OrderHeader;
					var RecordId = req.body.id;
					var Customer = req.body.Customer;
					var GoldBhav22 = req.body.GoldBhav22;
					var GoldBhav20 = req.body.GoldBhav20;
					var GoldBhav = app.models.GoldBhav;
					var SilverBhav = app.models.SilverBhav;

					var updateObj = {
						Customer: Customer,
						GoldBhav22: GoldBhav22,
						GoldBhav20: GoldBhav20,
						GoldBhav: GoldBhav,
						SilverBhav: SilverBhav,
						ChangedOn: new Date()
					};
					OrderHeader.findById(RecordId).then(function(instance) {
						 instance.updateAttributes(updateObj);
						 return res.send("done");
					});
				});
		app.post('/kaachiDownload', function(req, res) {
			var reportType = req.body.type;
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
					}).then(function(customerRecord, err){
							callback(err, customerRecord);
					});
				},
			function(customerRecord, callback) {
				// arg1 now equals 'one' and arg2 now equals 'two'
				var City = app.models.City;
				City.findById(customerRecord.City,{
					fields:{
						"cityName": true
					}
				}).then(function(cityRecord, err) {
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
				}).then(function(groupRecord, err) {
				callback(err,customerRecord, cityRecord, groupRecord);
			});
		}
		], function(err,customerRecord, cityRecord, groupRecord) {
		// result now equals 'done'
			//set all values to local variables which we need inside next promise
			name = customerRecord.Name;
			//city = cityRecord.cityName;
			city = req.body.city;
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


							//Heading for excel
							var heading = {heading:"Kachhi Report"};
							sheet.mergeCells('A1:E1');
							sheet.getCell('E1').value = 'Kacchi Report';
							sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
							sheet.getCell('A1').fill = {
							  type: 'pattern',
							  pattern:'solid',
							  fgColor:{argb:'808080'}
							};

			//Merging second Row
			sheet.mergeCells('A2:D2');
			sheet.getCell('D2').value =  name + ' - ' + city + ' - ' + Ggroup;
			sheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };


			//Code for getting current datetime
			var currentdate = new Date();
			var datetime =  currentdate.getDate() + "."
			                + (currentdate.getMonth()+1)  + "."
			                + currentdate.getFullYear() + " / "
			                + currentdate.getHours() + ":"
			                + currentdate.getMinutes() + ":"
			                + currentdate.getSeconds();
			sheet.getCell('E2').value = datetime;
			sheet.getRow(2).font === { bold: true };

			//Coding to remove unwanted header
			var header = Object.keys(Records[0].__data);
			header.splice(1,1);
			header.splice(5,5);

			sheet.addRow().values = header;

			//Coding for cell color and bold character
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


			//Coding to remove unwanted items or Rows
			for (var i = 0; i < Records["length"]; i++) {
			var items = Object.values(Records[i].__data);
			items.splice(1,1);
			items.splice(5,5);
				sheet.addRow().values = items;
			}


			//Coding for formula and concatenation in the last line
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


			//Coding for rows and column border
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

//Coding to download in a folder
				var tempFilePath = 'C:\\dex\\' + reportType + '_' + custId + '_' + currentdate.getDate() + (currentdate.getMonth()+1)
				                    + currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes()
														+ currentdate.getSeconds() + '.xlsx';
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

app.post('/stockDownload', function(req, res){
	debugger;
var reportType = req.body.type;
var responseData = [];
var oSubCounter = {};

var StockMaint = app.models.stockMaint;
var Product = app.models.Product;


var async = require('async');
;
async.waterfall([
	function(callback) {
		StockMaint.find({
			fields:{
				"Product": true,
				"Quantity": true,
				"Weight": true
			}
		}).then(function(sRecord, err){
				callback(err, sRecord);
		});
	},
	function(sRecord, callback) {
		var allProd = [];
		for (var i = 0; i < sRecord.length; i++) {
			allProd.push(sRecord[i].Product);
		}

		//remove adjucent duplicates
		allProd = allProd.filter(function(item, pos, self) {
				return self.indexOf(item) == pos;
		});

		Product.find({
			where: {
				ProductCode: {inq : allProd}
				//"ProductCode": sRecord.Product
			},
			fields:{
				"ProductName": true,
				"Type": true,
				"ProductCode": true
			}
		}).then(function(pRecord, err){
				callback(err, sRecord, pRecord);
		});
	}
], function(err, sRecord, pRecord) {
	try {
		debugger;
var products=[];
var count = 0;

for (var i = 0; i < sRecord.length; i++) {
var product = {};
product.ProductCode = sRecord[i].Product;
product.Quantity = sRecord[i].Quantity;
product.Weight = sRecord[i].Weight;

for (var j = 0; j < pRecord.length; j++) {
	if (sRecord[i].Product == pRecord[j].ProductCode) {
		product.ProductName = pRecord[j].ProductName;
		product.Type = pRecord[j].Type;
		break;
	}
}

products.push(product);
}


var excel = require('exceljs');
var workbook = new excel.Workbook(); //creating workbook
var sheet = workbook.addWorksheet('MySheet'); //creating worksheet


//Heading for excel
var heading = {heading:"Stock Report"};
sheet.mergeCells('A1:D1');
sheet.getCell('D1').value = 'Stock Report';
sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
sheet.getCell('A1').fill = {
	type: 'pattern',
	pattern:'solid',
	fgColor:{argb:'808080'}
};

var currentdate = new Date();
var datetime =  currentdate.getDate() + "."
								+ (currentdate.getMonth()+1)  + "."
								+ currentdate.getFullYear() + " / "
								+ currentdate.getHours() + ":"
								+ currentdate.getMinutes() + ":"
								+ currentdate.getSeconds();

debugger;
var header = ["Material Name","Material Type","Tot Quantity","Tot Weight"];
sheet.addRow().values = header;

//Coding for cell color and bold character
sheet.getCell('A2').fill = {
type: 'pattern',
pattern:'solid',
fgColor:{argb:'A9A9A9'}
};
sheet.getCell('B2').fill = {
type: 'pattern',
pattern:'solid',
fgColor:{argb:'A9A9A9'}
};
sheet.getCell('C2').fill = {
type: 'pattern',
pattern:'solid',
fgColor:{argb:'A9A9A9'}
};
sheet.getCell('D2').fill = {
type: 'pattern',
pattern:'solid',
fgColor:{argb:'A9A9A9'}
};

//Coding to remove unwanted items or Rows
for (var i = 0; i < products["length"]; i++) {
var items = products[i];
var item = [items["ProductName"],items["Type"],items["Quantity"],items["Weight"]];
sheet.addRow().values = item;
}


var totText = products["length"] + 2;
var totCol = totText - 1;

//Coding for rows and column border
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
}

//Coding to download in a folder
	var tempFilePath = 'C:\\dex\\' + reportType + '_' + currentdate.getDate() + (currentdate.getMonth()+1)
											+ currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes()
											+ currentdate.getSeconds() + '.xlsx';
	console.log("tempFilePath : ", tempFilePath);
	workbook.xlsx.writeFile(tempFilePath).then(function() {
		res.sendFile(tempFilePath, function(err) {
			if (err) {
				console.log('---------- error downloading file: ', err);
			}
		});
		console.log('file is written @ ' + tempFilePath);
	});


} catch (e) {

} finally {

}
}
//res.send(responseData);

);
})

	app.post('/bookingDownload', function(req, res){
	var reportType = req.body.type;
	var custId = req.body.id;
	var custName = req.body.name;

	var responseData = [];
	var oSubCounter = {};
	var B_Detail = app.models.BookingDetail;
	var B_Dlv_Detail = app.models.BookingDlvDetail;
	var Customer = app.models.Customer;


	var async = require('async');
	;
	async.waterfall([
		function(callback) {
			Customer.findById(custId, {
				fields:{
					"Name": true
				}
			}).then(function(cRecord, err){
					callback(err, cRecord);
			});
		},
	function(cRecord, callback) {
		B_Detail.find({
			where: {
				"Customer": custId
			},
			fields:{
				"BookingDate": true,
				"Quantity":true,
				"Bhav":true,
				"Advance":true
			}
		}).then(function(b_Record, err) {
			callback(err,cRecord, b_Record);
		});
	},
	function(cRecord, b_Record, callback) {
		B_Dlv_Detail.find({
			where: {
				"Customer": custId
			},
			fields:{
				"BookingDate": true,
				"Quantity":true,
				"Bhav":true,
				"Advance":true
			}
		}).then(function(b_d_Record, err) {
			callback(err, cRecord, b_Record, b_d_Record);
		});
	}
], function(err, cRecord, b_Record, b_d_Record) {

		try {
			debugger;
					var excel = require('exceljs');
					var workbook = new excel.Workbook(); //creating workbook
					var sheet = workbook.addWorksheet('MySheet'); //creating worksheet


					//Heading for excel
					var heading = {heading:"Booking Report"};
					sheet.mergeCells('A1:H1');
					sheet.getCell('H1').value = 'Booking Report';
					sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
					sheet.getCell('A1').fill = {
						type: 'pattern',
						pattern:'solid',
						fgColor:{argb:'808080'}
					};

	//Merging second Row
	sheet.mergeCells('A2:H2');
	sheet.getCell('H2').value =  'Customer Name : ' + cRecord.Name;
	sheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

	var nameCol = sheet.getColumn('E');
	nameCol.width = 1;


	//Code for getting current datetime
	var currentdate = new Date();
	var datetime =  currentdate.getDate() + "."
									+ (currentdate.getMonth()+1)  + "."
									+ currentdate.getFullYear() + " / "
									+ currentdate.getHours() + ":"
									+ currentdate.getMinutes() + ":"
									+ currentdate.getSeconds();

	var header = ["Date","Quantity","Bhav","Advance"," ","Date","Quantity","Bhav"];
	sheet.addRow().values = header;

	//Coding for cell color and bold character
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
	fgColor:{argb:'000000'}
	};
	sheet.getCell('F3').fill = {
	type: 'pattern',
	pattern:'solid',
	fgColor:{argb:'A9A9A9'}
	};
	sheet.getCell('G3').fill = {
	type: 'pattern',
	pattern:'solid',
	fgColor:{argb:'A9A9A9'}
	};
	sheet.getCell('H3').fill = {
	type: 'pattern',
	pattern:'solid',
	fgColor:{argb:'A9A9A9'}
	};


	var totCash = 0;
	var totalB = 0;
	var totalC = 0;
	var totalD = 0;
	var totalG = 0;
	var totalH = 0;
	var totalLength;
	var BLength = b_Record["length"];
	var BDLength = b_d_Record["length"];

	//Coding to remove unwanted items or Rows
	for (var i = 0, j = 0; i < b_Record["length"], j < b_d_Record["length"]; i++, j++) {
	if (b_Record[i] !== undefined) {
		var items = b_Record[i];
	}else {
		var items = [];
	}
	if (b_d_Record[j] !== undefined) {
		var items_d = b_d_Record[j];
	}else {
		var items_d = [];
	}
	if (items["BookingDate"] !== undefined) {
		var iBDate = new Date(items["BookingDate"]);
		var iBDate_B =  iBDate.getDate() + "."
										+ (iBDate.getMonth()+1)  + "."
										+ iBDate.getFullYear();
	}else {
		var iBDate_B = " ";
	}
	if (items_d["BookingDate"] !== undefined) {
		var iBDate_D = new Date(items_d["BookingDate"]);
		var iBDate_B_D =  iBDate_D.getDate() + "."
										+ (iBDate_D.getMonth()+1)  + "."
										+ iBDate_D.getFullYear();
	}else {
		var iBDate_B_D = " ";
	}

	var item = [iBDate_B,items["Quantity"],items["Bhav"],items["Advance"]," ",
							iBDate_B_D,items_d["Quantity"],items_d["Bhav"]];
if (items["Quantity"] !== undefined) {
	totalB = totalB + items["Quantity"];
}
if (items["Bhav"] !== undefined) {
	totalC = totalC + items["Bhav"];
}
if (items["Advance"] !== undefined) {
	totalD = totalD + items["Advance"];
}
if (items_d["Quantity"] !== undefined) {
	totalG = totalG + items_d["Quantity"];
}
if (items_d["Bhav"] !== undefined) {
	totalH = totalH + items_d["Bhav"];
}

	sheet.addRow().values = JSON.parse(JSON.stringify(item));
	items = [];
	items_d = [];
	item = [];
	totalLength = i;
}

var totText = totalLength + 5;
var totCol = totText - 1;
sheet.getCell('A' + totText).value = "TOTAL";
sheet.getCell('B' + totText).value = totalB + 'gm';
sheet.getCell('C' + totText).value = totalC / BLength;
sheet.getCell('D' + totText).value = totalD ;
sheet.getCell('G' + totText).value = totalG + 'gm';
sheet.getCell('H' + totText).value = totalH / BDLength;
sheet.getCell('F' + totText).value = "TOTAL";

sheet.getCell('A' + totText).fill = {
	type: 'pattern',
	pattern:'solid',
	fgColor:{argb:'00FFFF'},
	bgColor:{argb:'00FFFF'}
};
sheet.getCell('A' + totText).font = {
	color:{argb:'0000FF'},
	bold:true
};

sheet.getCell('F' + totText).fill = {
	type: 'pattern',
	pattern:'solid',
	fgColor:{argb:'00FFFF'},
	bgColor:{argb:'00FFFF'}
};
sheet.getCell('F' + totText).font = {
	color:{argb:'0000FF'},
	bold:true
};

for(var j=1; j<=totText; j++){
////
if(sheet.getCell('B' + (j)).value == 0){
	sheet.getCell('B' + (j)).fill = {
		type: 'pattern',
		pattern:'solid',
		bgColor:{argb:'00FFFF'},
		fgColor:{argb:'00FFFF'}
	};

}
else {
	sheet.getCell('B' + (j)).font = {
		color:{argb:'000000'},
		bold:true
};
}

if(sheet.getCell('C' + (j)).value == 0){
	sheet.getCell('C' + (j)).fill = {
		type: 'pattern',
		pattern:'solid',
		bgColor:{argb:'00FFFF'},
		fgColor:{argb:'00FFFF'}
	};

}else {
	sheet.getCell('C' + (j)).font = {
		color:{argb:'000000'},
		bold:true
};
}

if(sheet.getCell('G' + (j)).value == 0){
	sheet.getCell('G' + (j)).fill = {
		type: 'pattern',
		pattern:'solid',
		bgColor:{argb:'00FFFF'},
		fgColor:{argb:'00FFFF'}
	};

}else {
	sheet.getCell('G' + (j)).font = {
		color:{argb:'000000'},
		bold:true
};
}

if(sheet.getCell('D' + (j)).value == 0){
	sheet.getCell('D' + (j)).fill = {
		type: 'pattern',
		pattern:'solid',
		bgColor:{argb:'00FFFF'},
		fgColor:{argb:'00FFFF'}
	};

}else {
	sheet.getCell('D' + (j)).font = {
		color:{argb:'000000'},
		bold:true
};
}

if(sheet.getCell('H' + (j)).value == 0){
	sheet.getCell('H' + (j)).fill = {
		type: 'pattern',
		pattern:'solid',
		bgColor:{argb:'00FFFF'},
		fgColor:{argb:'00FFFF'}
	};

}else {
	sheet.getCell('H' + (j)).font = {
		color:{argb:'000000'},
		bold:true
};
}


if (j>2) {
	sheet.getCell('E' + (j)).fill = {
		type: 'pattern',
		pattern:'solid',
		bgColor:{argb:'000000'},
		fgColor:{argb:'000000'}
	};
}



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
sheet.getCell('F'+(j)).border = {
top: {style:'thin'},
left: {style:'thin'},
bottom: {style:'thin'},
right: {style:'thin'}
};
sheet.getCell('G'+(j)).border = {
top: {style:'thin'},
left: {style:'thin'},
bottom: {style:'thin'},
right: {style:'thin'}
};
sheet.getCell('H'+(j)).border = {
top: {style:'thin'},
left: {style:'thin'},
bottom: {style:'thin'},
right: {style:'thin'}
};

}

sheet.getCell('B' + totText).font = {
	color:{argb:'800000'}
};
sheet.getCell('D' + totText).font = {
	color:{argb:'800000'}
};
sheet.getCell('G' + totText).font = {
	color:{argb:'800000'}
};

sheet.getCell('B'  + totText).alignment = { vertical: 'bottom', horizontal: 'right' };
sheet.getCell('G'  + totText).alignment = { vertical: 'bottom', horizontal: 'right' };


//Coding to download in a folder
		var tempFilePath = 'C:\\dex\\' + reportType + '_' + custId + '_' + currentdate.getDate() + (currentdate.getMonth()+1)
												+ currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes()
												+ currentdate.getSeconds() + '.xlsx';
		console.log("tempFilePath : ", tempFilePath);
		workbook.xlsx.writeFile(tempFilePath).then(function() {
			res.sendFile(tempFilePath, function(err) {
				if (err) {
					console.log('---------- error downloading file: ', err);
				}
			});
			console.log('file is written @ ' + tempFilePath);
		})
.catch(function(oError) {
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

///// Coding for Entry Download/////
		app.get('/pOrderDownload', function(req, res) {
		//--- Calculate total per batch, prepare json and return
		var responseData = [];
		var oSubCounter = {};
		var CustomerOrder = app.models.CustomerOrder;
		var Customer = app.models.Customer;
		var City = app.models.City;
		var Product = app.models.Product;

		var async = require('async');
		debugger;
		async.waterfall([
			function(callback) {
				//1. read all the pending orders
				CustomerOrder.find().then(function(pendingOrderRecords){
						callback(null, pendingOrderRecords);
				});
			},
			function(pendingOrderRecords, callback) {
				//2. Each pending order has customer and karigar which is the ID
				//   Take these ids in an arry and find all the customer names and karigar names
				var allCust = [];
				for (var i = 0; i < pendingOrderRecords.length; i++) {
					allCust.push(pendingOrderRecords[i].Customer);
				}
				for (var i = 0; i < pendingOrderRecords.length; i++) {
					allCust.push(pendingOrderRecords[i].Karigar);
				}
				//remove adjucent duplicates
				allCust = allCust.filter(function(item, pos, self) {
				    return self.indexOf(item) == pos;
				});

				Customer.find({
					where: {
						//3. this is how in loop back we read all items which are inside customer
						id: {inq : allCust}
					},
					fields:{
						"id": true,
						"Name": true,
						"City": true
					}
				})
				.then(function(allCustomers, err) {
					callback(null, pendingOrderRecords, allCustomers);
				});

			},
			function(pendingOrderRecords, allCustomers, callback) {
				// 4. now get the cities for all those karigars and customers
				var allCities = [];
				for (var i = 0; i < allCustomers.length; i++) {
					allCities.push(allCustomers[i].City);
				}
				//remove adjucent duplicates
				allCities = allCities.filter(function(item, pos, self) {
				    return self.indexOf(item) == pos;
				});

				City.find({
					where: {
						id: {inq : allCities}
					},
					fields:{
						"id": true,
						"cityName": true
					}
				})
					.then(function(CityRecords, err) {
					callback(null, pendingOrderRecords, allCustomers, CityRecords);
				});
			},
			function(pendingOrderRecords, allCustomers, CityRecords, callback) {
				// 4. now get the cities for all those karigars and customers
				var allProds = [];
				for (var i = 0; i < pendingOrderRecords.length; i++) {
					allProds.push(pendingOrderRecords[i].Material);
				}
				//remove adjucent duplicates
				allProds = allProds.filter(function(item, pos, self) {
				    return self.indexOf(item) == pos;
				});

				Product.find({
					where: {
						id: {inq : allProds}
					},
					fields:{
						"id": true,
						"ProductName": true
					}
				})
					.then(function(ProductRecords, err) {
					callback(null, pendingOrderRecords, allCustomers, CityRecords, ProductRecords);
				});
			}
		], function(err, pendingOrderRecords, allCustomers, CityRecords, ProductRecords) {
			// result now equals 'done'
			debugger;
			try {
						//TODO: Now we have all the data of orders, their customers,
						//cities, and products with ids
						//prepare final collection and Add the excel code there



												var pOrders = [];

												for(var p=0; p<pendingOrderRecords.length; p++){
													var pOrder = {};

													//let lPOrders = JSON.parse(JSON.stringify(pendingOrderRecords[p].__data));
													var lPOrders = pendingOrderRecords[p].__data;
													debugger;

													var cov_date = new Date(lPOrders.Date);
													pOrder.Date =  cov_date.getDate() + "."
																					+ (cov_date.getMonth()+1)  + "."
																					+ cov_date.getFullYear();

													var del_date = new Date(lPOrders.DelDate);
													pOrder.DelDate =  del_date.getDate() + "."
																					+ (del_date.getMonth()+1)  + "."
																					+ del_date.getFullYear();


													// pOrder.Date = lPOrders.Date;
													// pOrder.DelDate = lPOrders.DelDate;
													pOrder.Qty = lPOrders.Qty;
													pOrder.Weight = lPOrders.Weight;
													pOrder.Making = lPOrders.Making;
													pOrder.Remarks = lPOrders.Remarks;
													//pOrder.Material = lPOrders.Material;
													for(var m=0; m<ProductRecords.length; m++){
														debugger;
														let lMaterial = JSON.parse(JSON.stringify(ProductRecords[m].__data));
														if (lPOrders.Material == lMaterial.id) {
															pOrder.Material = lMaterial.ProductName;
														}
													}
													for(var k=0; k<allCustomers.length; k++){
														debugger;
														let lKarigar = JSON.parse(JSON.stringify(allCustomers[k].__data));
														if (lPOrders.Karigar == lKarigar.id) {
															pOrder.Karigar = lKarigar.Name;
														}
														if (lPOrders.Karigar == "null") {
															pOrder.Karigar = lPOrders.Karigar;
														}
													}
													for (var c = 0; c < allCustomers.length; c++) {
														debugger;
														let lCustomer = JSON.parse(JSON.stringify(allCustomers[c].__data));
														if (lPOrders.Customer == lCustomer.id) {
															pOrder.Customer = lCustomer.Name;
														}
													}

													pOrders.push(Object.assign({},pOrder));


												}
												debugger;
												var reportType = "Pending_Order_Summary";
												//var custId = req.body.id;
												//var name = req.body.name;

												var excel = require('exceljs');
												var workbook = new excel.Workbook(); //creating workbook
												var sheet = workbook.addWorksheet('MySheet'); //creating worksheet


												//Heading for excel
												var heading = {heading:"Pending Order Report"};
												sheet.mergeCells('A1:I1');
												sheet.getCell('I1').value = 'Pending Order Report';
												sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
												sheet.getCell('A1').fill = {
													type: 'pattern',
													pattern:'solid',
													fgColor:{argb:'808080'}
												};


												var currentdate = new Date();
												var datetime =  currentdate.getDate() + "."
																				+ (currentdate.getMonth()+1)  + "."
																				+ currentdate.getFullYear() + " / "
																				+ currentdate.getHours() + ":"
																				+ currentdate.getMinutes() + ":"
																				+ currentdate.getSeconds();

								debugger;
								var header = ["Date","Delivery Date","Customer Name","Item Name","Qty","Weight","Making","Remarks","Karigar"];
								sheet.addRow().values = header;

								//Coding for cell color and bold character
								sheet.getCell('A2').fill = {
								type: 'pattern',
								pattern:'solid',
								fgColor:{argb:'FFFF99'}
								};
								sheet.getCell('B2').fill = {
								type: 'pattern',
								pattern:'solid',
								fgColor:{argb:'FFFF99'}
								};
								sheet.getCell('C2').fill = {
								type: 'pattern',
								pattern:'solid',
								fgColor:{argb:'FFFF99'}
								};
								sheet.getCell('D2').fill = {
								type: 'pattern',
								pattern:'solid',
								fgColor:{argb:'FFFF99'}
								};
								sheet.getCell('E2').fill = {
								type: 'pattern',
								pattern:'solid',
								fgColor:{argb:'FFFF99'}
								};
								sheet.getCell('F2').fill = {
								type: 'pattern',
								pattern:'solid',
								fgColor:{argb:'FFFF99'}
								};
								sheet.getCell('G2').fill = {
								type: 'pattern',
								pattern:'solid',
								fgColor:{argb:'FFFF99'}
								};
								sheet.getCell('H2').fill = {
								type: 'pattern',
								pattern:'solid',
								fgColor:{argb:'FFFF99'}
								};
								sheet.getCell('I2').fill = {
								type: 'pattern',
								pattern:'solid',
								fgColor:{argb:'FFFF99'}
								};

								var totCash = 0;
								var totalE = 0;
								var totalF = 0;

								//Coding to remove unwanted items or Rows
								for (var i = 0; i < pOrders["length"]; i++) {
								var items = pOrders[i];
								var item = [items["Date"],items["DelDate"],items["Customer"],items["Material"],items["Qty"],items["Weight"],items["Making"],items["Remarks"],items["Karigar"]];
								totalE = totalE + items["Qty"];
								totalF = totalF + items["Weight"];
								sheet.addRow().values = item;
								}


								//Coding for formula and concatenation in the last line
								var totText = pOrders["length"] + 4;
								var totCol = totText - 1;
								sheet.mergeCells('A' + totText + ': D' + totText);
								sheet.getCell('A' + totText).alignment = { vertical: 'middle', horizontal: 'center' };
								sheet.getCell('A' + totText).value = "TOTAL";

								sheet.getCell('E' + totText).value = totalE ;
								sheet.getCell('F' + totText).value = totalF ;


								sheet.getCell('A' + totText).fill = {
									type: 'pattern',
									pattern:'solid',
									fgColor:{argb:'339966'},
									bgColor:{argb:'339966'}
								};
								sheet.getCell('A' + totText).font = {
									color:{argb:'000000'}
								};

								sheet.getCell('E' + totText).font = {
									color:{argb:'000000'},
									bold: true
								};

								sheet.getCell('F' + totText).font = {
									color:{argb:'000000'},
									bold: true
								};


								//Coding for rows and column border
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
								sheet.getCell('F'+(j)).border = {
								top: {style:'thin'},
								left: {style:'thin'},
								bottom: {style:'thin'},
								right: {style:'thin'}
								};
								sheet.getCell('G'+(j)).border = {
								top: {style:'thin'},
								left: {style:'thin'},
								bottom: {style:'thin'},
								right: {style:'thin'}
								};
								sheet.getCell('H'+(j)).border = {
								top: {style:'thin'},
								left: {style:'thin'},
								bottom: {style:'thin'},
								right: {style:'thin'}
								};
								sheet.getCell('I'+(j)).border = {
								top: {style:'thin'},
								left: {style:'thin'},
								bottom: {style:'thin'},
								right: {style:'thin'}
								};
								}

								sheet.getCell('F' + totText).value = totalF + 'gm';

								sheet.getCell('E'  + totText).alignment = { vertical: 'bottom', horizontal: 'right' };
								sheet.getCell('F'  + totText).alignment = { vertical: 'bottom', horizontal: 'right' };

								debugger;
								//Coding to download in a folder
									var tempFilePath = 'C:\\dex\\' + reportType + '_' + currentdate.getDate() + (currentdate.getMonth()+1)
																			+ currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes()
																			+ currentdate.getSeconds() + '.xlsx';
									console.log("tempFilePath : ", tempFilePath);
									workbook.xlsx.writeFile(tempFilePath).then(function() {
										res.sendFile(tempFilePath, function(err) {
											if (err) {
												console.log('---------- error downloading file: ', err);
											}
										});
										console.log('file is written @ ' + tempFilePath);
									});

											} catch (e) {

											} finally {

											}
										}
								);
						 })
		app.post('/entryDownload', function(req, res) {
var reportType = req.body.type;
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
		}).then(function(customerRecord, err){
				callback(err, customerRecord);
		});
	}
], function(err,customerRecord) {
// result now equals 'done'
//set all values to local variables which we need inside next promise
name = customerRecord.Name;
	try {
//read the kacchi Records
var Entry = app.models.Entry;
Entry.find({where : {
	"Customer": custId
}})
	.then(function(Records, err) {
			if (Records) {
				var excel = require('exceljs');
				var workbook = new excel.Workbook(); //creating workbook
				var sheet = workbook.addWorksheet('MySheet'); //creating worksheet


				//Heading for excel
				var heading = {heading:"Fast Report"};
				sheet.mergeCells('A1:E1');
				sheet.getCell('E1').value = 'Fast Report';
				sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
				sheet.getCell('A1').fill = {
					type: 'pattern',
					pattern:'solid',
					fgColor:{argb:'808080'}
				};

//Merging second Row
sheet.mergeCells('A2:E2');

//Code for getting current datetime
var currentdate = new Date();
var datetime =  currentdate.getDate() + "."
								+ (currentdate.getMonth()+1)  + "."
								+ currentdate.getFullYear() + " / "
								+ currentdate.getHours() + ":"
								+ currentdate.getMinutes() + ":"
								+ currentdate.getSeconds();
sheet.getCell('A2').value = 'Customer Name : ' + name + '\r' + '\n' + datetime ;
sheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
sheet.getRow(2).font === { bold: true };


var header = ["Date","Silver","Cash","Gold","Remarks"];

sheet.addRow().values = header;

//Coding for cell color and bold character
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

var totCash = 0;
var totalB = 0;
var totalC = 0;
var totalD = 0;

//Coding to remove unwanted items or Rows
for (var i = 0; i < Records["length"]; i++) {
var items = Records[i].__data;
var item = [items["Date"],items["Silver"],items["Cash"],items["Gold"],items["Remarks"]];
totalB = totalB + items["Silver"];
totalC = totalC + items["Cash"];
totalD = totalD + items["Gold"];
sheet.addRow().values = item;
}


//Coding for formula and concatenation in the last line
var totText = Records["length"] + 5;
var totCol = totText - 1;
sheet.getCell('A' + totText).value = "TOTAL";

sheet.getCell('B' + totText).value = totalB ;
sheet.getCell('C' + totText).value = totalC ;
sheet.getCell('D' + totText).value = totalD ;


sheet.getCell('A' + totText).fill = {
	type: 'pattern',
	pattern:'solid',
	fgColor:{argb:'00FFFF'},
	bgColor:{argb:'00FFFF'}
};
sheet.getCell('A' + totText).font = {
	color:{argb:'0000FF'},
	bold:true
};



//Coding for rows and column border
for(var j=1; j<=totText; j++){
////
if(sheet.getCell('B' + (j)).value == ''){
	sheet.getCell('B' + (j)).fill = {
		type: 'pattern',
		pattern:'solid',
		bgColor:{argb:'00FFFF'},
		fgColor:{argb:'00FFFF'}
	};

}else if (sheet.getCell('B' + (j)).value < 0) {
	sheet.getCell('B' + (j)).font = {
		color:{argb:'FF0000'},
		bold:true
};
}else {
	sheet.getCell('B' + (j)).font = {
		color:{argb:'000000'},
		bold:true
};
}

if(sheet.getCell('C' + (j)).value == ''){
	sheet.getCell('C' + (j)).fill = {
		type: 'pattern',
		pattern:'solid',
		bgColor:{argb:'00FFFF'},
		fgColor:{argb:'00FFFF'}
	};
	if(j>3 && j<=(totText-2)){
	var valC = sheet.getCell('C' + (j)).value ;
	sheet.getCell('C' + (j)).value = valC + '/-' ;
	sheet.getCell('C'  + (j)).alignment = { vertical: 'bottom', horizontal: 'right' };
	}


}else if (sheet.getCell('C' + (j)).value < 0) {
	sheet.getCell('C' + (j)).font = {
		color:{argb:'FF0000'},
		bold:true
};
if(j>3 && j<=(totText-2)){
var valC = sheet.getCell('C' + (j)).value ;
sheet.getCell('C' + (j)).value = valC + '/-' ;
sheet.getCell('C'  + (j)).alignment = { vertical: 'bottom', horizontal: 'right' };
}

}else {
	sheet.getCell('C' + (j)).font = {
		color:{argb:'000000'},
		bold:true
};
if(j>3 && j<=(totText-2)){
var valC = sheet.getCell('C' + (j)).value ;
sheet.getCell('C' + (j)).value = valC + '/-' ;
sheet.getCell('C'  + (j)).alignment = { vertical: 'bottom', horizontal: 'right' };
}

}

if(sheet.getCell('D' + (j)).value == ''){
	sheet.getCell('D' + (j)).fill = {
		type: 'pattern',
		pattern:'solid',
		bgColor:{argb:'00FFFF'},
		fgColor:{argb:'00FFFF'}
	};

}else if (sheet.getCell('D' + (j)).value < 0) {
	sheet.getCell('D' + (j)).font = {
		color:{argb:'FF0000'},
		bold:true
};
}else {
	sheet.getCell('D' + (j)).font = {
		color:{argb:'000000'},
		bold:true
};
}



////
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


if (totalB == 0) {
	sheet.getCell('B' + totText).value = totalB + '.00 gm';
}else {
	sheet.getCell('B' + totText).value = totalB + 'gm';
}

if (totalD == 0) {
	sheet.getCell('D' + totText).value = totalD + '.00 gm';
}else {
	sheet.getCell('D' + totText).value = totalD + 'gm';
}

sheet.getCell('B'  + totText).alignment = { vertical: 'bottom', horizontal: 'right' };
sheet.getCell('C' + totText).value = totalC + '/-';
sheet.getCell('C'  + totText).alignment = { vertical: 'bottom', horizontal: 'right' };
sheet.getCell('D'  + totText).alignment = { vertical: 'bottom', horizontal: 'right' };

sheet.getCell('B' + totText).font = {
	color:{argb:'800000'}
};
sheet.getCell('D' + totText).font = {
	color:{argb:'800000'}
};

//Coding to download in a folder
	var tempFilePath = 'C:\\dex\\' + reportType + '_' + custId + '_' + currentdate.getDate() + (currentdate.getMonth()+1)
											+ currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes()
											+ currentdate.getSeconds() + '.xlsx';
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
			debugger;
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
		app.post('/getTotalStockProduct', function(req, res) {

			var productId = req.body.Product;
			var StockMaint = app.models.stockMaint;
			StockMaint.find({
				where : {
					"Product": productId
				}
			}).then(function(records){
				var tQuantity = 0, tWeight = 0;
				for (var i = 0; i < records.length; i++) {
					tQuantity = tQuantity + records[i].Quantity;
					tWeight = tWeight + records[i].Weight;
								}
				res.send({
					"QuantityTotal": tQuantity,
					"WeightTotal": tWeight
				});
			});

		});
		app.post('/EntryTransfer', function(req ,res) {
			debugger;
			var date = new Date(JSON.parse(JSON.stringify(req.body.entryData.Date)));
			var orderNo = req.body.entryData.OrderNo;
			var customer = req.body.entryData.Customer;
			var Entry = app.models.Entry;
				Entry.find({
					where:{
						"Date":date,
						"Customer":customer,
						"OrderType":'R'
					},
					fields:{
						"Customer": true,
						"Cash":true,
						"OrderNo":true,
						"id": true
					}
				})
			.then(function(entry) {
				debugger;
				for (var i = 0; i < entry.length; i++) {
				if (entry[i].OrderNo === orderNo ) {
					res.send({
						"OrderNo": entry[i].OrderNo,
						"Cash": entry[i].Cash,
						"Customer":entry[i].Customer.toString(),
						"id": entry[i].id.toString()
					});
				}
				}
			})
		});
		app.post('/previousOrder', function(req ,res) {
			debugger;
			var OrderHeader = app.models.OrderHeader;
			var start = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
			start.setHours(0,0,0,0);

			var end = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
			end.setHours(23,59,59,999);
			if (req.body.OrderDetails.OrderNo === "") {

				OrderHeader.find({
				where: {
					and: [{
						Date: {
							gt: start
						}
					}, {
						Date: {
							lt: end
						}
					}]
				},
				fields:{
					"OrderNo": true,
					"Customer":true,
					"id": true
				}
			})
			.then(function(orders) {
				//sort the orders in descending order created today
				if(orders.length > 0){
					//if there are/is order created today sort and get next order no
					orders.sort(function (a, b) {
						return b.OrderNo - a.OrderNo;
					});
					res.send({
						"OrderNo": orders[0].OrderNo,
						"Customer":orders[0].Customer.toString(),
						"id": orders[0].id.toString()
					});
				}
			});

		}else {
			debugger;
			var orderId = req.body.OrderDetails.id;
			var orderNo = req.body.OrderDetails.OrderNo;
			OrderHeader.find({
			where: {
				and: [{
					Date: {
						gt: start
					}
				}, {
					Date: {
						lt: end
					}
				},
				{
				OrderNo: {
					lt:orderNo
				}
				}
			]},
			fields:{
				"OrderNo": true,
				"Customer":true,
				"id": true
			}
		})
		.then(function(orders) {
			debugger;
			//sort the orders in descending order created today
			if(orders.length > 0){
				//if there are/is order created today sort and get next order no
				orders.sort(function (a, b) {
					return b.OrderNo - a.OrderNo;
				});
				//if there are/is order created today sort and pass the previous order no
				res.send({
					"OrderNo": orders[0].OrderNo,
					"Customer":orders[0].Customer,
					"id": orders[0].id.toString()
				});
			}
		});
		}

		});//previous order
//function to get next order
		app.post('/nextOrder', function(req ,res) {
	debugger;
	var OrderHeader = app.models.OrderHeader;
	var start = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
	start.setHours(0,0,0,0);

	var end = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
	end.setHours(23,59,59,999);
	if (req.body.OrderDetails.OrderNo === "") {

		OrderHeader.find({
		where: {
			and: [{
				Date: {
					gt: start
				}
			}, {
				Date: {
					lt: end
				}
			}]
		},
		fields:{
			"OrderNo": true,
			"Customer":true,
			"id": true
		}
	})
	.then(function(orders) {
		//sort the orders in descending order created today
		if(orders.length > 0){
			res.send({
				"OrderNo": orders[0].OrderNo,
				"Customer":orders[0].Customer.toString(),
				"id": orders[0].id.toString()
			});
		}
	});

}else {
	debugger;
	var orderId = req.body.OrderDetails.id;
	var orderNo = req.body.OrderDetails.OrderNo;
	OrderHeader.find({
	where: {
		and: [{
			Date: {
				gt: start
			}
		}, {
			Date: {
				lt: end
			}
		},
		{
		OrderNo: {
			gt:orderNo
		}
		}
	]},
	fields:{
		"OrderNo": true,
		"Customer":true,
		"id": true
	}
})
.then(function(orders) {
	debugger;
	if(orders.length > 0){
		//if there are/is order created today pass next order no
		res.send({
			"OrderNo": orders[0].OrderNo,
			"Customer":orders[0].Customer.toString(),
			"id": orders[0].id.toString()
		});
	}
});
}
		});//next order

		app.post('/StockDelete',function(req ,res){
		var date = new Date(JSON.parse(JSON.stringify(req.body.Stock.Date)));
		var materialId = req.body.Stock.Product;
		var orderNo = req.body.Stock.OrderItemId;
		var Stock = app.models.stockMaint;
		debugger;
		Stock.find({
			where:{
				// "Date":date,
				// "Product":materialId
				"OrderItemId":orderNo
				// "OrderType":'R'
			},
			fields:{
				"Product": true,
				"Quantity":true,
				"Weight":true,
				"OrderId":true,
				"id": true
			}
		})
		.then(function(Stock) {
			debugger;
			for (var i = 0; i < Stock.length; i++) {
			if (Stock[i].OrderNo === orderNo ) {
				res.send({
					"Product": Stock[i].Product,
					"Quantity":Stock[i].Quantity,
					"Weight":Stock[i].Weight,
					"OrderId":Stock[i].OrderId,
					"id": Stock[i].id
				});
			}
			}
		})
		});//StockDelete
		app.post('/previousWSOrder', function(req ,res) {
			debugger;
			var WSOrderHeader = app.models.WSOrderHeader;
			var start = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
			start.setHours(0,0,0,0);

			var end = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
			end.setHours(23,59,59,999);
			if (req.body.OrderDetails.OrderNo === "") {

				WSOrderHeader.find({
				where: {
					and: [{
						Date: {
							gt: start
						}
					}, {
						Date: {
							lt: end
						}
					}]
				},
				fields:{
					"OrderNo": true,
					"Customer":true,
					"id": true
				}
			})
			.then(function(orders) {
				//sort the orders in descending order created today
				if(orders.length > 0){
					//if there are/is order created today sort and get next order no
					orders.sort(function (a, b) {
						return b.OrderNo - a.OrderNo;
					});
					res.send({
						"OrderNo": orders[0].OrderNo,
						"Customer":orders[0].Customer.toString(),
						"id": orders[0].id.toString()
					});
				}
			});

		}else {
			debugger;
			var orderId = req.body.OrderDetails.id;
			var orderNo = req.body.OrderDetails.OrderNo;
			WSOrderHeader.find({
			where: {
				and: [{
					Date: {
						gt: start
					}
				}, {
					Date: {
						lt: end
					}
				},
				{
				OrderNo: {
					lt:orderNo
				}
				}
			]},
			fields:{
				"OrderNo": true,
				"Customer":true,
				"id": true
			}
		})
		.then(function(orders) {
			debugger;
			//sort the orders in descending order created today
			if(orders.length > 0){
				//if there are/is order created today sort and get next order no
				orders.sort(function (a, b) {
					return b.OrderNo - a.OrderNo;
				});
				//if there are/is order created today sort and pass the previous order no
				res.send({
					"OrderNo": orders[0].OrderNo,
					"Customer":orders[0].Customer,
					"id": orders[0].id.toString()
				});
			}
		});
		}

		});//previous order
//function to get next order
		app.post('/nextWSOrder', function(req ,res) {
	debugger;
	var WSOrderHeader = app.models.WSOrderHeader;
	var start = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
	start.setHours(0,0,0,0);

	var end = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
	end.setHours(23,59,59,999);
	if (req.body.OrderDetails.OrderNo === "") {

		WSOrderHeader.find({
		where: {
			and: [{
				Date: {
					gt: start
				}
			}, {
				Date: {
					lt: end
				}
			}]
		},
		fields:{
			"OrderNo": true,
			"Customer":true,
			"id": true
		}
	})
	.then(function(orders) {
		//sort the orders in descending order created today
		if(orders.length > 0){
			res.send({
				"OrderNo": orders[0].OrderNo,
				"Customer":orders[0].Customer.toString(),
				"id": orders[0].id.toString()
			});
		}
	});

}else {
	debugger;
	var orderId = req.body.OrderDetails.id;
	var orderNo = req.body.OrderDetails.OrderNo;
	WSOrderHeader.find({
	where: {
		and: [{
			Date: {
				gt: start
			}
		}, {
			Date: {
				lt: end
			}
		},
		{
		OrderNo: {
			gt:orderNo
		}
		}
	]},
	fields:{
		"OrderNo": true,
		"Customer":true,
		"id": true
	}
})
.then(function(orders) {
	debugger;
	if(orders.length > 0){
		//if there are/is order created today pass next order no
		res.send({
			"OrderNo": orders[0].OrderNo,
			"Customer":orders[0].Customer.toString(),
			"id": orders[0].id.toString()
		});
	}
});
}
		});//next order
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
