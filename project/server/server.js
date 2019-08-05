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


///// Coding for Entry Download/////
app.post('/pOrderDownload', function(req, res) {
debugger;
var reportType = req.body.type;
var custId = req.body.id;
var name = req.body.name;
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
var POrder = app.models.CustomerOrder;
POrder.find({where : {
	"Customer": custId
}})
.then(function(Records, err) {
		debugger;
			if (Records) {
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
for (var i = 0; i < Records["length"]; i++) {
var items = Records[i].__data;
var item = [items["Date"],items["DelDate"],name,items["Material"],items["Qty"],items["Weight"],items["Making"],items["Remarks"],items["Karigar"]];
totalE = totalE + items["Qty"];
totalF = totalF + items["Weight"];
sheet.addRow().values = item;
}


//Coding for formula and concatenation in the last line
var totText = Records["length"] + 4;
var totCol = totText - 1;
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



//Coding for rows and column border
for(var j=1; j<=totText; j++){
////
// if(sheet.getCell('E' + (j)).value == ''){
// 	sheet.getCell('E' + (j)).fill = {
// 		type: 'pattern',
// 		pattern:'solid',
// 		bgColor:{argb:'00FFFF'},
// 		fgColor:{argb:'00FFFF'}
// 	};
//
// }else {
// 	sheet.getCell('E' + (j)).font = {
// 		color:{argb:'000000'}
// };
// }
//
// if(sheet.getCell('F' + (j)).value == ''){
// 	sheet.getCell('F' + (j)).fill = {
// 		type: 'pattern',
// 		pattern:'solid',
// 		bgColor:{argb:'00FFFF'},
// 		fgColor:{argb:'00FFFF'}
// 	};
//
// }else {
// 	sheet.getCell('F' + (j)).font = {
// 		color:{argb:'000000'}
// };
// }



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


// if (totalF == 0) {
// 	sheet.getCell('D' + totText).value = totalD + '.00 gm';
// }else {
	sheet.getCell('F' + totText).value = totalF + 'gm';
// }

sheet.getCell('E'  + totText).alignment = { vertical: 'bottom', horizontal: 'right' };
// sheet.getCell('C' + totText).value = totalC + '/-';
// sheet.getCell('C'  + totText).alignment = { vertical: 'bottom', horizontal: 'right' };
sheet.getCell('F'  + totText).alignment = { vertical: 'bottom', horizontal: 'right' };


// sheet.getCell('B' + totText).font = {
// 	color:{argb:'800000'}
// };
// sheet.getCell('D' + totText).font = {
// 	color:{argb:'800000'}
// };
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

		//function to get previous order
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
