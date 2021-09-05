var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var xlsx = require('node-xlsx');
var express = require('express');
// var fs = require('fs');
var redis = require('redis');
var JWTR = require('jwt-redis').default;
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
var app = express();
app.set('view engine', 'ejs');

app = module.exports = loopback();

// parse application/json
app.use(bodyParser.json());
app.use(methodOverride('_method'));
// app.use(bodyParser.urlencoded({
// 	extended: true
// }));
app.use(bodyParser.json({
	limit: '10mb'
}));
app.use(bodyParser.urlencoded({
	extended: true
}));
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



		// app.get('/logout',function(req,res){
		// 	debugger
		// 	var redis = require('redis');
		//
		// var JWTR =  require('jwt-redis').default;
		// var redisClient = redis.createClient();
		// var jwtr = new JWTR(redisClient);
		//
		// jwtr.sign(payload, secret)
		//     .then((token)=>{
		//             // your code
		//     })
		//     .catch((error)=>{
		//             // error handling
		//     });
		// 		jwtr.verify(token, secret);
		// 		jwtr.destroy(token);
		// 		res.clearCookie("jwt");
		//
		// });
		//


		app.post('/updatePhotoFlag1', function(req, res) {

			var customerOrderKey = req.body.id;
			var isPhoto = req.body.hide;
			var oCustomerOrder = app.models.Group;
			var updateObj = {
				hide: isPhoto
			};
			oCustomerOrder.findById(customerOrderKey).then(function(instance) {
				instance.updateAttributes(updateObj);
				return res.send("done");
			});
		});


		app.post('/updatePhoto', function(req, res) {

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

		//folder name must be uploads in server directory where you should place ur file
		app.post('/upload',
			function(req, res) {

				if (!req.files.myFileUpload) {
					res.send('No files were uploaded.');
					return;
				}

				var sampleFile;
				var exceltojson;
				// console.log(this.getView().byId("uploadTypeSelect").mProperties["value"]);
				// console.log(req.type);
				console.log(req.body["myFileUpload-data"]);
				const valueUploadType = req.body["myFileUpload-data"];
				sampleFile = req.files.myFileUpload;

				sampleFile.mv('./uploads/' + req.files.myFileUpload.name, function(err) {
					if (err) {
						console.log("eror saving");
					} else {
						console.log("saved");
						if (req.files.myFileUpload.name.split('.')[req.files.myFileUpload.name.split('.').length - 1] === 'xlsx') {
							exceltojson = xlsxtojson;
							console.log("xlxs");
						} else {
							exceltojson = xlstojson;
							console.log("xls");
						}
						try {
							exceltojson({
								input: './uploads/' + req.files.myFileUpload.name,
								output: null, //since we don't need output.json
								lowerCaseHeaders: true
							}, function(err, result) {
								if (err) {
									return res.json({
										error_code: 1,
										err_desc: err,
										data: null
									});
								}
								res.json({
									error_code: 0,
									err_desc: null,
									data: result
								});

								var demoSparshSihotiya = 0;

								var getMyDate = function(strDate) {
									var qdat = new Date();
									var x = strDate;
									qdat.setYear(parseInt(x.substr(0, 4)));
									qdat.setMonth(parseInt(x.substr(4, 2)) - 1);
									qdat.setDate(parseInt(x.substr(6, 2)));
									return qdat;
								};

								var Student = app.models.Student;
								var Batch = app.models.Course;
								var Account = app.models.Account;
								var Subs = app.models.Sub;

								var Group = app.models.Group;
								var City = app.models.City;
								var Customer = app.models.Customer;
								var Product = app.models.Product;
								var Entry = app.models.Entry;

								var uploadType = valueUploadType;
								///*****Code to update the batchs
								this.allResult = [];
								///Process the result json and send to mongo for creating all inquiries

								var cityData = [];
								var groupData = [];
								var customerData = [];
								var productData = [];
								if (uploadType == "Customer") {
									Group.find({}, function(err, groups) {
										groups.map((data) => {
											groupData[data.__data.groupCode] = data.__data.id;
										});
									});

									City.find({}, function(err, city) {
										city.map((data) => {
											cityData[data.__data.cityCode] = data.__data.id;
										});
									});
								}

								if (uploadType == "Entry") {
									Customer.find({}, function(err, customer) {
										customer.map((data) => {
											customerData[data.__data.CustomerCode] = data.__data.id;
										});
									});

									Product.find({}, function(err, product) {
										product.map((data) => {
											productData[data.__data.ProductCode] = data.__data.id;
										});
									});
								}

								this.mongoDataUpdate = () => {
									setTimeout(function() {
										for (var j = 0; j < result.length; j++) {
											var singleRec = result[j];

											switch (uploadType) {
												case "Check":
													break;
												case "Server":
													break;
												case "Email":
													break;
												case "Account":
													var newRec = {};
													newRec.accountName = singleRec.accountname;
													newRec.ifsc = singleRec.ifsc;
													newRec.accountNo = singleRec.accountno;
													newRec.limit = singleRec.limit;
													newRec.white = singleRec.white;
													newRec.userId = singleRec.userid;
													newRec.registeredNo = singleRec.mobile;
													newRec.email = "null";
													newRec.counter = 0;
													newRec.current = false;
													Account.findOrCreate({
															where: {
																accountNo: newRec.accountNo
															}
														}, newRec)
														.then(function(inq) {

															console.log("created successfully");
														})
														.catch(function(err) {
															console.log(err);
														});
													///*****End of code to update batches
													break;
												case "Batch":
													break;
												case "Group":
													var newRec = {};
													newRec.groupCode = singleRec["groupcode"];
													newRec.groupName = singleRec["groupname"];
													newRec.description = singleRec["description"];
													Group.findOrCreate({
															where: {
																groupCode: newRec.groupCode,
																groupName: newRec.groupName,
																description: newRec.description
															}
														}, newRec)
														.then(function(inq) {

															console.log("created successfully");
														})
														.catch(function(err) {
															console.log(err);
														});
													///*****End of code to update batches
													break;
												case "City":
													var newRec = {};
													newRec.cityCode = singleRec["citycode"];
													newRec.cityName = singleRec["cityname"];
													if (!singleRec["state"]) {
														newRec.state = ""
													} else {
														newRec.state = singleRec["state"];
													}

													console.log(newRec);
													City.findOrCreate({
															where: {
																cityCode: newRec.cityCode,
																cityName: newRec.cityName,
																state: newRec.state
															}
														}, newRec)
														.then(function(inq) {

															console.log("created successfully");
														})
														.catch(function(err) {
															console.log(err);
														});
													///*****End of code to update batches
													break;
												case "Customer":
													var newRec = {};
													newRec.CustomerCode = singleRec["customercode"];
													newRec.Name = singleRec["name"];
													newRec.City = cityData[singleRec["city"]];
													newRec.Type = singleRec["type"];
													newRec.Group = groupData[singleRec["group"]];
													newRec.MobilePhone = singleRec["mobilephone"];

													Customer.findOrCreate({
														where: {
															CustomerCode: newRec.CustomerCode,
															Name: newRec.Name,
															City: newRec.City,
															Type: newRec.Type,
															Group: newRec.Group,
															MobilePhone: newRec.MobilePhone,
															SecondaryPhone: 0
														}
													}, newRec).then(function(inq) {
														console.log("Created Successfully");
													}).catch(function(err) {
														console.log(err);
													});

													break;
												case "Product":
													var newRec = {};
													newRec.ProductCode = singleRec["productcode"];
													newRec.ProductName = singleRec["productname"];
													newRec.Type = singleRec["type"];
													newRec.Karat = singleRec["karat"];
													newRec.HindiName = singleRec["hindiname"];
													newRec.Tunch = singleRec["tunch"];
													newRec.Wastage = singleRec["wastage"];
													newRec.CustomerTunch = singleRec["customertunch"];
													newRec.AlertQuantity = singleRec["alertquantity"];
													newRec.Making = singleRec["making"];
													newRec.CustomerMaking = singleRec["customermaking"];
													newRec.Category = singleRec["category"];
													newRec.PricePerUnit = singleRec["priceperunit"];
													Product.findOrCreate({
															where: {
																ProductCode: newRec.ProductCode,
																ProductName: newRec.ProductName,
																Type: newRec.Type,
																Karat: newRec.Karat,
																HindiName: newRec.HindiName,
																Tunch: newRec.Tunch,
																Wastage: newRec.Wastage,
																CustomerTunch: newRec.CustomerTunch,
																AlertQuantity: newRec.AlertQuantity,
																Making: newRec.Making,
																CustomerMaking: newRec.CustomerMaking,
																Category: newRec.Category,
																PricePerUnit: newRec.PricePerUnit
															}
														}, newRec)
														.then(function(inq) {

															console.log("created successfully");
														})
														.catch(function(err) {
															console.log(err);
														});
													///*****End of code to update batches
													break;
												case "Entry":


													var newRec = {};
													newRec.Date = singleRec["date"];
													newRec.Cash = singleRec["cash"];
													newRec.Gold = singleRec["gold"];
													newRec.Silver = singleRec["silver"];
													newRec.Weight = singleRec["weight"];
													newRec.Tunch = singleRec["tunch"];
													newRec.DueDate = singleRec["duedate"];
													newRec.Remarks = singleRec["remarks"];
													newRec.Product = productData[singleRec["product"]];
													newRec.Customer = customerData[singleRec["customer"]];

													var [date, month, year] = singleRec["date"].split("-");
													var [dueDate, dueMonth, dueYear] = singleRec["duedate"].split("-");
													// console.log(productData[singleRec["product"]], newRec.Product);

													if (month == "Jan") {
														month = 1;
													} else if (month == "Feb") {
														month = 2;
													} else if (month == "Mar") {
														month = 3;
													} else if (month == "Apr") {
														month = 4;
													} else if (month == "May") {
														month = 5;
													} else if (month == "Jun") {
														month = 6;
													} else if (month == "Jul") {
														month = 7;
													} else if (month == "Aug") {
														month = 8;
													} else if (month == "Sep") {
														month = 9;
													} else if (month == "Oct") {
														month = 10;
													} else if (month == "Nov") {
														month = 11;
													} else if (month == "Dec") {
														month = 12;
													}

													if (dueMonth == "Jan") {
														dueMonth = 1;
													} else if (dueMonth == "Feb") {
														dueMonth = 2;
													} else if (dueMonth == "Mar") {
														dueMonth = 3;
													} else if (dueMonth == "Apr") {
														dueMonth = 4;
													} else if (dueMonth == "May") {
														dueMonth = 5;
													} else if (dueMonth == "Jun") {
														dueMonth = 6;
													} else if (dueMonth == "Jul") {
														dueMonth = 7;
													} else if (dueMonth == "Aug") {
														dueMonth = 8;
													} else if (dueMonth == "Sep") {
														dueMonth = 9;
													} else if (dueMonth == "Oct") {
														dueMonth = 10;
													} else if (dueMonth == "Nov") {
														dueMonth = 11;
													} else if (dueMonth == "Dec") {
														dueMonth = 12;
													}

													newRec.Date = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(date) + 1);
													newRec.DueDate = new Date(2000 + parseInt(dueYear), parseInt(dueMonth) - 1, parseInt(dueDate) + 1);
													newRec.CreatedOn = newRec.Date;
													newRec.ChangedOn = newRec.Date;
													Entry.findOrCreate({
														where: {
															Date: newRec.Date,
															Customer: newRec.Customer,
															Cash: newRec.Cash,
															Gold: newRec.Gold,
															Silver: newRec.Silver,
															Weight: newRec.Weight,
															Tunch: newRec.Tunch,
															DueDate: newRec.DueDate,
															Remarks: newRec.Remarks,
															Product: newRec.Product,
														}
													}, newRec).then(function(inq) {
														console.log("Created Successfully");
													}).catch(function(err) {
														console.log(err);
													});

													break;
												case "Students":
													break;
												case "Subscription":
													break;
											}
										}
									}, 5000);
								}

								this.mongoDataUpdate();
							});
						} catch (e) {
							console.log("error");
							res.json({
								error_code: 1,
								err_desc: "Corupted excel file"
							});
						}

					}
				})
			}
		);
		app.post('/createNewUser',
			function(req, res) {
				if (!req.body.name) {
					res.send('No user name sent');
					return;
				}
				if (!req.body.emailId) {
					res.send('No Email Id');
					return;
				}
				if (!req.body.role) {
					//Admin, Content
					res.send('No Role');
					return;
				}
				if (!req.body.Authorization) {
					res.send('No Authorization');
					return;
				}

				this.Token = app.models.AccessToken;
				this.User = app.models.User;
				this.Role = app.models.Role;
				this.AppUser = app.models.AppUser;
				this.RoleMapping = app.models.RoleMapping;
				var _this = this;
				this.Token.findById(req.body.Authorization).then(function(token) {
					var _this2 = _this;
					_this2.userId = token.userId;
					_this.User.findOne({
						where: {
							email: req.body.emailId
						}
					}).then(function(user) {
						if (!user) {
							var _this3 = _this2;
							_this2.User.create({
								username: req.body.name,
								email: req.body.emailId,
								password: req.body.password ? req.body.password : 'Welcome1'
							}).then(function(user) {
								if (user) {
									var _this4 = _this3;
									_this3.TechnicalId = user.id;
									_this3.AppUser.findOne({
										where: {
											"EmailId": user.email
										}
									}).then(function(roleMapping) {

										if (!roleMapping) {
											_this4.AppUser.create({
												TechnicalId: _this4.TechnicalId,
												EmailId: req.body.emailId,
												UserName: req.body.name,
												Role: req.body.role,
												CreatedOn: new Date(),
												CreatedBy: _this4.userId,
												blocked: false,
												pwdChange: true,
												lastLogin: new Date()
											}).then(function(roleMapping) {
												res.send("yes created");
											});
										}
									});
								}
							});
						} else {
							res.send("User Already Exist!!");
						}
					}).catch(function(err) {
						res.send("You are not Authorized to perform this action");
					});
				}).catch(function(err) {
					res.send("You are not Authorized to perform this action");
				});

			}

			// jwtr.destroy(token)
		);
		app.post('/updateRetailOrderHdr', function(req, res) {

			var OrderHeader = app.models.OrderHeader;
			var RecordId = req.body.OrderDetails.id;
			var Customer = req.body.OrderDetails.Customer;
			var GoldBhav22 = req.body.OrderDetails.GoldBhav22;
			var GoldBhav20 = req.body.OrderDetails.GoldBhav20;
			var GoldBhav = req.body.OrderDetails.GoldBhav;
			var SilverBhav = req.body.OrderDetails.SilverBhav;

			var updateObj = {
				// Customer: Customer,
				GoldBhav22: GoldBhav22,
				GoldBhav20: GoldBhav20,
				GoldBhav: GoldBhav,
				SilverBhav: SilverBhav,
				ChangedOn: new Date()
			};
			OrderHeader.findById(RecordId).then(function(instance) {

				instance.updateAttributes(updateObj);
				// instance.updateAttributes(updateObj).then(function(res) {
				//
				// 	console.log(res);
				// 	return res.send("done");}).catch(function{});
				return res.send("done");
			});
		});
		app.get('/kaachiDownload', function(req, res) {

			var reportType = req.query.type;
			var custId = req.query.id;
			var name = req.query.name;
			var city = req.query.city;
			var Ggroup = "";
			//read customer name by id, group by group id, city by
			//read kacchi and print report with all coloring, formatting, totaling
			var responseData = [];
			var oSubCounter = {};
			var Customer = app.models.Customer;

			var async = require('async');;
			async.waterfall([
					function(callback) {
						Customer.findById(custId, {
							fields: {
								"CustomerCode": true,
								"Name": true,
								"Group": true,
								"City": true
							}
						}).then(function(customerRecord, err) {
							callback(err, customerRecord);
						});
					},
					function(customerRecord, callback) {
						// arg1 now equals 'one' and arg2 now equals 'two'
						var City = app.models.City;
						City.findById(customerRecord.City, {
							fields: {
								"cityName": true
							}
						}).then(function(cityRecord, err) {
							callback(err, customerRecord, cityRecord);
						});
					},
					function(customerRecord, cityRecord, callback) {
						// arg1 now equals 'three'
						var Group = app.models.Group;
						Ggroup = Group;
						Group.findById(customerRecord.Group, {
							fields: {
								"groupName": true
							}
						}).then(function(groupRecord, err) {
							callback(err, customerRecord, cityRecord, groupRecord);
						});
					}
				], function(err, customerRecord, cityRecord, groupRecord) {
					// result now equals 'done'
					//set all values to local variables which we need inside next promise
					name = customerRecord.Name;
					city = cityRecord.cityName;
					// city = req.body.city;
					Ggroup = groupRecord.groupName;
					try {
						//read the kacchi Records
						var Kacchi = app.models.Kacchi;

						Kacchi.find({
								where: {
									"Customer": custId
								}
							})
							.then(function(Records, err) {
									if (Records) {
										var excel = require('exceljs');
										var workbook = new excel.Workbook(); //creating workbook
										var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
										sheet.columns = [{
											width: 11
										}];

										//Heading for excel
										var heading = {
											heading: "Kachhi Report"
										};
										sheet.mergeCells('A1:E1');
										sheet.getCell('E1').value = 'Kacchi Report';
										sheet.getCell('A1').alignment = {
											vertical: 'middle',
											horizontal: 'center'
										};
										sheet.getCell('A1').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '808080'
											}
										};
										//Code for getting current datetime
										var currentdate = new Date();
										var datetime = currentdate.getDate() + "." +
											(currentdate.getMonth() + 1) + "." +
											currentdate.getFullYear() + " / " +
											currentdate.getHours() + ":" +
											currentdate.getMinutes() + ":" +
											currentdate.getSeconds();
										// sheet.getCell('E2').value = datetime;
										// // sheet.getCell('E1').width=50;
										// sheet.getRow(2).font === {
										// 	bold: true
										// };
										//Merging second Row
										sheet.mergeCells('A2:E2');
										sheet.getCell('E2').value = name + ' - ' + city + ' - ' + Ggroup + ' - ' + datetime;
										sheet.getCell('A2').alignment = {
											vertical: 'middle',
											horizontal: 'center'
										};
										sheet.getCell('A3').alignment = {
											width: "10"
										};


										//Coding to remove unwanted header
										var header = Object.keys(Records[0].__data);
										header.splice(1, 1);
										header.splice(5, 5);

										sheet.addRow().values = header;

										//Coding for cell color and bold character
										sheet.getCell('A3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('B3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('C3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('D3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('E3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};

										//Coding to remove unwanted items or Rows
										for (var i = 0; i < Records["length"]; i++) {
											var items = Object.values(Records[i].__data);
											items.splice(1, 1);
											items.splice(5, 5);
											sheet.addRow().values = items;
										}

										//Coding for formula and concatenation in the last line
										var totText = Records["length"] + 4;
										var totCol = totText - 1;
										sheet.getCell('A' + totText).value = "Total";
										sheet.getCell('B' + totText).value = Records["length"];
										sheet.getCell('C' + totText).value = {
											formula: '=CONCATENATE(SUM(C4:C' + totCol + ')," gm")'
										};
										sheet.getCell('D' + totText).value = {
											formula: '=CONCATENATE(ROUND(AVERAGE(D4:D' + totCol + '),0)," T")'
										};
										sheet.getCell('E' + totText).value = {
											formula: '=CONCATENATE(SUM(E4:E' + totCol + ')," gm")'
										};

										sheet.getCell('A' + totText).fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('B' + totText).fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('C' + totText).fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('D' + totText).fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('E' + totText).fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};

										//Coding for rows and column border
										for (var j = 1; j <= totText; j++) {
											sheet.getCell('A' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('B' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('C' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('D' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('E' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
										}

										//Coding to download in a folder
										var tempFilePath = reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) +
											currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() +
											currentdate.getSeconds() + '.xlsx';
										// console.log("tempFilePath : ", tempFilePath);
										// workbook.xlsx.writeFile(tempFilePath).then(function() {
										// 	res.sendFile(tempFilePath, function(err) {
										// 		if (err) {
										// 			console.log('---------- error downloading file: ', err);
										// 		}
										// 	});
										// 	console.log('file is written @ ' + tempFilePath);
										// });
										res.setHeader(
											"Content-Type",
											"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
										);
										res.setHeader(
											"Content-Disposition",
											"attachment; filename=" + tempFilePath
										);
										// console.log("came");
										return workbook.xlsx.write(res).then(function(data) {
											console.log(data);
											//res.writeHead(200, [['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
											//res.end(new Buffer(data, 'base64'));
											res.status(200).end();
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

		app.get('/stockDownload', function(req, res) {

			var reportType = req.query.type;
			var responseData = [];
			var oSubCounter = {};

			var StockMaint = app.models.stockMaint;
			var Product = app.models.Product;

			var async = require('async');;
			async.waterfall([
					function(callback) {
						StockMaint.find({
							fields: {
								"Product": true,
								"Quantity": true,
								"Weight": true
							}
						}).then(function(sRecord, err) {
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
								ProductCode: {
									inq: allProd
								}
								//"ProductCode": sRecord.Product
							},
							fields: {
								"ProductName": true,
								"Type": true,
								"ProductCode": true
							}
						}).then(function(pRecord, err) {
							callback(err, sRecord, pRecord);
						});
					}
				], function(err, sRecord, pRecord) {
					try {

						var products = [];
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
						var heading = {
							heading: "Stock Report"
						};
						sheet.mergeCells('A1:D1');
						sheet.getCell('D1').value = 'Stock Report';
						sheet.getCell('A1').alignment = {
							vertical: 'middle',
							horizontal: 'center'
						};
						sheet.getCell('A1').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: '808080'
							}
						};

						var currentdate = new Date();
						var datetime = currentdate.getDate() + "." +
							(currentdate.getMonth() + 1) + "." +
							currentdate.getFullYear() + " / " +
							currentdate.getHours() + ":" +
							currentdate.getMinutes() + ":" +
							currentdate.getSeconds();


						var header = ["Material Name", "Material Type", "Tot Quantity", "Tot Weight"];
						sheet.addRow().values = header;

						//Coding for cell color and bold character
						sheet.getCell('A2').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: 'A9A9A9'
							}
						};
						sheet.getCell('B2').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: 'A9A9A9'
							}
						};
						sheet.getCell('C2').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: 'A9A9A9'
							}
						};
						sheet.getCell('D2').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: 'A9A9A9'
							}
						};

						//Coding to remove unwanted items or Rows
						for (var i = 0; i < products["length"]; i++) {
							var items = products[i];
							var item = [items["ProductName"], items["Type"], items["Quantity"], items["Weight"]];
							sheet.addRow().values = item;
						}

						var totText = products["length"] + 2;
						var totCol = totText - 1;

						//Coding for rows and column border
						for (var j = 1; j <= totText; j++) {
							sheet.getCell('A' + (j)).border = {
								top: {
									style: 'thin'
								},
								left: {
									style: 'thin'
								},
								bottom: {
									style: 'thin'
								},
								right: {
									style: 'thin'
								}
							};
							sheet.getCell('B' + (j)).border = {
								top: {
									style: 'thin'
								},
								left: {
									style: 'thin'
								},
								bottom: {
									style: 'thin'
								},
								right: {
									style: 'thin'
								}
							};
							sheet.getCell('C' + (j)).border = {
								top: {
									style: 'thin'
								},
								left: {
									style: 'thin'
								},
								bottom: {
									style: 'thin'
								},
								right: {
									style: 'thin'
								}
							};
							sheet.getCell('D' + (j)).border = {
								top: {
									style: 'thin'
								},
								left: {
									style: 'thin'
								},
								bottom: {
									style: 'thin'
								},
								right: {
									style: 'thin'
								}
							};
						}

						//Coding to download in a folder
						var tempFilePath = reportType + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) +
							currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() +
							currentdate.getSeconds() + '.xlsx';
						// console.log("tempFilePath : ", tempFilePath);
						// workbook.xlsx.writeFile(tempFilePath).then(function() {
						// 	res.sendFile(tempFilePath, function(err) {
						// 		if (err) {
						// 			console.log('---------- error downloading file: ', err);
						// 		}
						// 	});
						// 	console.log('file is written @ ' + tempFilePath);
						// });
						res.setHeader(
							"Content-Type",
							"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						);
						res.setHeader(
							"Content-Disposition",
							"attachment; filename=" + tempFilePath
						);
						// console.log("came");
						return workbook.xlsx.write(res).then(function(data) {
							console.log(data);
							//res.writeHead(200, [['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
							//res.end(new Buffer(data, 'base64'));
							res.status(200).end();
						});

					} catch (e) {

					} finally {

					}
				}
				//res.send(responseData);

			);
		})

		app.get('/bookingDownload', function(req, res) {
			var reportType = req.query.type;
			var custId = req.query.id;
			var custName = req.query.name;
			var type = req.query.type1;


			var responseData = [];
			var oSubCounter = {};
			var B_Detail = app.models.BookingDetail;
			var B_Dlv_Detail = app.models.BookingDlvDetail;
			var Customer = app.models.Customer;

			var async = require('async');;
			async.waterfall([
					function(callback) {
						Customer.findById(custId, {
							fields: {
								"Name": true
							}
						}).then(function(cRecord, err) {
							callback(err, cRecord);
						});
					},
					function(cRecord, callback) {
						B_Detail.find({
							where: {
								"Customer": custId,
								"Type": type
							},
							fields: {
								"BookingDate": true,
								"Quantity": true,
								"Bhav": true,
								"Advance": true,
								"Type": true
							}
						}).then(function(b_Record, err) {
							callback(err, cRecord, b_Record);
						});
					},
					function(cRecord, b_Record, callback) {
						B_Dlv_Detail.find({
							where: {
								"Customer": custId,
								"Type": type
							},
							fields: {
								"BookingDate": true,
								"Quantity": true,
								"Bhav": true,
								"Advance": true,
								"Type": true
							}
						}).then(function(b_d_Record, err) {
							callback(err, cRecord, b_Record, b_d_Record);
						});
					}
				], function(err, cRecord, b_Record, b_d_Record) {

					try {

						var excel = require('exceljs');
						// var type = b_Record[0].Type;
						var workbook = new excel.Workbook(); //creating workbook
						var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

						//Heading for excel
						var heading = {
							heading: "Booking Report"
						};
						sheet.mergeCells('A1:H1');
						sheet.getCell('H1').value = 'Booking Report';
						sheet.getCell('A1').alignment = {
							vertical: 'middle',
							horizontal: 'center'
						};
						sheet.getCell('A1').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: '808080'
							}
						};
						//Code for getting current datetime
						var currentdate = new Date();
						var datetime = currentdate.getDate() + "." +
							(currentdate.getMonth() + 1) + "." +
							currentdate.getFullYear() + " / " +
							currentdate.getHours() + ":" +
							currentdate.getMinutes() + ":" +
							currentdate.getSeconds();

						//Merging second Row
						sheet.mergeCells('A2:H2');
						sheet.getCell('H2').value = 'Customer Name : ' + cRecord.Name + '\t    ' + '\n' + datetime;
						sheet.getCell('A2').alignment = {
							vertical: 'middle',
							horizontal: 'center'
						};

						var nameCol = sheet.getColumn('E');
						nameCol.width = 1;



						var header = ["Date", "Quantity", "Bhav", "Advance", " ", "Date", "Quantity", "Bhav"];
						sheet.addRow().values = header;

						//Coding for cell color and bold character
						sheet.getCell('A3').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: 'A9A9A9'
							}
						};
						sheet.getCell('B3').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: 'A9A9A9'
							}
						};
						sheet.getCell('C3').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: 'A9A9A9'
							}
						};
						sheet.getCell('D3').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: 'A9A9A9'
							}
						};
						sheet.getCell('E3').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: '000000'
							}
						};
						sheet.getCell('F3').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: 'A9A9A9'
							}
						};
						sheet.getCell('G3').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: 'A9A9A9'
							}
						};
						sheet.getCell('H3').fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: 'A9A9A9'
							}
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
							} else {
								var items = [];
							}
							if (b_d_Record[j] !== undefined) {
								var items_d = b_d_Record[j];
							} else {
								var items_d = [];
							}
							if (items["BookingDate"] !== undefined) {
								var iBDate = new Date(items["BookingDate"]);
								var iBDate_B = iBDate.getDate() + "." +
									(iBDate.getMonth() + 1) + "." +
									iBDate.getFullYear();
							} else {
								var iBDate_B = " ";
							}
							if (items_d["BookingDate"] !== undefined) {
								var iBDate_D = new Date(items_d["BookingDate"]);
								var iBDate_B_D = iBDate_D.getDate() + "." +
									(iBDate_D.getMonth() + 1) + "." +
									iBDate_D.getFullYear();
							} else {
								var iBDate_B_D = " ";
							}

							var item = [iBDate_B, items["Quantity"], items["Bhav"], items["Advance"], " ",
								iBDate_B_D, items_d["Quantity"], items_d["Bhav"]
							];
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
						sheet.getCell('D' + totText).value = totalD;
						sheet.getCell('G' + totText).value = totalG + 'gm';
						sheet.getCell('H' + totText).value = totalH / BDLength;
						sheet.getCell('F' + totText).value = "TOTAL";

						sheet.getCell('A' + totText).fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: '00FFFF'
							},
							bgColor: {
								argb: '00FFFF'
							}
						};
						sheet.getCell('A' + totText).font = {
							color: {
								argb: '0000FF'
							},
							bold: true
						};

						sheet.getCell('F' + totText).fill = {
							type: 'pattern',
							pattern: 'solid',
							fgColor: {
								argb: '00FFFF'
							},
							bgColor: {
								argb: '00FFFF'
							}
						};
						sheet.getCell('F' + totText).font = {
							color: {
								argb: '0000FF'
							},
							bold: true
						};

						for (var j = 1; j <= totText; j++) {
							////
							if (sheet.getCell('B' + (j)).value == 0) {
								sheet.getCell('B' + (j)).fill = {
									type: 'pattern',
									pattern: 'solid',
									bgColor: {
										argb: '00FFFF'
									},
									fgColor: {
										argb: '00FFFF'
									}
								};

							} else {
								sheet.getCell('B' + (j)).font = {
									color: {
										argb: '000000'
									},
									bold: true
								};
							}

							if (sheet.getCell('C' + (j)).value == 0) {
								sheet.getCell('C' + (j)).fill = {
									type: 'pattern',
									pattern: 'solid',
									bgColor: {
										argb: '00FFFF'
									},
									fgColor: {
										argb: '00FFFF'
									}
								};

							} else {
								sheet.getCell('C' + (j)).font = {
									color: {
										argb: '000000'
									},
									bold: true
								};
							}

							if (sheet.getCell('G' + (j)).value == 0) {
								sheet.getCell('G' + (j)).fill = {
									type: 'pattern',
									pattern: 'solid',
									bgColor: {
										argb: '00FFFF'
									},
									fgColor: {
										argb: '00FFFF'
									}
								};

							} else {
								sheet.getCell('G' + (j)).font = {
									color: {
										argb: '000000'
									},
									bold: true
								};
							}

							if (sheet.getCell('D' + (j)).value == 0) {
								sheet.getCell('D' + (j)).fill = {
									type: 'pattern',
									pattern: 'solid',
									bgColor: {
										argb: '00FFFF'
									},
									fgColor: {
										argb: '00FFFF'
									}
								};

							} else {
								sheet.getCell('D' + (j)).font = {
									color: {
										argb: '000000'
									},
									bold: true
								};
							}

							if (sheet.getCell('H' + (j)).value == 0) {
								sheet.getCell('H' + (j)).fill = {
									type: 'pattern',
									pattern: 'solid',
									bgColor: {
										argb: '00FFFF'
									},
									fgColor: {
										argb: '00FFFF'
									}
								};

							} else {
								sheet.getCell('H' + (j)).font = {
									color: {
										argb: '000000'
									},
									bold: true
								};
							}

							if (j > 2) {
								sheet.getCell('E' + (j)).fill = {
									type: 'pattern',
									pattern: 'solid',
									bgColor: {
										argb: '000000'
									},
									fgColor: {
										argb: '000000'
									}
								};
							}

							sheet.getCell('A' + (j)).border = {
								top: {
									style: 'thin'
								},
								left: {
									style: 'thin'
								},
								bottom: {
									style: 'thin'
								},
								right: {
									style: 'thin'
								}
							};
							sheet.getCell('B' + (j)).border = {
								top: {
									style: 'thin'
								},
								left: {
									style: 'thin'
								},
								bottom: {
									style: 'thin'
								},
								right: {
									style: 'thin'
								}
							};
							sheet.getCell('C' + (j)).border = {
								top: {
									style: 'thin'
								},
								left: {
									style: 'thin'
								},
								bottom: {
									style: 'thin'
								},
								right: {
									style: 'thin'
								}
							};
							sheet.getCell('D' + (j)).border = {
								top: {
									style: 'thin'
								},
								left: {
									style: 'thin'
								},
								bottom: {
									style: 'thin'
								},
								right: {
									style: 'thin'
								}
							};
							sheet.getCell('E' + (j)).border = {
								top: {
									style: 'thin'
								},
								left: {
									style: 'thin'
								},
								bottom: {
									style: 'thin'
								},
								right: {
									style: 'thin'
								}
							};
							sheet.getCell('F' + (j)).border = {
								top: {
									style: 'thin'
								},
								left: {
									style: 'thin'
								},
								bottom: {
									style: 'thin'
								},
								right: {
									style: 'thin'
								}
							};
							sheet.getCell('G' + (j)).border = {
								top: {
									style: 'thin'
								},
								left: {
									style: 'thin'
								},
								bottom: {
									style: 'thin'
								},
								right: {
									style: 'thin'
								}
							};
							sheet.getCell('H' + (j)).border = {
								top: {
									style: 'thin'
								},
								left: {
									style: 'thin'
								},
								bottom: {
									style: 'thin'
								},
								right: {
									style: 'thin'
								}
							};

						}

						sheet.getCell('B' + totText).font = {
							color: {
								argb: '800000'
							}
						};
						sheet.getCell('D' + totText).font = {
							color: {
								argb: '800000'
							}
						};
						sheet.getCell('G' + totText).font = {
							color: {
								argb: '800000'
							}
						};

						sheet.getCell('B' + totText).alignment = {
							vertical: 'bottom',
							horizontal: 'right'
						};
						sheet.getCell('G' + totText).alignment = {
							vertical: 'bottom',
							horizontal: 'right'
						};

						//Coding to download in a folder
						var tempFilePath = type + '_' + custName + '_' + 'Booking-' + currentdate.getDate() + (currentdate.getMonth() + 1) +
							currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() +
							currentdate.getSeconds() + '.xlsx';
						// console.log("tempFilePath : ", tempFilePath);
						// workbook.xlsx.writeFile(tempFilePath).then(function() {
						// 		res.sendFile(tempFilePath, function(err) {
						// 			if (err) {
						// 				console.log('---------- error downloading file: ', err);
						// 			}
						// 		});
						// 		console.log('file is written @ ' + tempFilePath);
						// 	})
						// 	.catch(function(oError) {
						// 		that.getView().setBusy(false);
						// 		var oPopover = that.getErrorMessage(oError);
						// 	});
						//nn
						res.setHeader(
							"Content-Type",
							"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						);
						res.setHeader(
							"Content-Disposition",
							"attachment; filename=" + tempFilePath
						);
						// console.log("came");
						return workbook.xlsx.write(res).then(function(data) {
							console.log(data);
							//res.writeHead(200, [['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
							//res.end(new Buffer(data, 'base64'));
							res.status(200).end();
						});
					} catch (e) {

					} finally {

					}
				}
				//res.send(responseData);

			);
		})


		app.get('/customerOrderReport', function(req, res) {

			var custId = req.query.id;
			var custCode = req.query.custCode;

			//read customer name by id, group by group id, city by
			//read kacchi and print report with all coloring, formatting, totaling
			var responseData = [];
			var oSubCounter = {};
			var Customer = app.models.Customer;

			var productData = [];
			var Product = app.models.Product;
			Product.find({}, function(err, product) {
				product.map((data) => {
					productData[data.__data.id] = data.__data;
				});
			});

			const that = this;

			var async = require('async');
			async.waterfall([
				function(callback) {
					Customer.findById(custId, {
						fields: {
							"CustomerCode": true,
							"Name": true,
							"Group": true,
							"City": true
						}
					}).then(function(customerRecord, err) {
						callback(err, customerRecord);
					});
				}
			], function(err, customerRecord) {
				// result now equals 'done'
				//set all values to local variables which we need inside next promise
				name = customerRecord.Name;
				try {
					//read the kacchi Records
					var CustomerOrder = app.models.CustomerOrder;
					CustomerOrder.find({
							where: {
								"Customer": custId
							}
						})
						.then(function(Records, err) {
								if (Records) {
									var excel = require('exceljs');
									var workbook = new excel.Workbook(); //creating workbook
									var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

									//Heading for excel
									var heading = {
										heading: "Fast Report"
									};
									sheet.mergeCells('A1:I1');
									sheet.getCell('I1').value = 'Customer Order Report';
									sheet.getCell('I1').alignment = {
										vertical: 'middle',
										horizontal: 'center'
									};
									sheet.getCell('I1').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: '808080'
										}
									};

									//Merging second Row
									sheet.mergeCells('A2:I2');

									//Code for getting current datetime
									var currentdate = new Date();
									var num = Records.length;
									var datetime = currentdate.getDate() + "." +
										(currentdate.getMonth() + 1) + "." +
										currentdate.getFullYear() + " / " +
										currentdate.getHours() + ":" +
										currentdate.getMinutes() + ":" +
										currentdate.getSeconds();
									sheet.getCell('A2').value = 'Customer Name : ' + name + '(' + num + ')    ' + '\t' + '\n' + datetime;
									sheet.getCell('A2').alignment = {
										vertical: 'middle',
										horizontal: 'center'
									};
									sheet.getRow(2).font === {
										bold: true
									};

									var header = ["Date", "Delivery Date", "Item Name", "Qty", "Weight", "Making", "Remarks", "Status", "Karigar"];

									sheet.addRow().values = header;

									//Coding for cell color and bold character
									sheet.getCell('A3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('B3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('C3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('D3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('E3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('F3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('G3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('H3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('I3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};

									var totCash = 0;
									var totalB = 0;
									var totalC = 0;
									var totalD = 0;
									//code added by surya 10 nov - start

									// define function to change date format to dd.mm.yyyy using date Object
									function formatDateForEntry(date) {
										var d = new Date(date),
											month = '' + (d.getMonth() + 1),
											day = '' + d.getDate(),
											year = d.getFullYear();

										if (month.length < 2)
											month = '0' + month;
										if (day.length < 2)
											day = '0' + day;

										return [day, month, year].join('.');
									}

									var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE, colMaxLengthF, colMaxLengthG, colMaxLengthH, colMaxLengthI;
									//code added by surya 10 nov - end

									setTimeout(function() {
										//Coding to remove unwanted items or Rows
										for (var i = 0; i < Records["length"]; i++) {
											var items = Records[i].__data;
											items["Date"] = formatDateForEntry(items["Date"]);
											items["DelDate"] = formatDateForEntry(items["DelDate"]);
											var item = [items["Date"], items["DelDate"], productData[items["Material"]].ProductCode + " - " + productData[items["Material"]].ProductName, items["Qty"], items["Weight"], items["Making"], items["Remarks"], items["Status"], items["Karigar"]];
											sheet.addRow().values = item;
										}

										//Coding for formula and concatenation in the last line
										var totText = Records["length"] + 4;
										var totCol = totText - 1;

										//Coding for rows and column border
										for (var j = 1; j <= totText; j++) {
											////
											if (sheet.getCell('B' + (j)).value == '') {
												sheet.getCell('B' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('B' + (j)).value < 0) {
												sheet.getCell('B' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('B' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}

											if (sheet.getCell('C' + (j)).value == '') {
												sheet.getCell('C' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};
												if (j > 3 && j <= (totText - 2)) {
													var valC = sheet.getCell('C' + (j)).value;
													sheet.getCell('C' + (j)).value = valC + '/-';
													sheet.getCell('C' + (j)).alignment = {
														vertical: 'bottom',
														horizontal: 'right'
													};
												}

											} else if (sheet.getCell('C' + (j)).value < 0) {
												sheet.getCell('C' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
												if (j > 3 && j <= (totText - 2)) {
													var valC = sheet.getCell('C' + (j)).value;
													sheet.getCell('C' + (j)).value = valC + '/-';
													sheet.getCell('C' + (j)).alignment = {
														vertical: 'bottom',
														horizontal: 'right'
													};
												}

											} else {
												sheet.getCell('C' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
												if (j > 3 && j <= (totText - 2)) {
													var valC = sheet.getCell('C' + (j)).value;
													sheet.getCell('C' + (j)).value = valC + '/-';
													sheet.getCell('C' + (j)).alignment = {
														vertical: 'bottom',
														horizontal: 'right'
													};
												}

											}

											if (sheet.getCell('D' + (j)).value == '') {
												sheet.getCell('D' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('D' + (j)).value < 0) {
												sheet.getCell('D' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('D' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}

											////
											sheet.getCell('A' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('B' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('C' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('D' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('E' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('F' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('G' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('H' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('I' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};

											// code added by surya for autocolumn width - started

											if (j > "2") {
												//setting absolute length for column A
												if (sheet.getCell('A' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthA = sheet.getCell('A' + (j)).value.length;
													} else {
														if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
															colMaxLengthA = sheet.getCell('A' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('A').width = colMaxLengthA + 2;
												}
												//setting absolute length for column B
												if (sheet.getCell('B' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthB = sheet.getCell('B' + (j)).value.length;
													} else {
														if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
															colMaxLengthB = sheet.getCell('B' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('B').width = colMaxLengthB + 2;
												}
												//setting absolute length for column C
												if (sheet.getCell('C' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthC = sheet.getCell('C' + (j)).value.length;
													} else {
														if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
															colMaxLengthC = sheet.getCell('C' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('C').width = colMaxLengthC + 2;
												}
												//setting absolute length for column D
												if (sheet.getCell('D' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthD = sheet.getCell('D' + (j)).value.length;
													} else {
														if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
															colMaxLengthD = sheet.getCell('D' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('D').width = colMaxLengthD + 2;
												}
												//setting absolute length for column E
												if (sheet.getCell('E' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthE = sheet.getCell('E' + (j)).value.length;
													} else {
														if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
															colMaxLengthE = sheet.getCell('E' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('E').width = colMaxLengthE + 2;
												}
												//setting absolute length for column F
												if (sheet.getCell('F' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthF = sheet.getCell('F' + (j)).value.length;
													} else {
														if (sheet.getCell('F' + (j)).value.length > colMaxLengthF) {
															colMaxLengthF = sheet.getCell('F' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('F').width = colMaxLengthF + 2;
												}
												//setting absolute length for column G
												if (sheet.getCell('G' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthG = sheet.getCell('G' + (j)).value.length;
													} else {
														if (sheet.getCell('G' + (j)).value.length > colMaxLengthG) {
															colMaxLengthG = sheet.getCell('G' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('G').width = colMaxLengthG + 2;
												}
												//setting absolute length for column H
												if (sheet.getCell('H' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthH = sheet.getCell('H' + (j)).value.length;
													} else {
														if (sheet.getCell('H' + (j)).value.length > colMaxLengthH) {
															colMaxLengthH = sheet.getCell('H' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('H').width = colMaxLengthH + 2;
												}
												//setting absolute length for column I
												if (sheet.getCell('I' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthI = sheet.getCell('I' + (j)).value.length;
													} else {
														if (sheet.getCell('I' + (j)).value.length > colMaxLengthI) {
															colMaxLengthI = sheet.getCell('I' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('I').width = colMaxLengthI + 2;
												}
											}
											// code added by surya for autocolumn width - ended

										}

										const tempFileName = name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';

										//anurag
										res.setHeader(
											"Content-Type",
											"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
										);
										res.setHeader(
											"Content-Disposition",
											"attachment; filename=" + tempFileName
										);

										return workbook.xlsx.write(res).then(function(data) {
											console.log(data);
											res.status(200).end();
										});
									}, 3000);
								}
							}

						).catch(function(oError) {
							console.log(oError);
						});
				} catch (e) {

				} finally {

				}
			});
		})

		app.get('/allCustomerOrderReport', function(req, res) {

			var custId = req.query.id;
			var custCode = req.query.custCode;

			//read customer name by id, group by group id, city by
			//read kacchi and print report with all coloring, formatting, totaling
			var responseData = [];
			var oSubCounter = {};
			var Customer = app.models.Customer;

			var productData = [];
			var customerData = [];
			var Product = app.models.Product;
			Product.find({}, function(err, product) {
				product.map((data) => {
					productData[data.__data.id] = data.__data;
				});
			});
			Customer.find({}, function(err, customer) {
				customer.map((data) => {
					customerData[data.__data.id] = data.__data;
				});
			});


			const that = this;

			var async = require('async');
			async.waterfall([
				function(callback) {
					Customer.findById(custId, {
						fields: {
							"CustomerCode": true,
							"Name": true,
							"Group": true,
							"City": true
						}
					}).then(function(customerRecord, err) {
						callback(err, customerRecord);
					});
				}
			], function(err, customerRecord) {
				// result now equals 'done'
				//set all values to local variables which we need inside next promise
				name = customerRecord.Name;
				try {
					//read the kacchi Records
					var CustomerOrder = app.models.CustomerOrder;
					CustomerOrder.find({
							// where: {
							//     "Customer": custId
							// }
						})
						.then(function(Records, err) {
								if (Records) {
									var excel = require('exceljs');
									var workbook = new excel.Workbook(); //creating workbook
									var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

									//Heading for excel
									var heading = {
										heading: "Fast Report"
									};
									sheet.mergeCells('A1:I1');
									sheet.getCell('I1').value = 'Customer Order Report';
									sheet.getCell('I1').alignment = {
										vertical: 'middle',
										horizontal: 'center'
									};
									sheet.getCell('I1').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: '808080'
										}
									};

									//Merging second Row
									sheet.mergeCells('A2:I2');

									//Code for getting current datetime
									var currentdate = new Date();
									var num = Records.length;
									var datetime = currentdate.getDate() + "." +
										(currentdate.getMonth() + 1) + "." +
										currentdate.getFullYear() + " / " +
										currentdate.getHours() + ":" +
										currentdate.getMinutes() + ":" +
										currentdate.getSeconds();
									sheet.getCell('A2').value = '(' + num + ')    ' + '\t' + '\n' + datetime;
									sheet.getCell('A2').alignment = {
										vertical: 'middle',
										horizontal: 'center'
									};
									sheet.getRow(2).font === {
										bold: true
									};

									var header = ["Date", "Delivery Date", "Customer Name", "Item Name", "Qty", "Weight", "Making", "Remarks", "Status", "Karigar"];

									sheet.addRow().values = header;

									//Coding for cell color and bold character
									sheet.getCell('A3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('B3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('C3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('D3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('E3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('F3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('G3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('H3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('I3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('J3').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};

									var totCash = 0;
									var totalB = 0;
									var totalC = 0;
									var totalD = 0;
									//code added by surya 10 nov - start

									// define function to change date format to dd.mm.yyyy using date Object
									function formatDateForEntry(date) {
										var d = new Date(date),
											month = '' + (d.getMonth() + 1),
											day = '' + d.getDate(),
											year = d.getFullYear();

										if (month.length < 2)
											month = '0' + month;
										if (day.length < 2)
											day = '0' + day;

										return [day, month, year].join('.');
									}

									var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE, colMaxLengthF, colMaxLengthG, colMaxLengthH, colMaxLengthI, colMaxLengthJ;
									//code added by surya 10 nov - end

									setTimeout(function() {
										//Coding to remove unwanted items or Rows
										for (var i = 0; i < Records["length"]; i++) {
											var items = Records[i].__data;
											items["Date"] = formatDateForEntry(items["Date"]);
											items["DelDate"] = formatDateForEntry(items["DelDate"]);
											var item = [items["Date"], items["DelDate"], customerData[items["Customer"]].CustomerCode + " - " + customerData[items["Customer"]].Name, productData[items["Material"]].ProductCode + " - " + productData[items["Material"]].ProductName, items["Qty"], items["Weight"], items["Making"], items["Remarks"], items["Status"], items["Karigar"]];
											sheet.addRow().values = item;
											// console.log(customerData[items["Customer"]], items["Customer"])
										}

										//Coding for formula and concatenation in the last line
										var totText = Records["length"] + 4;
										var totCol = totText - 1;

										//Coding for rows and column border
										for (var j = 1; j <= totText; j++) {
											////
											if (sheet.getCell('B' + (j)).value == '') {
												sheet.getCell('B' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('B' + (j)).value < 0) {
												sheet.getCell('B' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('B' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}

											if (sheet.getCell('C' + (j)).value == '') {
												sheet.getCell('C' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};
												if (j > 3 && j <= (totText - 2)) {
													var valC = sheet.getCell('C' + (j)).value;
													sheet.getCell('C' + (j)).value = valC + '/-';
													sheet.getCell('C' + (j)).alignment = {
														vertical: 'bottom',
														horizontal: 'right'
													};
												}

											} else if (sheet.getCell('C' + (j)).value < 0) {
												sheet.getCell('C' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
												if (j > 3 && j <= (totText - 2)) {
													var valC = sheet.getCell('C' + (j)).value;
													sheet.getCell('C' + (j)).value = valC + '/-';
													sheet.getCell('C' + (j)).alignment = {
														vertical: 'bottom',
														horizontal: 'right'
													};
												}

											} else {
												sheet.getCell('C' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
												if (j > 3 && j <= (totText - 2)) {
													var valC = sheet.getCell('C' + (j)).value;
													sheet.getCell('C' + (j)).value = valC + '/-';
													sheet.getCell('C' + (j)).alignment = {
														vertical: 'bottom',
														horizontal: 'right'
													};
												}

											}

											if (sheet.getCell('D' + (j)).value == '') {
												sheet.getCell('D' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('D' + (j)).value < 0) {
												sheet.getCell('D' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('D' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}

											////
											sheet.getCell('A' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('B' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('C' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('D' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('E' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('F' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('G' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('H' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('I' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('J' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};

											// code added by surya for autocolumn width - started

											if (j > "2") {
												//setting absolute length for column A
												if (sheet.getCell('A' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthA = sheet.getCell('A' + (j)).value.length;
													} else {
														if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
															colMaxLengthA = sheet.getCell('A' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('A').width = colMaxLengthA + 2;
												}
												//setting absolute length for column B
												if (sheet.getCell('B' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthB = sheet.getCell('B' + (j)).value.length;
													} else {
														if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
															colMaxLengthB = sheet.getCell('B' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('B').width = colMaxLengthB + 2;
												}
												//setting absolute length for column C
												if (sheet.getCell('C' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthC = sheet.getCell('C' + (j)).value.length;
													} else {
														if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
															colMaxLengthC = sheet.getCell('C' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('C').width = colMaxLengthC + 2;
												}
												//setting absolute length for column D
												if (sheet.getCell('D' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthD = sheet.getCell('D' + (j)).value.length;
													} else {
														if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
															colMaxLengthD = sheet.getCell('D' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('D').width = colMaxLengthD + 2;
												}
												//setting absolute length for column E
												if (sheet.getCell('E' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthE = sheet.getCell('E' + (j)).value.length;
													} else {
														if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
															colMaxLengthE = sheet.getCell('E' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('E').width = colMaxLengthE + 2;
												}
												//setting absolute length for column F
												if (sheet.getCell('F' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthF = sheet.getCell('F' + (j)).value.length;
													} else {
														if (sheet.getCell('F' + (j)).value.length > colMaxLengthF) {
															colMaxLengthF = sheet.getCell('F' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('F').width = colMaxLengthF + 2;
												}
												//setting absolute length for column G
												if (sheet.getCell('G' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthG = sheet.getCell('G' + (j)).value.length;
													} else {
														if (sheet.getCell('G' + (j)).value.length > colMaxLengthG) {
															colMaxLengthG = sheet.getCell('G' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('G').width = colMaxLengthG + 2;
												}
												//setting absolute length for column H
												if (sheet.getCell('H' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthH = sheet.getCell('H' + (j)).value.length;
													} else {
														if (sheet.getCell('H' + (j)).value.length > colMaxLengthH) {
															colMaxLengthH = sheet.getCell('H' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('H').width = colMaxLengthH + 2;
												}
												//setting absolute length for column I
												if (sheet.getCell('I' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthI = sheet.getCell('I' + (j)).value.length;
													} else {
														if (sheet.getCell('I' + (j)).value.length > colMaxLengthI) {
															colMaxLengthI = sheet.getCell('I' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('I').width = colMaxLengthI + 2;
												}
												//setting absolute length for column J
												if (sheet.getCell('J' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
													} else {
														if (sheet.getCell('J' + (j)).value.length > colMaxLengthJ) {
															colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('J').width = colMaxLengthJ + 2;
												}
											}
											// code added by surya for autocolumn width - ended

										}

										const tempFileName = currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';

										//anurag
										res.setHeader(
											"Content-Type",
											"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
										);
										res.setHeader(
											"Content-Disposition",
											"attachment; filename=" + tempFileName
										);

										return workbook.xlsx.write(res).then(function(data) {
											console.log(data);
											res.status(200).end();
										});
									}, 10000);
								}
								// console.log(Records)
							}

						).catch(function(oError) {
							console.log(oError);
						});
				} catch (e) {

				} finally {

				}
			});
		})



		app.get('/GroupHide', function(req, res) {


			var responseData = [];
			var oSubCounter = {};
			var CustomerOrder = app.models.CustomerOrder;
			var Customer = app.models.Customer;
			var Entry = app.models.Entry;
			var Group = app.models.Group;
			var async = require('async');

			async.waterfall([
				function(callback) {
					//1. read all the pending orders
					CustomerOrder.find().then(function(pendingOrderRecords) {
						callback(null, pendingOrderRecords);
					});
				},
				function(pendingOrderRecords, callback) {
					//2. Each pending order has customer and karigar which is the ID
					//   Take these ids in an arry and find all the customer names and karigar names
					var allCust = [];
					// for (var i = 0; i < pendingOrderRecords.length; i++) {
					// 	allCust.push(pendingOrderRecords[i].Customer);
					// }
					// for (var i = 0; i < pendingOrderRecords.length; i++) {
					// 	allCust.push(pendingOrderRecords[i].Karigar);
					// }
					// //remove adjucent duplicates
					// allCust = allCust.filter(function(item, pos, self) {
					// 	return self.indexOf(item) == pos;
					// });

					Customer.find({
							where: {
								//3. this is how in loop back we read all items which are inside customer
								id: {
									inq: allCust
								}
							},
							fields: {
								"id": true,
								"Name": true,
								"Group": true,
								"CustomerCode": true
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
						allCities.push(allCustomers[i].Group);
					}
					//remove adjucent duplicates
					allCities = allCities.filter(function(item, pos, self) {
						return self.indexOf(item) == pos;
					});

					Group.find({
							where: {
								id: {
									inq: allCities
								}
							},
							fields: {
								"id": true,
								"groupCode": true,
								"groupName": true,
								"hide": true
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

					Entry.find({
							where: {
								id: {
									inq: allProds
								}
							},
							fields: {
								"id": true,
								"Customer": true,
								"Product": true,
								"City": true

							}
						})
						.then(function(ProductRecords, err) {
							callback(null, pendingOrderRecords, allCustomers, CityRecords, ProductRecords);
						});
				}
			])


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

			async.waterfall([
				function(callback) {
					//1. read all the pending orders
					CustomerOrder.find().then(function(pendingOrderRecords) {
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
								id: {
									inq: allCust
								}
							},
							fields: {
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
								id: {
									inq: allCities
								}
							},
							fields: {
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
								id: {
									inq: allProds
								}
							},
							fields: {
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

				try {
					//TODO: Now we have all the data of orders, their customers,
					//cities, and products with ids
					//prepare final collection and Add the excel code there

					var pOrders = [];

					for (var p = 0; p < pendingOrderRecords.length; p++) {
						var pOrder = {};

						//let lPOrders = JSON.parse(JSON.stringify(pendingOrderRecords[p].__data));
						var lPOrders = pendingOrderRecords[p].__data;


						var cov_date = new Date(lPOrders.Date);
						pOrder.Date = cov_date.getDate() + "." +
							(cov_date.getMonth() + 1) + "." +
							cov_date.getFullYear();

						var del_date = new Date(lPOrders.DelDate);
						pOrder.DelDate = del_date.getDate() + "." +
							(del_date.getMonth() + 1) + "." +
							del_date.getFullYear();

						// pOrder.Date = lPOrders.Date;
						// pOrder.DelDate = lPOrders.DelDate;
						pOrder.Qty = lPOrders.Qty;
						pOrder.Weight = lPOrders.Weight;
						pOrder.Making = lPOrders.Making;
						pOrder.Remarks = lPOrders.Remarks;
						//pOrder.Material = lPOrders.Material;
						for (var m = 0; m < ProductRecords.length; m++) {

							let lMaterial = JSON.parse(JSON.stringify(ProductRecords[m].__data));
							if (lPOrders.Material == lMaterial.id) {
								pOrder.Material = lMaterial.ProductName;
							}
						}
						for (var k = 0; k < allCustomers.length; k++) {

							let lKarigar = JSON.parse(JSON.stringify(allCustomers[k].__data));
							if (lPOrders.Karigar == lKarigar.id) {
								pOrder.Karigar = lKarigar.Name;
							}
							if (lPOrders.Karigar == "null") {
								pOrder.Karigar = lPOrders.Karigar;
							}
						}
						for (var c = 0; c < allCustomers.length; c++) {

							let lCustomer = JSON.parse(JSON.stringify(allCustomers[c].__data));
							if (lPOrders.Customer == lCustomer.id) {
								pOrder.Customer = lCustomer.Name;
							}
						}

						pOrders.push(Object.assign({}, pOrder));

					}

					var reportType = "Pending_Order_Summary";
					//var custId = req.body.id;
					//var name = req.body.name;

					var excel = require('exceljs');
					var workbook = new excel.Workbook(); //creating workbook
					var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

					//Heading for excel
					var heading = {
						heading: "Pending Order Report"
					};
					sheet.mergeCells('A1:I1');
					sheet.getCell('I1').value = 'Pending Order Report';
					sheet.getCell('A1').alignment = {
						vertical: 'middle',
						horizontal: 'center'
					};
					sheet.getCell('A1').fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: {
							argb: '808080'
						}
					};

					var currentdate = new Date();
					var datetime = currentdate.getDate() + "." +
						(currentdate.getMonth() + 1) + "." +
						currentdate.getFullYear() + " / " +
						currentdate.getHours() + ":" +
						currentdate.getMinutes() + ":" +
						currentdate.getSeconds();


					var header = ["Date", "Delivery Date", "Customer Name", "Item Name", "Qty", "Weight", "Making", "Remarks", "Karigar"];
					sheet.addRow().values = header;

					//Coding for cell color and bold character
					sheet.getCell('A2').fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: {
							argb: 'FFFF99'
						}
					};
					sheet.getCell('B2').fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: {
							argb: 'FFFF99'
						}
					};
					sheet.getCell('C2').fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: {
							argb: 'FFFF99'
						}
					};
					sheet.getCell('D2').fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: {
							argb: 'FFFF99'
						}
					};
					sheet.getCell('E2').fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: {
							argb: 'FFFF99'
						}
					};
					sheet.getCell('F2').fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: {
							argb: 'FFFF99'
						}
					};
					sheet.getCell('G2').fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: {
							argb: 'FFFF99'
						}
					};
					sheet.getCell('H2').fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: {
							argb: 'FFFF99'
						}
					};
					sheet.getCell('I2').fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: {
							argb: 'FFFF99'
						}
					};

					var totCash = 0;
					var totalE = 0;
					var totalF = 0;

					//Coding to remove unwanted items or Rows
					for (var i = 0; i < pOrders["length"]; i++) {
						var items = pOrders[i];
						var item = [items["Date"], items["DelDate"], items["Customer"], items["Material"], items["Qty"], items["Weight"], items[
							"Making"], items["Remarks"], items["Karigar"]];
						totalE = totalE + items["Qty"];
						totalF = totalF + items["Weight"];
						sheet.addRow().values = item;
					}

					//Coding for formula and concatenation in the last line
					var totText = pOrders["length"] + 3;
					var totCol = totText - 1;
					sheet.mergeCells('A' + totText + ': D' + totText);
					sheet.getCell('A' + totText).alignment = {
						vertical: 'middle',
						horizontal: 'center'
					};
					sheet.getCell('A' + totText).value = "TOTAL";

					sheet.getCell('E' + totText).value = totalE;
					sheet.getCell('F' + totText).value = totalF;

					sheet.getCell('A' + totText).fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: {
							argb: '339966'
						},
						bgColor: {
							argb: '339966'
						}
					};
					sheet.getCell('A' + totText).font = {
						color: {
							argb: '000000'
						}
					};

					sheet.getCell('E' + totText).font = {
						color: {
							argb: '000000'
						},
						bold: true
					};

					sheet.getCell('F' + totText).font = {
						color: {
							argb: '000000'
						},
						bold: true
					};

					//Coding for rows and column border
					var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE,
						colMaxLengthF, colMaxLengthG, colMaxLengthH, colMaxLengthI;
					for (var j = 1; j <= totText; j++) {

						sheet.getCell('A' + (j)).border = {
							top: {
								style: 'thin'
							},
							left: {
								style: 'thin'
							},
							bottom: {
								style: 'thin'
							},
							right: {
								style: 'thin'
							}
						};
						sheet.getCell('B' + (j)).border = {
							top: {
								style: 'thin'
							},
							left: {
								style: 'thin'
							},
							bottom: {
								style: 'thin'
							},
							right: {
								style: 'thin'
							}
						};
						sheet.getCell('C' + (j)).border = {
							top: {
								style: 'thin'
							},
							left: {
								style: 'thin'
							},
							bottom: {
								style: 'thin'
							},
							right: {
								style: 'thin'
							}
						};
						sheet.getCell('D' + (j)).border = {
							top: {
								style: 'thin'
							},
							left: {
								style: 'thin'
							},
							bottom: {
								style: 'thin'
							},
							right: {
								style: 'thin'
							}
						};
						sheet.getCell('E' + (j)).border = {
							top: {
								style: 'thin'
							},
							left: {
								style: 'thin'
							},
							bottom: {
								style: 'thin'
							},
							right: {
								style: 'thin'
							}
						};
						sheet.getCell('F' + (j)).border = {
							top: {
								style: 'thin'
							},
							left: {
								style: 'thin'
							},
							bottom: {
								style: 'thin'
							},
							right: {
								style: 'thin'
							}
						};
						sheet.getCell('G' + (j)).border = {
							top: {
								style: 'thin'
							},
							left: {
								style: 'thin'
							},
							bottom: {
								style: 'thin'
							},
							right: {
								style: 'thin'
							}
						};
						sheet.getCell('H' + (j)).border = {
							top: {
								style: 'thin'
							},
							left: {
								style: 'thin'
							},
							bottom: {
								style: 'thin'
							},
							right: {
								style: 'thin'
							}
						};
						sheet.getCell('I' + (j)).border = {
							top: {
								style: 'thin'
							},
							left: {
								style: 'thin'
							},
							bottom: {
								style: 'thin'
							},
							right: {
								style: 'thin'
							}
						};

						// code added by surya for autocolumn width - started
						//setting absolute length for column A
						if (j > "1") {
							if (sheet.getCell('A' + (j)).value !== null) {
								if (j == "2") {
									colMaxLengthA = sheet.getCell('A' + (j)).value.length;
								} else {
									if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
										colMaxLengthA = sheet.getCell('A' + (j)).value.length;
									}
								}
							}
							if (j == totText) {
								sheet.getColumn('A').width = colMaxLengthA + 2;
							}
							//setting absolute length for column B
							if (sheet.getCell('B' + (j)).value !== null) {
								if (j == "2") {
									colMaxLengthB = sheet.getCell('B' + (j)).value.length;
								} else {
									if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
										colMaxLengthB = sheet.getCell('B' + (j)).value.length;
									}
								}
							}
							if (j == totText) {
								sheet.getColumn('B').width = colMaxLengthB + 2;
							}
							//setting absolute length for column C
							if (sheet.getCell('C' + (j)).value !== null) {
								if (j == "2") {
									colMaxLengthC = sheet.getCell('C' + (j)).value.length;
								} else {
									if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
										colMaxLengthC = sheet.getCell('C' + (j)).value.length;
									}
								}
							}
							if (j == totText) {
								sheet.getColumn('C').width = colMaxLengthC + 2;
							}
							//setting absolute length for column D
							if (sheet.getCell('D' + (j)).value !== null) {
								if (j == "2") {
									colMaxLengthD = sheet.getCell('D' + (j)).value.length;
								} else {
									if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
										colMaxLengthD = sheet.getCell('D' + (j)).value.length;
									}
								}
							}
							if (j == totText) {
								sheet.getColumn('D').width = colMaxLengthD + 2;
							}
							//setting absolute length for column E
							if (sheet.getCell('E' + (j)).value !== null) {
								if (j == "2") {
									colMaxLengthE = sheet.getCell('E' + (j)).value.length;
								} else {
									if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
										colMaxLengthE = sheet.getCell('E' + (j)).value.length;
									}
								}
							}
							if (j == totText) {
								sheet.getColumn('E').width = colMaxLengthE + 2;
							}
							//setting absolute length for column F
							if (sheet.getCell('F' + (j)).value !== null) {
								if (j == "2") {
									colMaxLengthF = sheet.getCell('F' + (j)).value.length;
								} else {
									if (sheet.getCell('F' + (j)).value.length > colMaxLengthF) {
										colMaxLengthF = sheet.getCell('F' + (j)).value.length;
									}
								}
							}
							if (j == totText) {
								sheet.getColumn('F').width = colMaxLengthF + 2;
							}
							//setting absolute length for column G
							if (sheet.getCell('G' + (j)).value !== null) {
								if (j == "2") {
									colMaxLengthG = sheet.getCell('G' + (j)).value.length;
								} else {
									if (sheet.getCell('G' + (j)).value.length > colMaxLengthG) {
										colMaxLengthG = sheet.getCell('G' + (j)).value.length;
									}
								}
							}
							if (j == totText) {
								sheet.getColumn('G').width = colMaxLengthG + 2;
							}
							//setting absolute length for column H
							if (sheet.getCell('H' + (j)).value !== null) {
								if (j == "2") {
									colMaxLengthH = sheet.getCell('H' + (j)).value.length;
								} else {
									if (sheet.getCell('H' + (j)).value.length > colMaxLengthH) {
										colMaxLengthH = sheet.getCell('H' + (j)).value.length;
									}
								}
							}
							if (j == totText) {
								sheet.getColumn('H').width = colMaxLengthH + 2;
							}
							if (sheet.getCell('I' + (j)).value !== null) {
								if (j == "2") {
									colMaxLengthI = sheet.getCell('I' + (j)).value.length;
								} else {
									if (sheet.getCell('I' + (j)).value.length > colMaxLengthI) {
										colMaxLengthI = sheet.getCell('I' + (j)).value.length;
									}
								}
							}
						}
					}

					sheet.getCell('F' + totText).value = totalF + 'gm';

					sheet.getCell('E' + totText).alignment = {
						vertical: 'bottom',
						horizontal: 'right'
					};
					sheet.getCell('F' + totText).alignment = {
						vertical: 'bottom',
						horizontal: 'right'
					};


					//Coding to download in a folder
					var tempFilePath = 'C:\\dex\\' + reportType + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) +
						currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() +
						currentdate.getSeconds() + '.xlsx';
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
			});
		})
		app.get('/entryDownload', function(req, res) {
			debugger;

			var reportType = req.query.type;

			var custId = req.query.id;
			var name = req.query.name;
			var city = req.query.city;
			// custId = "6043ad0632a5213cb0ec551a";
			var Ggroup = "";
			//read customer name by id, group by group id, city by
			//read kacchi and print report with all coloring, formatting, totaling
			var responseData = [];
			var oSubCounter = {};
			var Customer = app.models.Customer;

			var async = require('async');;
			async.waterfall([
					function(callback) {
						Customer.findById(custId, {
							fields: {
								"CustomerCode": true,
								"Name": true,
								"Group": true,
								"City": true,
								"Interest": true
							}
						}).then(function(customerRecord, err) {
							callback(err, customerRecord);
						});
					}
				], function(err, customerRecord) {
					// result now equals 'done'
					//set all values to local variables which we need inside next promise
					// name = customerRecord.Name;
					// city = cityRecord.cityName;
					name = customerRecord.Name;
					try {
						//read the kacchi Records
						var Entry = app.models.Entry;

						Entry.find({
								order: ['Date ASC', 'ChangedOn DESC', 'CreatedOn DESC'],
								where: {
									"Customer": custId

								}
							})
							.then(function(Records, err) {
									if (Records) {
										var excel = require('exceljs');
										var workbook = new excel.Workbook(); //creating workbook
										var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
										// sheet.columns = [
										// 		{ width: 11 }
										// 	];
										//Heading for excel
										var heading = {
											heading: "Fast Report"
										};
										sheet.mergeCells('A1:F1');
										sheet.getCell('F1').value = 'Fast Report';
										sheet.getCell('A1').alignment = {
											vertical: 'center',
											horizontal: 'center'
										};

										sheet.getCell('A1').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '808080'
											}
										};

										//Merging second Row
										sheet.mergeCells('A2:F2');

										//Code for getting current datetime
										var currentdate = new Date();
										var num = Records.length;
										var datetime = currentdate.getDate() + "." +
											(currentdate.getMonth() + 1) + "." +
											currentdate.getFullYear() + " / " +
											currentdate.getHours() + ":" +
											currentdate.getMinutes() + ":" +
											currentdate.getSeconds();
										sheet.getCell('A2').value = 'Customer Name : ' + name + '(' + num + ')    ' + '\t' + '\n' + datetime;
										sheet.getCell('A2').alignment = {
											vertical: 'center',
											horizontal: 'center'
										};

										sheet.getRow(2).font === {
											bold: true
										};


										var header = ["", "Date", "Silver", "Cash", "Gold", "Remarks"];

										sheet.addRow().values = header;

										//Coding for cell color and bold character
										sheet.getCell('A3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('B3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('C3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('D3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('E3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('F3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};

										var totCash = 0;
										var totalB = 0;
										var totalC = 0;
										var totalD = 0;
										//code added by surya 10 nov - start

										// define function to change date format to dd.mm.yyyy using date Object
										function formatDateForEntry(date) {
											var d = new Date(date),
												month = '' + (d.getMonth() + 1),
												day = '' + d.getDate(),
												year = d.getFullYear();

											if (month.length < 2)
												month = '0' + month;
											if (day.length < 2)
												day = '0' + day;

											return [day, month, year].join('.');
										}
										var colMaxLengthA1, colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE;
										//code added by surya 10 nov - end
										//Coding to remove unwanted items or Rows
										for (var i = 0; i < Records["length"]; i++) {
											var items = Records[i].__data;
											items["Date"] = formatDateForEntry(items["Date"]);
											var item = [items[""], items["Date"], items["Silver"], items["Cash"], items["Gold"], items["Remarks"]];
											totalB = totalB + items["Silver"];
											totalC = totalC + items["Cash"];
											totalD = totalD + items["Gold"];
											sheet.addRow().values = item;
										}

										//Coding for formula and concatenation in the last line
										var totText = Records["length"] + 4;
										var totCol = totText - 1;
										totalB = totalB.toFixed(3);
										// totalC = Math.round(totalC);
										totalC = totalC.toFixed(2);
										totalD = totalD.toFixed(2);
										sheet.getCell('B' + totText).value = "TOTAL";

										sheet.getCell('C' + totText).value = totalB;
										sheet.getCell('D' + totText).value = totalC;
										sheet.getCell('E' + totText).value = totalD;

										sheet.getCell('A' + totText).fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'FFFFFF'
											},
											bgColor: {
												argb: 'FFFFFF'
											}
										};
										sheet.getCell('A' + totText).font = {
											color: {
												argb: 'FFFFFF'
											},
											bold: true
										};

										sheet.getCell('B' + totText).fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '00FFFF'
											},
											bgColor: {
												argb: '00FFFF'
											}
										};
										sheet.getCell('B' + totText).font = {
											color: {
												argb: '0000FF'
											},
											bold: true
										};



										//Coding for rows and column border
										for (var j = 1; j <= totText; j++) {
											////
											if (sheet.getCell('C' + (j)).value == '') {
												sheet.getCell('C' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('C' + (j)).value < 0) {
												sheet.getCell('C' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('C' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}

											if (sheet.getCell('D' + (j)).value == '') {
												sheet.getCell('D' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};
												if (j > 3 && j <= (totText - 2)) {
													var valC = sheet.getCell('D' + (j)).value;
													sheet.getCell('D' + (j)).value = valC + '/-';
													sheet.getCell('D' + (j)).alignment = {
														vertical: 'bottom',
														horizontal: 'right'
													};
												}

											} else if (sheet.getCell('D' + (j)).value < 0) {
												sheet.getCell('D' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
												if (j > 3 && j <= (totText - 2)) {
													var valC = sheet.getCell('D' + (j)).value;
													sheet.getCell('D' + (j)).value = valC + '/-';
													sheet.getCell('D' + (j)).alignment = {
														vertical: 'bottom',
														horizontal: 'right'
													};
												}

											} else {
												sheet.getCell('D' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
												if (j > 3 && j <= (totText - 2)) {
													var valC = sheet.getCell('D' + (j)).value;
													sheet.getCell('D' + (j)).value = valC + '/-';
													sheet.getCell('D' + (j)).alignment = {
														vertical: 'bottom',
														horizontal: 'right'
													};
												}

											}

											if (sheet.getCell('E' + (j)).value == '') {
												sheet.getCell('E' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('E' + (j)).value < 0) {
												sheet.getCell('E' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('E' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}

											// sheet.getCell('F').alignment = { wrapText: true };

											////
											sheet.getCell('A' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('B' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('C' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('D' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('E' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};

											sheet.getCell('F' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};

											// code added by surya for autocolumn width - started
											//setting absolute length for column A
											if (j > "2") {

												if (sheet.getCell('A' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthA1 = sheet.getCell('A' + (j)).value.length;
													} else {
														if (sheet.getCell('A' + (j)).value.length > colMaxLengthA1) {
															colMaxLengthA1 = sheet.getCell('A' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('A').width = colMaxLengthA1 + 21;
												}

												if (sheet.getCell('B' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthA = sheet.getCell('B' + (j)).value.length;
													} else {
														if (sheet.getCell('B' + (j)).value.length > colMaxLengthA) {
															colMaxLengthA = sheet.getCell('B' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('B').width = colMaxLengthA + 1;
												}
												//setting absolute length for column B
												if (sheet.getCell('C' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthB = sheet.getCell('C' + (j)).value.length;
													} else {
														if (sheet.getCell('C' + (j)).value.length > colMaxLengthB) {
															colMaxLengthB = sheet.getCell('C' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('C').width = colMaxLengthB + 3;
												}
												//setting absolute length for column C
												if (sheet.getCell('D' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthC = sheet.getCell('D' + (j)).value.length;
													} else {
														if (sheet.getCell('D' + (j)).value.length > colMaxLengthC) {
															colMaxLengthC = sheet.getCell('D' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('D').width = colMaxLengthC + 2;
												}
												//setting absolute length for column D
												if (sheet.getCell('E' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthD = sheet.getCell('E' + (j)).value.length;
													} else {
														if (sheet.getCell('E' + (j)).value.length > colMaxLengthD) {
															colMaxLengthD = sheet.getCell('E' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('E').width = colMaxLengthD + 3;
												}
												//setting absolute length for column E
												if (sheet.getCell('F' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthE = sheet.getCell('F' + (j)).value.length;
													} else {
														if (sheet.getCell('F' + (j)).value.length > colMaxLengthE) {
															colMaxLengthE = sheet.getCell('F' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('F').width = 17;
													sheet.getColumn('F').alignment = {
														vertical: 'middle',
														horizontal: 'center',
														wrapText: true
													};

												}
											}
											// code added by surya for autocolumn width - ended

										}

										if (totalB == 0) {
											sheet.getCell('C' + totText).value = totalB + '.00 gm';
										} else {
											sheet.getCell('C' + totText).value = totalB + 'gm';
										}

										if (totalD == 0) {
											sheet.getCell('E' + totText).value = totalD + '.00 gm';
										} else {
											sheet.getCell('E' + totText).value = totalD + 'gm';
										}

										sheet.getCell('C' + totText).alignment = {
											vertical: 'bottom',
											horizontal: 'right'
										};
										sheet.getCell('D' + totText).value = totalC + '/-';
										sheet.getCell('D' + totText).alignment = {
											vertical: 'bottom',
											horizontal: 'right'
										};
										sheet.getCell('E' + totText).alignment = {
											vertical: 'bottom',
											horizontal: 'right'
										};


										sheet.getCell('C' + totText).font = {
											color: {
												argb: '800000'
											}
										};
										sheet.getCell('E' + totText).font = {
											color: {
												argb: '800000'
											}
										};



										//Coding to download in a folder
										// var tempFilePath = 'C:\\dex\\' + reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) +
										// 	currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() +
										// 	currentdate.getSeconds() + '.xlsx';
										// console.log("tempFilePath : ", tempFilePath);
										// workbook.xlsx.writeFile(tempFilePath).then(function() {
										// 	res.sendFile(tempFilePath, function(err) {
										// 		if (err) {
										// 			console.log('---------- error downloading file: ', err);
										// 		}
										// 	});
										// 	console.log('file is written @ ' + tempFilePath);
										// });

										const tempFileName = reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										// workbook.xlsx
										//   .writeFile(tempFileName)
										//   .then(response => {
										//     console.log("file is written");
										//     console.log(path.join(__dirname, "../newSaveeee.xlsx"));
										//     res.sendFile(path.join(__dirname, "../" + tempFileName));
										//   })
										//   .catch(err => {
										//     console.log(err);
										//   });
										// const tempFileName = reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										// var tempfile = require('tempfile');
										// var tmp = tempfile(".xlsx");
										// workbook.xlsx.writeFile("D:/" + tempFileName).then(function() {
										//     console.log("xlsx file is written.");
										// 		res.status(200).type("application/vnd.ms-excel").end();
										// 		res.download(tmp, function(err){
										//         console.log('---------- error downloading file: ' + err);
										//     });
										// });
										// res is a Stream object
										//anurag
										res.setHeader(
											"Content-Type",
											"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
										);
										res.setHeader(
											"Content-Disposition",
											"attachment; filename=" + tempFileName
										);
										// console.log("came");
										return workbook.xlsx.write(res).then(function(data) {
											console.log(data);
											//res.writeHead(200, [['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
											//res.end(new Buffer(data, 'base64'));
											res.status(200).end();
										});
										// res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
										//
										// res.setHeader("Content-Disposition", "attachment; filename=Rep1ort.xlsx");
										//
										// workbook.xlsx.write(res).then(function () {
										//     res.status(200).end();
										// });
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

		app.get('/entryDownload1', function(req, res) {

			var reportType = req.query.type;

			var custId = req.query.id;
			var name = req.query.name;
			var city = req.query.city;
			// custId = "6043ad0632a5213cb0ec551a";
			var Ggroup = "";
			//read customer name by id, group by group id, city by
			//read kacchi and print report with all coloring, formatting, totaling
			var responseData = [];
			var oSubCounter = {};
			var Customer = app.models.Customer;

			var async = require('async');;
			async.waterfall([
					function(callback) {
						Customer.findById(custId, {
							fields: {
								"CustomerCode": true,
								"Name": true,
								"Group": true,
								"City": true,
								"Interest": true
							}
						}).then(function(customerRecord, err) {
							callback(err, customerRecord);
						});
					}
				], function(err, customerRecord) {
					// result now equals 'done'
					//set all values to local variables which we need inside next promise
					// name = customerRecord.Name;
					// city = cityRecord.cityName;
					name = customerRecord.Name;
					var CInterest = customerRecord.Interest;
					try {
						//read the kacchi Records
						var Entry = app.models.Entry;

						Entry.find({
								order: ['Date ASC', 'ChangedOn DESC', 'CreatedOn DESC'],
								where: {
									"Customer": custId

								}
							})
							.then(function(Records, err) {
									if (Records) {
										var excel = require('exceljs');
										var workbook = new excel.Workbook(); //creating workbook
										var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
										// sheet.columns = [
										// 		{ width: 11 }
										// 	];
										//Heading for excel
										var heading = {
											heading: "Fast Report"
										};
										sheet.mergeCells('A1:M1');
										sheet.getCell('M1').value = 'Fast Report';
										sheet.getCell('A1').alignment = {
											vertical: 'middle',
											horizontal: 'center'
										};

										sheet.getCell('A1').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '808080'
											}
										};

										//Merging second Row
										sheet.mergeCells('A2:M2');

										//Code for getting current datetime
										var currentdate = new Date();
										var num = Records.length;
										var datetime = currentdate.getDate() + "." +
											(currentdate.getMonth() + 1) + "." +
											currentdate.getFullYear() + " / " +
											currentdate.getHours() + ":" +
											currentdate.getMinutes() + ":" +
											currentdate.getSeconds();
										sheet.getCell('A2').value = 'Customer Name : ' + name + '(' + num + ')    ' + '\t' + '\n' + datetime;
										sheet.getCell('A2').alignment = {
											vertical: 'middle',
											horizontal: 'center'
										};

										sheet.getRow(2).font === {
											bold: true
										};

										sheet.mergeCells('A3:F3');

										//Code for getting current datetime
										// var currentdate = new Date();
										// var num = Records.length;
										// var datetime = currentdate.getDate() + "." +
										// 	(currentdate.getMonth() + 1) + "." +
										// 	currentdate.getFullYear() + " / " +
										// 	currentdate.getHours() + ":" +
										// 	currentdate.getMinutes() + ":" +
										// 	currentdate.getSeconds();
										sheet.getCell('A3').value = 'Credit';
										sheet.getCell('A3').alignment = {
											vertical: 'middle',
											horizontal: 'left'
										};

										sheet.getRow(3).font === {
											bold: true
										};

										sheet.mergeCells('H3:M3');

										//Code for getting current datetime
										// var currentdate = new Date();
										// var num = Records.length;
										// var datetime = currentdate.getDate() + "." +
										// 	(currentdate.getMonth() + 1) + "." +
										// 	currentdate.getFullYear() + " / " +
										// 	currentdate.getHours() + ":" +
										// 	currentdate.getMinutes() + ":" +
										// 	currentdate.getSeconds();
										sheet.getCell('H3').value = 'Debit';
										sheet.getCell('H3').alignment = {
											vertical: 'middle',
											horizontal: 'left'
										};

										sheet.getRow(3).font === {
											bold: true
										};

										var header = ["Date", "Silver", "Cash", "Gold", "Interest", "Remarks", " ", "Date", "Silver", "Cash", "Gold", "Interest", "Remarks"];

										sheet.addRow().values = header;

										//Coding for cell color and bold character
										sheet.getCell('A4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('B4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('C4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('D4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('E4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('F4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('G4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '000000'
											}
										};
										sheet.getCell('H4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('I4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('J4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('K4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('L4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('M4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};

										var totCash = 0;
										var totalB = 0;
										var totalC = 0;
										var totalD = 0;
										var totalE = 0;
										var totalI = 0;
										var totalJ = 0;
										var totalK = 0;
										var totalL = 0;
										//code added by surya 10 nov - start

										// define function to change date format to dd.mm.yyyy using date Object
										function formatDateForEntry(date) {
											var d = new Date(date),
												month = '' + (d.getMonth() + 1),
												day = '' + d.getDate(),
												year = d.getFullYear();

											if (month.length < 2)
												month = '0' + month;
											if (day.length < 2)
												day = '0' + day;

											return [day, month, year].join('.');
										}

										function getInterestAmount(Amount, date, interest) {

											if (interest === undefined) {
												interest = 0;
											}
											// var oCustomer = this.allMasterData.customers[customerId];
											// var interest  = oCustomer.Interest;
											var date2 = new Date();
											var date1 = date;
											var Difference_In_Time = date2.getTime() - date1.getTime();
											var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
											var days = parseInt(Difference_In_Days);

											var totalAmt = ((Amount * interest * days) / 3000);
											return totalAmt;

										}
										var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE;
										//code added by surya 10 nov - end
										//Coding to remove unwanted items or Rows
										var pEntry = [];
										var nEntry = [];
										for (var i = 0; i < Records["length"]; i++) {
											var items = Records[i].__data;
											// var interest=getInterestAmount(items["Cash"],items["Date"],items["Interest"]);
											// items["Date"] = formatDateForEntry(items["Date"]);
											// var item = [items["Date"], items["Silver"], items["Cash"], items["Gold"], items["Remarks"]];
											// totalB = totalB + items["Silver"];
											// totalC = totalC + items["Cash"];
											// totalD = totalD + items["Gold"];
											// sheet.addRow().values = item;
											if (items["Cash"] > 0) {
												pEntry.push(items);
												// sheet.getCell("A"+(i+5)).value=items["Date"];
												// sheet.getCell("B"+(i+5)).value=items["Silver"];
												// sheet.getCell("C"+(i+5)).value=items["Cash"];
												// sheet.getCell("D"+(i+5)).value=interest;
												// sheet.getCell("E"+(i+5)).value=items["Gold"];
												// sheet.getCell("F"+(i+5)).value=items["Remarks"];
											} else {
												nEntry.push(items);
												// sheet.getCell("H"+(i+5)).value=items["Date"];
												// sheet.getCell("I"+(i+5)).value=items["Silver"];
												// sheet.getCell("J"+(i+5)).value=items["Cash"];
												// sheet.getCell("K"+(i+5)).value=interest;
												// sheet.getCell("L"+(i+5)).value=items["Gold"];
												// sheet.getCell("M"+(i+5)).value=items["Remarks"];
											}
										}
										for (i = 0; i < pEntry.length; i++) {
											var items = pEntry[i];
											var interest = getInterestAmount(items["Cash"], items["Date"], CInterest);
											totalB = totalB + items["Silver"];
											totalC = totalC + items["Cash"];
											totalD = totalD + items["Gold"];
											totalE = totalE + interest;
											items["Date"] = formatDateForEntry(items["Date"]);
											sheet.getCell("A" + (i + 5)).value = items["Date"];
											sheet.getCell("B" + (i + 5)).value = items["Silver"];
											sheet.getCell("C" + (i + 5)).value = items["Cash"];
											sheet.getCell("D" + (i + 5)).value = items["Gold"];
											sheet.getCell("E" + (i + 5)).value = interest;
											sheet.getCell("F" + (i + 5)).value = items["Remarks"];
										}
										for (i = 0; i < nEntry.length; i++) {
											var items = nEntry[i];
											var interest = getInterestAmount(items["Cash"], items["Date"], CInterest);
											totalI = totalI + items["Silver"];
											totalJ = totalJ + items["Cash"];
											totalK = totalK + items["Gold"];
											totalL = totalL + interest;
											items["Date"] = formatDateForEntry(items["Date"]);
											sheet.getCell("H" + (i + 5)).value = items["Date"];
											sheet.getCell("I" + (i + 5)).value = items["Silver"];
											sheet.getCell("J" + (i + 5)).value = items["Cash"];
											sheet.getCell("K" + (i + 5)).value = items["Gold"];
											sheet.getCell("L" + (i + 5)).value = interest;
											sheet.getCell("M" + (i + 5)).value = items["Remarks"];
										}

										//Coding for formula and concatenation in the last line
										if (pEntry.length >= nEntry.length) {
											var totText = pEntry.length + 5;
										} else {
											var totText = nEntry.length + 5;
										}
										// var totText = Records["length"] + 5;
										var totCol = totText - 1;
										totalB = totalB.toFixed(3);
										totalC = totalC.toFixed(2);
										totalD = totalD.toFixed(2);
										totalE = totalE.toFixed(2);
										totalI = totalI.toFixed(3);
										totalJ = totalJ.toFixed(2);
										totalK = totalK.toFixed(2);
										totalL = totalL.toFixed(2);
										sheet.getCell('A' + totText).value = "TOTAL";

										sheet.getCell('B' + totText).value = totalB;
										sheet.getCell('C' + totText).value = totalC;
										sheet.getCell('D' + totText).value = totalD;
										sheet.getCell('E' + totText).value = totalE;
										sheet.getCell('H' + totText).value = "TOTAL";

										sheet.getCell('I' + totText).value = totalI;
										sheet.getCell('J' + totText).value = totalJ;
										sheet.getCell('K' + totText).value = totalK;
										sheet.getCell('L' + totText).value = totalL;

										sheet.getCell('A' + totText).fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '00FFFF'
											},
											bgColor: {
												argb: '00FFFF'
											}
										};
										sheet.getCell('A' + totText).font = {
											color: {
												argb: '0000FF'
											},
											bold: true
										};

										sheet.getCell('H' + totText).fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '00FFFF'
											},
											bgColor: {
												argb: '00FFFF'
											}
										};
										sheet.getCell('H' + totText).font = {
											color: {
												argb: '0000FF'
											},
											bold: true
										};

										//Coding for rows and column border
										for (var j = 1; j <= totText; j++) {
											////
											if (sheet.getCell('B' + (j)).value == '') {
												sheet.getCell('B' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('B' + (j)).value < 0) {
												sheet.getCell('B' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('B' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}

											if (j > 2) {
												sheet.getCell('G' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '000000'
													},
													fgColor: {
														argb: '000000'
													}
												};
											}

											if (sheet.getCell('C' + (j)).value == '') {
												sheet.getCell('C' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};
												// if (j > 3 && j <= (totText - 2)) {
												// 	var valC = sheet.getCell('C' + (j)).value;
												// 	sheet.getCell('C' + (j)).value = valC + '/-';
												// 	sheet.getCell('C' + (j)).alignment = {
												// 		vertical: 'bottom',
												// 		horizontal: 'right'
												// 	};
												// }

											} else if (sheet.getCell('C' + (j)).value < 0) {
												sheet.getCell('C' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
												// if (j > 3 && j <= (totText - 2)) {
												// 	var valC = sheet.getCell('C' + (j)).value;
												// 	sheet.getCell('C' + (j)).value = valC + '/-';
												// 	sheet.getCell('C' + (j)).alignment = {
												// 		vertical: 'bottom',
												// 		horizontal: 'right'
												// 	};
												// }

											} else {
												sheet.getCell('C' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
												// if (j > 3 && j <= (totText - 2)) {
												// 	var valC = sheet.getCell('C' + (j)).value;
												// 	sheet.getCell('C' + (j)).value = valC + '/-';
												// 	sheet.getCell('C' + (j)).alignment = {
												// 		vertical: 'bottom',
												// 		horizontal: 'right'
												// 	};
												// }

											}

											if (sheet.getCell('D' + (j)).value == '') {
												sheet.getCell('D' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('D' + (j)).value < 0) {
												sheet.getCell('D' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('D' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}

											if (sheet.getCell('E' + (j)).value == '') {
												sheet.getCell('E' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('E' + (j)).value < 0) {
												sheet.getCell('E' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('E' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}
											if (sheet.getCell('I' + (j)).value == '') {
												sheet.getCell('I' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('I' + (j)).value < 0) {
												sheet.getCell('I' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('I' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}
											if (sheet.getCell('J' + (j)).value == '') {
												sheet.getCell('J' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('J' + (j)).value < 0) {
												sheet.getCell('J' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('J' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}
											if (sheet.getCell('K' + (j)).value == '') {
												sheet.getCell('K' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('K' + (j)).value < 0) {
												sheet.getCell('K' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('K' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}
											if (sheet.getCell('L' + (j)).value == '') {
												sheet.getCell('L' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('L' + (j)).value < 0) {
												sheet.getCell('L' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('L' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}


											////
											sheet.getCell('A' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('B' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('C' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('D' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('E' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('F' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('G' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('H' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('I' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('J' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('K' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('L' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('M' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};

											// code added by surya for autocolumn width - started
											//setting absolute length for column A
											if (j > "2") {
												if (sheet.getCell('A' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthA = sheet.getCell('A' + (j)).value.length;
													} else {
														if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
															colMaxLengthA = sheet.getCell('A' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('A').width = colMaxLengthA + 2;
													sheet.getColumn('H').width = colMaxLengthA + 2;
												}
												//setting absolute length for column B
												if (sheet.getCell('B' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthB = sheet.getCell('B' + (j)).value.length;
													} else {
														if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
															colMaxLengthB = sheet.getCell('B' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('B').width = colMaxLengthB + 2;
												}
												//setting absolute length for column C
												if (sheet.getCell('C' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthC = sheet.getCell('C' + (j)).value.length;
													} else {
														if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
															colMaxLengthC = sheet.getCell('C' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('C').width = colMaxLengthC + 2;
												}
												//setting absolute length for column D
												if (sheet.getCell('D' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthD = sheet.getCell('D' + (j)).value.length;
													} else {
														if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
															colMaxLengthD = sheet.getCell('D' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('D').width = colMaxLengthD + 3;
												}
												//setting absolute length for column E
												if (sheet.getCell('E' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthE = sheet.getCell('E' + (j)).value.length;
													} else {
														if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
															colMaxLengthE = sheet.getCell('E' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('E').width = colMaxLengthE + 2;
												}
											}
											// code added by surya for autocolumn width - ended

										}

										// if (totalB == 0) {
										// 	sheet.getCell('B' + totText).value = totalB + 'gm';
										// } else {
										// 	sheet.getCell('B' + totText).value = totalB + 'gm';
										// }

										// if (totalD == 0) {
										// 	sheet.getCell('D' + totText).value = totalD + 'gm';
										// } else {
										// 	sheet.getCell('D' + totText).value = totalD + 'gm';
										// }

										// sheet.getCell('B' + totText).alignment = {
										// 	vertical: 'bottom',
										// 	horizontal: 'right'
										// };
										// sheet.getCell('C' + totText).value = totalC + '/-';
										// sheet.getCell('C' + totText).alignment = {
										// 	vertical: 'bottom',
										// 	horizontal: 'right'
										// };
										// sheet.getCell('D' + totText).alignment = {
										// 	vertical: 'bottom',
										// 	horizontal: 'right'
										// };

										// sheet.getCell('B' + totText).font = {
										// 	color: {
										// 		argb: '800000'
										// 	}
										// };
										// sheet.getCell('D' + totText).font = {
										// 	color: {
										// 		argb: '800000'
										// 	}
										// };
										sheet.getColumn('G').width = 1;

										//Coding to download in a folder
										// var tempFilePath = 'C:\\dex\\' + reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) +
										// 	currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() +
										// 	currentdate.getSeconds() + '.xlsx';
										// console.log("tempFilePath : ", tempFilePath);
										// workbook.xlsx.writeFile(tempFilePath).then(function() {
										// 	res.sendFile(tempFilePath, function(err) {
										// 		if (err) {
										// 			console.log('---------- error downloading file: ', err);
										// 		}
										// 	});
										// 	console.log('file is written @ ' + tempFilePath);
										// });

										const tempFileName = reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										// workbook.xlsx
										//   .writeFile(tempFileName)
										//   .then(response => {
										//     console.log("file is written");
										//     console.log(path.join(__dirname, "../newSaveeee.xlsx"));
										//     res.sendFile(path.join(__dirname, "../" + tempFileName));
										//   })
										//   .catch(err => {
										//     console.log(err);
										//   });
										// const tempFileName = reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										// var tempfile = require('tempfile');
										// var tmp = tempfile(".xlsx");
										// workbook.xlsx.writeFile("D:/" + tempFileName).then(function() {
										//     console.log("xlsx file is written.");
										// 		res.status(200).type("application/vnd.ms-excel").end();
										// 		res.download(tmp, function(err){
										//         console.log('---------- error downloading file: ' + err);
										//     });
										// });
										// res is a Stream object
										//anurag
										res.setHeader(
											"Content-Type",
											"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
										);
										res.setHeader(
											"Content-Disposition",
											"attachment; filename=" + tempFileName
										);
										// console.log("came");
										return workbook.xlsx.write(res).then(function(data) {
											console.log(data);
											//res.writeHead(200, [['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
											//res.end(new Buffer(data, 'base64'));
											res.status(200).end();
										});
										// res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
										//
										// res.setHeader("Content-Disposition", "attachment; filename=Rep1ort.xlsx");
										//
										// workbook.xlsx.write(res).then(function () {
										//     res.status(200).end();
										// });
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


		app.get('/entryDownload2', function(req, res) {

			var reportType = req.query.type;

			var custId = req.query.id;
			var name = req.query.name;
			var city = req.query.city;
			// custId = "6043ad0632a5213cb0ec551a";
			var Ggroup = "";
			//read customer name by id, group by group id, city by
			//read kacchi and print report with all coloring, formatting, totaling
			var responseData = [];
			var oSubCounter = {};
			var Customer = app.models.Customer;

			var async = require('async');;
			async.waterfall([
					function(callback) {
						Customer.findById(custId, {
							fields: {
								"CustomerCode": true,
								"Name": true,
								"Group": true,
								"City": true,
								"Interest": true
							}
						}).then(function(customerRecord, err) {
							callback(err, customerRecord);
						});
					}
				], function(err, customerRecord) {
					// result now equals 'done'
					//set all values to local variables which we need inside next promise
					// name = customerRecord.Name;
					// city = cityRecord.cityName;
					name = customerRecord.Name;
					var CInterest = customerRecord.Interest;
					try {
						//read the kacchi Records
						var Entry = app.models.Entry;

						Entry.find({
								order: ['Date ASC', 'ChangedOn DESC', 'CreatedOn DESC'],
								where: {
									"Customer": custId

								}
							})
							.then(function(Records, err) {
									if (Records) {
										var excel = require('exceljs');
										var workbook = new excel.Workbook(); //creating workbook
										var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
										// sheet.columns = [
										// 		{ width: 11 }
										// 	];
										//Heading for excel
										var heading = {
											heading: "Fast Report"
										};
										sheet.mergeCells('A1:I1');
										sheet.getCell('I1').value = 'Fast Report';
										sheet.getCell('A1').alignment = {
											vertical: 'middle',
											horizontal: 'center'
										};

										sheet.getCell('A1').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '808080'
											}
										};

										//Merging second Row
										sheet.mergeCells('A2:I2');

										//Code for getting current datetime
										var currentdate = new Date();
										var num = Records.length;
										var datetime = currentdate.getDate() + "." +
											(currentdate.getMonth() + 1) + "." +
											currentdate.getFullYear() + " / " +
											currentdate.getHours() + ":" +
											currentdate.getMinutes() + ":" +
											currentdate.getSeconds();
										sheet.getCell('A2').value = 'Customer Name : ' + name + '(' + num + ')    ' + '\t' + '\n' + datetime;
										sheet.getCell('A2').alignment = {
											vertical: 'middle',
											horizontal: 'center'
										};

										sheet.getRow(2).font === {
											bold: true
										};
										var pEntry = [];
										var nEntry = [];
										for (var i = 0; i < Records["length"]; i++) {
											var items = Records[i].__data;

											if (items["Cash"] > 0) {
												pEntry.push(items);

											} else {
												nEntry.push(items);

											}
										}

										sheet.mergeCells('A3:D3');
										sheet.getCell('A3').value = 'जमा - ' + pEntry.length;
										sheet.getCell('A3').alignment = {
											vertical: 'middle',
											horizontal: 'left'
										};

										sheet.getRow(3).font === {
											bold: true
										};

										sheet.mergeCells('F3:I3');

										//Code for getting current datetime
										// var currentdate = new Date();
										// var num = Records.length;
										// var datetime = currentdate.getDate() + "." +
										// 	(currentdate.getMonth() + 1) + "." +
										// 	currentdate.getFullYear() + " / " +
										// 	currentdate.getHours() + ":" +
										// 	currentdate.getMinutes() + ":" +
										// 	currentdate.getSeconds();
										sheet.getCell('F3').value = 'नाम - ' + nEntry.length;
										sheet.getCell('F3').alignment = {
											vertical: 'middle',
											horizontal: 'left'
										};

										sheet.getRow(3).font === {
											bold: true
										};

										var header = ["तारीख", "दिन", "रुपया", "ब्याज", " ", "तारीख", "दिन", "रुपया", "ब्याज"];

										sheet.addRow().values = header;

										//Coding for cell color and bold character
										sheet.getCell('A4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('B4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('C4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('D4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('E4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('F4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('G4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('H4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('I4').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										// sheet.getCell('J4').fill = {
										// 	type: 'pattern',
										// 	pattern: 'solid',
										// 	fgColor: {
										// 		argb: 'A9A9A9'
										// 	}
										// };
										// sheet.getCell('K4').fill = {
										// 	type: 'pattern',
										// 	pattern: 'solid',
										// 	fgColor: {
										// 		argb: 'A9A9A9'
										// 	}
										// };
										// sheet.getCell('L4').fill = {
										// 	type: 'pattern',
										// 	pattern: 'solid',
										// 	fgColor: {
										// 		argb: 'A9A9A9'
										// 	}
										// };
										// sheet.getCell('M4').fill = {
										// 	type: 'pattern',
										// 	pattern: 'solid',
										// 	fgColor: {
										// 		argb: 'A9A9A9'
										// 	}
										// };

										var totCash = 0;
										// var totalB = 0;
										// var totalC = 0;
										var totalC = 0;
										var totalD = 0;
										// var totalI = 0;
										// var totalJ = 0;
										var totalH = 0;
										var totalI = 0;
										//code added by surya 10 nov - start

										// define function to change date format to dd.mm.yyyy using date Object
										function formatDateForEntry(date) {
											var d = new Date(date),
												month = '' + (d.getMonth() + 1),
												day = '' + d.getDate(),
												year = d.getFullYear();

											if (month.length < 2)
												month = '0' + month;
											if (day.length < 2)
												day = '0' + day;

											return [day, month, year].join('.');
										}

										function getInterestAmount(Amount, date, interest) {

											if (interest === undefined) {
												interest = 0;
											}
											// var oCustomer = this.allMasterData.customers[customerId];
											// var interest  = oCustomer.Interest;
											var date2 = new Date();
											var date1 = date;
											var Difference_In_Time = date2.getTime() - date1.getTime();
											var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
											var days = parseInt(Difference_In_Days);

											var totalAmt = ((Amount * interest * days) / 3000);
											return [totalAmt, days];

										}
										var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE;

										//Coding to remove unwanted items or Rows

										for (i = 0; i < pEntry.length; i++) {
											var items = pEntry[i];
											var interest = getInterestAmount(items["Cash"], items["Date"], CInterest);
											// totalB = totalB + items["Silver"];
											totalC = totalC + items["Cash"];
											// totalD = totalD + items["Gold"];
											totalD = totalD + interest[0];
											items["Date"] = formatDateForEntry(items["Date"]);
											sheet.getCell("A" + (i + 5)).value = items["Date"];
											sheet.getCell("B" + (i + 5)).value = interest[1];
											sheet.getCell("C" + (i + 5)).value = items["Cash"];
											// sheet.getCell("D"+(i+5)).value=items["Gold"];
											sheet.getCell("D" + (i + 5)).value = interest[0];
											// sheet.getCell("F"+(i+5)).value=items["Remarks"];
										}
										for (i = 0; i < nEntry.length; i++) {
											var items = nEntry[i];
											var interest = getInterestAmount(items["Cash"], items["Date"], CInterest);
											// totalI = totalI + items["Silver"];
											totalH = totalH + items["Cash"];
											// totalK = totalK + items["Gold"];
											totalI = totalI + interest[0];
											items["Date"] = formatDateForEntry(items["Date"]);
											sheet.getCell("F" + (i + 5)).value = items["Date"];
											sheet.getCell("G" + (i + 5)).value = interest[1];
											sheet.getCell("H" + (i + 5)).value = items["Cash"];
											// sheet.getCell("K"+(i+5)).value=items["Gold"];
											sheet.getCell("I" + (i + 5)).value = interest[0];
											// sheet.getCell("M"+(i+5)).value=items["Remarks"];
										}

										//Coding for formula and concatenation in the last line
										if (pEntry.length >= nEntry.length) {
											var totText = pEntry.length + 5;
										} else {
											var totText = nEntry.length + 5;
										}
										// var totText = Records["length"] + 5;
										var totCol = totText - 1;
										// totalB = totalB.toFixed(3);
										// totalC = totalC.toFixed(2);
										totalD = totalD.toFixed(2);
										totalC = totalC.toFixed(2);
										// totalI = totalI.toFixed(3);
										totalH = totalH.toFixed(2);
										totalI = totalI.toFixed(2);
										// totalL=totalL.toFixed(2);
										sheet.getCell('A' + totText).value = "कुल जमा ";

										// sheet.getCell('B' + totText).value = totalB;
										sheet.getCell('C' + totText).value = totalC;
										sheet.getCell('D' + totText).value = totalD;
										// sheet.getCell('E' + totText).value = totalE;
										sheet.getCell('F' + totText).value = "कुल हिसाब ";

										// sheet.getCell('I' + totText).value = totalI;
										// sheet.getCell('J' + totText).value = totalJ;
										sheet.getCell('H' + totText).value = totalH;
										sheet.getCell('I' + totText).value = totalI;

										// sheet.getCell('A' + totText).fill = {
										// 	type: 'pattern',
										// 	pattern: 'solid',
										// 	fgColor: {
										// 		argb: '00FFFF'
										// 	},
										// 	bgColor: {
										// 		argb: '00FFFF'
										// 	}
										// };
										// sheet.getCell('A' + totText).font = {
										// 	color: {
										// 		argb: '0000FF'
										// 	},
										// 	bold: true
										// };

										// sheet.getCell('F' + totText).fill = {
										// 	type: 'pattern',
										// 	pattern: 'solid',
										// 	fgColor: {
										// 		argb: '00FFFF'
										// 	},
										// 	bgColor: {
										// 		argb: '00FFFF'
										// 	}
										// };
										// sheet.getCell('F' + totText).font = {
										// 	color: {
										// 		argb: '0000FF'
										// 	},
										// 	bold: true
										// };

										//Coding for rows and column border
										for (var j = 1; j <= totText; j++) {
											////
											// if (sheet.getCell('B' + (j)).value == '') {
											// 	sheet.getCell('B' + (j)).fill = {
											// 		type: 'pattern',
											// 		pattern: 'solid',
											// 		bgColor: {
											// 			argb: '00FFFF'
											// 		},
											// 		fgColor: {
											// 			argb: '00FFFF'
											// 		}
											// 	};

											// } else if (sheet.getCell('B' + (j)).value < 0) {
											// 	sheet.getCell('B' + (j)).font = {
											// 		color: {
											// 			argb: 'FF0000'
											// 		},
											// 		bold: true
											// 	};
											// } else {
											// 	sheet.getCell('B' + (j)).font = {
											// 		color: {
											// 			argb: '000000'
											// 		},
											// 		bold: true
											// 	};
											// }
											sheet.getRow(j).font = {
												bold: true,
												size: 14
											};

											if (j > 2) {
												sheet.getCell('E' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '000000'
													},
													fgColor: {
														argb: '000000'
													}
												};
											}

											if (sheet.getCell('C' + (j)).value == '') {
												sheet.getCell('C' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};


											} else if (sheet.getCell('C' + (j)).value < 0) {
												sheet.getCell('C' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};

											} else {
												sheet.getCell('C' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};


											}

											if (sheet.getCell('D' + (j)).value == '') {
												sheet.getCell('D' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('D' + (j)).value < 0) {
												sheet.getCell('D' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('D' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}

											// if (sheet.getCell('E' + (j)).value == '') {
											// 	sheet.getCell('E' + (j)).fill = {
											// 		type: 'pattern',
											// 		pattern: 'solid',
											// 		bgColor: {
											// 			argb: '00FFFF'
											// 		},
											// 		fgColor: {
											// 			argb: '00FFFF'
											// 		}
											// 	};

											// } else if (sheet.getCell('E' + (j)).value < 0) {
											// 	sheet.getCell('E' + (j)).font = {
											// 		color: {
											// 			argb: 'FF0000'
											// 		},
											// 		bold: true
											// 	};
											// } else {
											// 	sheet.getCell('E' + (j)).font = {
											// 		color: {
											// 			argb: '000000'
											// 		},
											// 		bold: true
											// 	};
											// }
											if (sheet.getCell('I' + (j)).value == '') {
												sheet.getCell('I' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('I' + (j)).value < 0) {
												sheet.getCell('I' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('I' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}
											if (sheet.getCell('H' + (j)).value == '') {
												sheet.getCell('H' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('H' + (j)).value < 0) {
												sheet.getCell('H' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('H' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}



											////
											sheet.getCell('A' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('B' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('C' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('D' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('E' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('F' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('G' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('H' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('I' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											// sheet.getCell('J' + (j)).border = {
											// 	top: {
											// 		style: 'thin'
											// 	},
											// 	left: {
											// 		style: 'thin'
											// 	},
											// 	bottom: {
											// 		style: 'thin'
											// 	},
											// 	right: {
											// 		style: 'thin'
											// 	}
											// };
											// sheet.getCell('K' + (j)).border = {
											// 	top: {
											// 		style: 'thin'
											// 	},
											// 	left: {
											// 		style: 'thin'
											// 	},
											// 	bottom: {
											// 		style: 'thin'
											// 	},
											// 	right: {
											// 		style: 'thin'
											// 	}
											// };
											// sheet.getCell('L' + (j)).border = {
											// 	top: {
											// 		style: 'thin'
											// 	},
											// 	left: {
											// 		style: 'thin'
											// 	},
											// 	bottom: {
											// 		style: 'thin'
											// 	},
											// 	right: {
											// 		style: 'thin'
											// 	}
											// };
											// sheet.getCell('M' + (j)).border = {
											// 	top: {
											// 		style: 'thin'
											// 	},
											// 	left: {
											// 		style: 'thin'
											// 	},
											// 	bottom: {
											// 		style: 'thin'
											// 	},
											// 	right: {
											// 		style: 'thin'
											// 	}
											// };

											// code added by surya for autocolumn width - started
											//setting absolute length for column A
											if (j > "2") {
												if (sheet.getCell('A' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthA = sheet.getCell('A' + (j)).value.length;
													} else {
														if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
															colMaxLengthA = sheet.getCell('A' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('A').width = colMaxLengthA + 2;
													sheet.getColumn('F').width = colMaxLengthA + 2;
												}
												//setting absolute length for column B
												if (sheet.getCell('B' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthB = sheet.getCell('B' + (j)).value.length;
													} else {
														if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
															colMaxLengthB = sheet.getCell('B' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('B').width = colMaxLengthB + 2;
												}
												//setting absolute length for column C
												if (sheet.getCell('C' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthC = sheet.getCell('C' + (j)).value.length;
													} else {
														if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
															colMaxLengthC = sheet.getCell('C' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('C').width = colMaxLengthC + 2;
												}
												//setting absolute length for column D
												if (sheet.getCell('D' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthD = sheet.getCell('D' + (j)).value.length;
													} else {
														if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
															colMaxLengthD = sheet.getCell('D' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('D').width = colMaxLengthD + 3;
												}
												//setting absolute length for column E
												if (sheet.getCell('E' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthE = sheet.getCell('E' + (j)).value.length;
													} else {
														if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
															colMaxLengthE = sheet.getCell('E' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('E').width = colMaxLengthE + 2;
												}
											}
											// code added by surya for autocolumn width - ended

										}

										// if (totalB == 0) {
										// 	sheet.getCell('B' + totText).value = totalB + 'gm';
										// } else {
										// 	sheet.getCell('B' + totText).value = totalB + 'gm';
										// }

										// if (totalD == 0) {
										// 	sheet.getCell('D' + totText).value = totalD + 'gm';
										// } else {
										// 	sheet.getCell('D' + totText).value = totalD + 'gm';
										// }

										// sheet.getCell('B' + totText).alignment = {
										// 	vertical: 'bottom',
										// 	horizontal: 'right'
										// };
										// sheet.getCell('C' + totText).value = totalC + '/-';
										// sheet.getCell('C' + totText).alignment = {
										// 	vertical: 'bottom',
										// 	horizontal: 'right'
										// };
										// sheet.getCell('D' + totText).alignment = {
										// 	vertical: 'bottom',
										// 	horizontal: 'right'
										// };

										// sheet.getCell('B' + totText).font = {
										// 	color: {
										// 		argb: '800000'
										// 	}
										// };
										// sheet.getCell('D' + totText).font = {
										// 	color: {
										// 		argb: '800000'
										// 	}
										// };
										sheet.getColumn('E').width = 1;
										sheet.mergeCells('A' + (totText + 2) + ':D' + (totText + 2));
										sheet.mergeCells('A' + (totText + 3) + ':B' + (totText + 3));
										sheet.mergeCells('C' + (totText + 3) + ':D' + (totText + 3));
										sheet.getCell('A' + (totText + 2)).border = {
											top: {
												style: 'thin'
											},
											left: {
												style: 'thin'
											},
											bottom: {
												style: 'thin'
											},
											right: {
												style: 'thin'
											}
										};
										sheet.getCell('A' + (totText + 3)).border = {
											top: {
												style: 'thin'
											},
											left: {
												style: 'thin'
											},
											bottom: {
												style: 'thin'
											},
											right: {
												style: 'thin'
											}
										};
										sheet.getCell('C' + (totText + 3)).border = {
											top: {
												style: 'thin'
											},
											left: {
												style: 'thin'
											},
											bottom: {
												style: 'thin'
											},
											right: {
												style: 'thin'
											}
										};
										var ctotal = (parseFloat(totalC) + parseFloat(totalD)) + (parseFloat(totalH) + parseFloat(totalI));
										sheet.getCell("A" + (totText + 2)).value = "कुल हिसाब";
										sheet.getCell("A" + (totText + 3)).value = "कुल रुपए";
										sheet.getCell("C" + (totText + 3)).value = ctotal;
										sheet.getRow((totText + 2)).font = {
											bold: true,
											size: 14
										};
										sheet.getRow((totText + 3)).font = {
											bold: true,
											size: 14
										};
										if (sheet.getCell('C' + ((totText + 3))).value == '') {
											sheet.getCell('C' + ((totText + 3))).fill = {
												type: 'pattern',
												pattern: 'solid',
												bgColor: {
													argb: '00FFFF'
												},
												fgColor: {
													argb: '00FFFF'
												}
											};


										} else if (sheet.getCell('C' + ((totText + 3))).value < 0) {
											sheet.getCell('C' + ((totText + 3))).font = {
												color: {
													argb: 'FF0000'
												},
												bold: true
											};

										} else {
											sheet.getCell('C' + ((totText + 3))).font = {
												color: {
													argb: '000000'
												},
												bold: true
											};


										}
										// sheet.getCell('A' + (totText+3)).fill = {
										// type: 'pattern',
										// pattern: 'solid',
										// fgColor: {
										// 	argb: '00FFFF'
										// },
										// bgColor: {
										// 	argb: '00FFFF'
										// }
										// };
										// sheet.getCell('A' + (totText+3)).font = {
										// 	color: {
										// 		argb: '0000FF'
										// 	},
										// 	bold: true
										// };
										// sheet.getCell('A' + (totText+2)).fill = {
										// type: 'pattern',
										// pattern: 'solid',
										// fgColor: {
										// 	argb: '00FFFF'
										// },
										// bgColor: {
										// 	argb: '00FFFF'
										// }
										// };
										// sheet.getCell('A' + (totText+2)).font = {
										// 	color: {
										// 		argb: '0000FF'
										// 	},
										// 	bold: true
										// };

										//Coding to download in a folder
										// var tempFilePath = 'C:\\dex\\' + reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) +
										// 	currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() +
										// 	currentdate.getSeconds() + '.xlsx';
										// console.log("tempFilePath : ", tempFilePath);
										// workbook.xlsx.writeFile(tempFilePath).then(function() {
										// 	res.sendFile(tempFilePath, function(err) {
										// 		if (err) {
										// 			console.log('---------- error downloading file: ', err);
										// 		}
										// 	});
										// 	console.log('file is written @ ' + tempFilePath);
										// });

										const tempFileName = reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										// workbook.xlsx
										//   .writeFile(tempFileName)
										//   .then(response => {
										//     console.log("file is written");
										//     console.log(path.join(__dirname, "../newSaveeee.xlsx"));
										//     res.sendFile(path.join(__dirname, "../" + tempFileName));
										//   })
										//   .catch(err => {
										//     console.log(err);
										//   });
										// const tempFileName = reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										// var tempfile = require('tempfile');
										// var tmp = tempfile(".xlsx");
										// workbook.xlsx.writeFile("D:/" + tempFileName).then(function() {
										//     console.log("xlsx file is written.");
										// 		res.status(200).type("application/vnd.ms-excel").end();
										// 		res.download(tmp, function(err){
										//         console.log('---------- error downloading file: ' + err);
										//     });
										// });
										// res is a Stream object
										//anurag
										res.setHeader(
											"Content-Type",
											"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
										);
										res.setHeader(
											"Content-Disposition",
											"attachment; filename=" + tempFileName
										);
										// console.log("came");
										return workbook.xlsx.write(res).then(function(data) {
											console.log(data);
											//res.writeHead(200, [['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
											//res.end(new Buffer(data, 'base64'));
											res.status(200).end();
										});
										// res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
										//
										// res.setHeader("Content-Disposition", "attachment; filename=Rep1ort.xlsx");
										//
										// workbook.xlsx.write(res).then(function () {
										//     res.status(200).end();
										// });
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

		app.get('/entryDownloadBetween', function(req, res) {

			var reportType = req.query.type;
			var custId = req.query.id;
			var name = req.query.name;
			var city = req.query.city;
			var min = req.query.min;
			var max = req.query.max;

			// custId = "6043ad0632a5213cb0ec551a";
			var Ggroup = "";
			//read customer name by id, group by group id, city by
			//read kacchi and print report with all coloring, formatting, totaling
			var responseData = [];
			var oSubCounter = {};
			var Customer = app.models.Customer;

			var async = require('async');;
			async.waterfall([
					function(callback) {
						Customer.findById(custId, {
							fields: {
								"CustomerCode": true,
								"Name": true,
								"Group": true,
								"City": true
							}
						}).then(function(customerRecord, err) {
							callback(err, customerRecord);
						});
					}
				], function(err, customerRecord) {
					// result now equals 'done'
					//set all values to local variables which we need inside next promise
					name = customerRecord.Name;
					try {
						//read the kacchi Records
						var Entry = app.models.Entry;
						Entry.find({
								order: ['Date ASC', 'ChangedOn DESC', 'CreatedOn DESC'],
								where: {
									"Customer": custId,
									"Date": {
										between: [new Date(min), new Date(max)]
									}
								}
							})
							.then(function(Records, err) {
									if (Records) {
										var excel = require('exceljs');
										var workbook = new excel.Workbook(); //creating workbook
										var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

										//Heading for excel
										var heading = {
											heading: "Fast Report"
										};
										sheet.mergeCells('A1:E1');
										sheet.getCell('E1').value = 'Fast Report';
										sheet.getCell('A1').alignment = {
											vertical: 'middle',
											horizontal: 'center'
										};
										sheet.getCell('A1').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '808080'
											}
										};

										//Merging second Row
										sheet.mergeCells('A2:E2');

										//Code for getting current datetime
										var currentdate = new Date();
										var num = Records.length;
										var datetime = currentdate.getDate() + "." +
											(currentdate.getMonth() + 1) + "." +
											currentdate.getFullYear() + " / " +
											currentdate.getHours() + ":" +
											currentdate.getMinutes() + ":" +
											currentdate.getSeconds();
										sheet.getCell('A2').value = 'Customer Name : ' + name + '(' + num + ')    ' + '\t' + '\n' + datetime;
										sheet.getCell('A2').alignment = {
											vertical: 'middle',
											horizontal: 'center'
										};
										sheet.getRow(2).font === {
											bold: true
										};

										var header = ["Date", "Silver", "Cash", "Gold", "Remarks"];

										sheet.addRow().values = header;

										//Coding for cell color and bold character
										sheet.getCell('A3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('B3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('C3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('D3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('E3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};

										var totCash = 0;
										var totalB = 0;
										var totalC = 0;
										var totalD = 0;
										//code added by surya 10 nov - start

										// define function to change date format to dd.mm.yyyy using date Object
										function formatDateForEntry(date) {
											var d = new Date(date),
												month = '' + (d.getMonth() + 1),
												day = '' + d.getDate(),
												year = d.getFullYear();

											if (month.length < 2)
												month = '0' + month;
											if (day.length < 2)
												day = '0' + day;

											return [day, month, year].join('.');
										}
										var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE;
										//code added by surya 10 nov - end
										//Coding to remove unwanted items or Rows
										for (var i = 0; i < Records["length"]; i++) {
											var items = Records[i].__data;
											items["Date"] = formatDateForEntry(items["Date"]);
											var item = [items["Date"], items["Silver"], items["Cash"], items["Gold"], items["Remarks"]];
											totalB = totalB + items["Silver"];
											totalC = totalC + items["Cash"];
											totalD = totalD + items["Gold"];
											sheet.addRow().values = item;
										}

										//Coding for formula and concatenation in the last line
										var totText = Records["length"] + 4;
										var totCol = totText - 1;
										totalB = totalB.toFixed(3);
										totalC = Math.round(totalC);
										totalD = totalD.toFixed(2);
										sheet.getCell('A' + totText).value = "TOTAL";

										sheet.getCell('B' + totText).value = totalB;
										sheet.getCell('C' + totText).value = totalC;
										sheet.getCell('D' + totText).value = totalD;

										sheet.getCell('A' + totText).fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '00FFFF'
											},
											bgColor: {
												argb: '00FFFF'
											}
										};
										sheet.getCell('A' + totText).font = {
											color: {
												argb: '0000FF'
											},
											bold: true
										};

										//Coding for rows and column border
										for (var j = 1; j <= totText; j++) {
											////
											if (sheet.getCell('B' + (j)).value == '') {
												sheet.getCell('B' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('B' + (j)).value < 0) {
												sheet.getCell('B' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('B' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}

											if (sheet.getCell('C' + (j)).value == '') {
												sheet.getCell('C' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};
												if (j > 3 && j <= (totText - 2)) {
													var valC = sheet.getCell('C' + (j)).value;
													sheet.getCell('C' + (j)).value = valC + '/-';
													sheet.getCell('C' + (j)).alignment = {
														vertical: 'bottom',
														horizontal: 'right'
													};
												}

											} else if (sheet.getCell('C' + (j)).value < 0) {
												sheet.getCell('C' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
												if (j > 3 && j <= (totText - 2)) {
													var valC = sheet.getCell('C' + (j)).value;
													sheet.getCell('C' + (j)).value = valC + '/-';
													sheet.getCell('C' + (j)).alignment = {
														vertical: 'bottom',
														horizontal: 'right'
													};
												}

											} else {
												sheet.getCell('C' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
												if (j > 3 && j <= (totText - 2)) {
													var valC = sheet.getCell('C' + (j)).value;
													sheet.getCell('C' + (j)).value = valC + '/-';
													sheet.getCell('C' + (j)).alignment = {
														vertical: 'bottom',
														horizontal: 'right'
													};
												}

											}

											if (sheet.getCell('D' + (j)).value == '') {
												sheet.getCell('D' + (j)).fill = {
													type: 'pattern',
													pattern: 'solid',
													bgColor: {
														argb: '00FFFF'
													},
													fgColor: {
														argb: '00FFFF'
													}
												};

											} else if (sheet.getCell('D' + (j)).value < 0) {
												sheet.getCell('D' + (j)).font = {
													color: {
														argb: 'FF0000'
													},
													bold: true
												};
											} else {
												sheet.getCell('D' + (j)).font = {
													color: {
														argb: '000000'
													},
													bold: true
												};
											}

											////
											sheet.getCell('A' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('B' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('C' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('D' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('E' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};

											// code added by surya for autocolumn width - started
											//setting absolute length for column A
											if (j > "2") {
												if (sheet.getCell('A' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthA = sheet.getCell('A' + (j)).value.length;
													} else {
														if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
															colMaxLengthA = sheet.getCell('A' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('A').width = colMaxLengthA + 2;
												}
												//setting absolute length for column B
												if (sheet.getCell('B' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthB = sheet.getCell('B' + (j)).value.length;
													} else {
														if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
															colMaxLengthB = sheet.getCell('B' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('B').width = colMaxLengthB + 2;
												}
												//setting absolute length for column C
												if (sheet.getCell('C' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthC = sheet.getCell('C' + (j)).value.length;
													} else {
														if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
															colMaxLengthC = sheet.getCell('C' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('C').width = colMaxLengthC + 2;
												}
												//setting absolute length for column D
												if (sheet.getCell('D' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthD = sheet.getCell('D' + (j)).value.length;
													} else {
														if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
															colMaxLengthD = sheet.getCell('D' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('D').width = colMaxLengthD + 2;
												}
												//setting absolute length for column E
												if (sheet.getCell('E' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthE = sheet.getCell('E' + (j)).value.length;
													} else {
														if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
															colMaxLengthE = sheet.getCell('E' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('E').width = colMaxLengthE + 2;
												}
											}
											// code added by surya for autocolumn width - ended

										}

										if (totalB == 0) {
											sheet.getCell('B' + totText).value = totalB + '.00 gm';
										} else {
											sheet.getCell('B' + totText).value = totalB + 'gm';
										}

										if (totalD == 0) {
											sheet.getCell('D' + totText).value = totalD + '.00 gm';
										} else {
											sheet.getCell('D' + totText).value = totalD + 'gm';
										}

										sheet.getCell('B' + totText).alignment = {
											vertical: 'bottom',
											horizontal: 'right'
										};
										sheet.getCell('C' + totText).value = totalC + '/-';
										sheet.getCell('C' + totText).alignment = {
											vertical: 'bottom',
											horizontal: 'right'
										};
										sheet.getCell('D' + totText).alignment = {
											vertical: 'bottom',
											horizontal: 'right'
										};

										sheet.getCell('B' + totText).font = {
											color: {
												argb: '800000'
											}
										};
										sheet.getCell('D' + totText).font = {
											color: {
												argb: '800000'
											}
										};

										//Coding to download in a folder
										// var tempFilePath = 'C:\\dex\\' + reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) +
										// 	currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() +
										// 	currentdate.getSeconds() + '.xlsx';
										// console.log("tempFilePath : ", tempFilePath);
										// workbook.xlsx.writeFile(tempFilePath).then(function() {
										// 	res.sendFile(tempFilePath, function(err) {
										// 		if (err) {
										// 			console.log('---------- error downloading file: ', err);
										// 		}
										// 	});
										// 	console.log('file is written @ ' + tempFilePath);
										// });

										const tempFileName = reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										// workbook.xlsx
										//   .writeFile(tempFileName)
										//   .then(response => {
										//     console.log("file is written");
										//     console.log(path.join(__dirname, "../newSaveeee.xlsx"));
										//     res.sendFile(path.join(__dirname, "../" + tempFileName));
										//   })
										//   .catch(err => {
										//     console.log(err);
										//   });
										// const tempFileName = reportType + '_' + name + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										// var tempfile = require('tempfile');
										// var tmp = tempfile(".xlsx");
										// workbook.xlsx.writeFile("D:/" + tempFileName).then(function() {
										//     console.log("xlsx file is written.");
										// 		res.status(200).type("application/vnd.ms-excel").end();
										// 		res.download(tmp, function(err){
										//         console.log('---------- error downloading file: ' + err);
										//     });
										// });
										// res is a Stream object
										//anurag
										res.setHeader(
											"Content-Type",
											"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
										);
										res.setHeader(
											"Content-Disposition",
											"attachment; filename=" + tempFileName
										);
										// console.log("came");
										return workbook.xlsx.write(res).then(function(data) {
											console.log(data);
											//res.writeHead(200, [['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
											//res.end(new Buffer(data, 'base64'));
											res.status(200).end();
										});
										// res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
										//
										// res.setHeader("Content-Disposition", "attachment; filename=Rep1ort.xlsx");
										//
										// workbook.xlsx.write(res).then(function () {
										//     res.status(200).end();
										// });
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
		// code added by Yogendra
		var async = require('async');
		app.get('/ItemsReport', async function(req, res) {
			// var Products = app.models.Product;
			var StockItem = app.models.StockItem;
			var collection = StockItem.getDataSource().connector.collection(StockItem.modelName);

			//Anubhav code Start
			var productIds = new Set();
			var items = [];
			var items2 = [];

			var d = new Date(req.query.date);
			d.setUTCHours(0, 0, 0, 0, 0);
			//TODAY'S TOTAL STOCK PER PRODUCT AGGREGATE SUM OF QUANTITY
			await collection.aggregate([{
				$match: {
					Date: {
						$gte: d
					}
				}
			}, {
				$group: {
					_id: '$Material',
					total: {
						$sum: "$Qty"
					}
				}
			}], function(err, data) {
				if (err) return callback(err);
				data.on('data', function(data) {
					items[data._id.toString()] = data.total;
					productIds.add(data._id.toString());
				});

				data.on('end', function() {
					// console.log(JSON.stringify(items));
					var aItemsToday = items;
					//TILL TODAY TOTAL STOCK PER PRODUCT AGGREGATE SUM OF QUANTITY
					collection.aggregate([{
						$group: {
							_id: '$Material',
							total: {
								$sum: "$Qty"
							}
						}
					}], function(err, data) {
						if (err) return callback(err);
						var items = [];
						data.on('data', function(data) {
							items2[data._id.toString()] = data.total;
							productIds.add(data._id.toString());
						});
						data.on('end', function() {
							// console.log(JSON.stringify(items2));
							// console.log(JSON.stringify(aItemsToday));
							// console.log(productIds);
							//
							app.models.Product.find({
								where: {
									id: {
										inq: Array.from(productIds)
									}
								}
							}).then(function(products, err) {
								// combining data product,stockItems
								var itemsReportCollection22 = [];
								itemsReportCollection22.push(["Item Code", "Name", "Stock Till Yday", "Today (+-)", "Balance"]);
								var itemsReportCollection20 = [];
								itemsReportCollection20.push(["Item Code", "Name", "Stock Till Yday", "Today (+-)", "Balance"]);
								var itemsReportCollection = [];
								itemsReportCollection.push(["Item Code", "Name", "Stock Till Yday", "Today (+-)", "Balance"]);
								for (item of products) {
									var qty1 = items2[item.id.toString()] ? items2[item.id.toString()] : 0;
									var qty2 = aItemsToday[item.id.toString()] ? aItemsToday[item.id.toString()] : 0;
									if (item.Karat === "22/22") {
										itemsReportCollection22.push([
											item.ProductCode,
											item.HindiName,
											qty1,
											qty2,
											qty1 + qty2
										]);
									} else if (item.Karat === "22/20") {
										itemsReportCollection20.push([
											item.ProductCode,
											item.HindiName,
											qty1,
											qty2,
											qty1 + qty2
										]);
									} else {
										itemsReportCollection.push([
											item.ProductCode,
											item.HindiName,
											qty1,
											qty2,
											qty1 + qty2
										]);
									}
								}
								// console.log(itemsReportCollection);
								const options = {
									'!cols': [{
										wch: 12
									}, {
										wch: 22
									}]
								};
								var buffer = xlsx.build([{
									name: "22-20",
									data: itemsReportCollection20
								}, {
									name: "22-22",
									data: itemsReportCollection22
								}, {
									name: "##-##",
									data: itemsReportCollection
								}], options);
								return res.status(200).type("application/vnd.ms-excel").send(buffer);
							});
							//items - total for today items2 - total till today
							//to do - call products by merging item and item 2
							//to do - prepare excel response
							//to do - substract the total
							//to do - send to frontend
						});
					});
				});
			});
		});

		app.get('/justGroups', async function(req, res) {
			// var Products = app.models.Product;
			var Entry = app.models.Entry;
			var collection = Entry.getDataSource().connector.collection(Entry.modelName);

			//Anubhav code Start
			var productIds = new Set();
			var items = [];
			var items2 = [];

			var d = new Date(req.query.date);
			d.setUTCHours(0, 0, 0, 0, 0);
			//TODAY'S TOTAL STOCK PER PRODUCT AGGREGATE SUM OF QUANTITY
			await collection.aggregate([{
				$group: {
					_id: '$Customer',
					Cash: {
						$sum: "$Cash"
					},
					Gold: {
						$sum: "$Gold"
					},
					Silver: {
						$sum: "$Silver"
					},
					Date: {
						$max: "$Date"
					}
				}
			}], function(err, data) {
				if (err) return callback(err);
				data.on('data', function(data) {
					console.log(data);
					items[data._id] = data;
					productIds.add(data._id.toString());
				});

				data.on('end', function() {
					// console.log(JSON.stringify(items));
					var aItemsToday = items;
					//TILL TODAY TOTAL STOCK PER PRODUCT AGGREGATE SUM OF QUANTITY
					app.models.Customer.find({
						where: {
							id: {
								inq: Array.from(productIds)
							}
						}
					}).then(function(allCustomers, err) {
						// combining data product,stockItems
						//console.log(JSON.stringify(aItemsToday));
						var itemsReportCollection = [];
						itemsReportCollection.push(["Code", "Name", "Amount", "Silver", "Gold", "Last Entry Date"]);
						for (item of allCustomers) {
							var customerTotal = aItemsToday[item.id.toString()];
							customerTotal.Code = item.CustomerCode;
							customerTotal.Name = item.Name;
							itemsReportCollection.push([item.CustomerCode,
								item.Name,
								customerTotal.Cash,
								customerTotal.Silver,
								customerTotal.Gold,
								customerTotal.Date
							]);
						}
						var buffer = xlsx.build([{
							name: "GroupName",
							data: itemsReportCollection
						}]);
						return res.status(200).type("application/vnd.ms-excel").send(buffer);
						//console.log(JSON.stringify(products));
					});
				});
			});
		});

		app.get('/StockReport', function(req, res) {

			var d = new Date(req.query.date);
			d.setUTCHours(0, 0, 0, 0, 0);
			var stockItemsSet = new Set();
			var productsMap = new Map();
			app.models.StockItem.find({
				where: {
					Date: d
				}
				// where: {
				// 	Date: {
				// 		lt: new Date()
				// 	}
				// }
			}).then(function(stockItems, err) {
				// calculating  quantity
				for (item of stockItems) {
					stockItemsSet.add(item.Material.toString());
				}
				//
				app.models.Product.find({
					where: {
						id: {
							inq: Array.from(stockItemsSet)
						}
					}
				}).then(function(products, err) {
					// combining data product,stockItems
					for (item of products) {
						// var qty = stockItemsMap.get(item.id.toString()).Quantity;
						productsMap.set(item.id.toString(), {
							// Quantity: qty,
							Code: item.ProductCode,
							HindiName: item.HindiName,
							Karat: item.Karat
						})
					}
					// collection of json obj total quantity item wise,
					// var stockItemReport = Array.from(stockItemsMap.values());
					//
					// collecion for whole stock table report
					var stockReportCollection = [
						["Date", "Item Code", "Name", "Order No", "Quantity", "CreatedBy", "CreatedOn"]
					];
					var stockReportCollection22 = [
						["Date", "Item Code", "Name", "Order No", "Quantity", "CreatedBy", "CreatedOn"]
					];
					var stockReportCollection20 = [
						["Date", "Item Code", "Name", "Order No", "Quantity", "CreatedBy", "CreatedOn"]
					];
					for (item of stockItems) {
						var date = (item.Date.getDate() < 9 ? "0" + item.Date.getDate() : item.Date.getDate()) + "." + (item.Date.getMonth() + 1) +
							"." + item.Date.getFullYear();
						var createdOn = (item.CreatedOn.getDate() < 9 ? "0" + item.CreatedOn.getDate() : item.CreatedOn.getDate()) + "." + (item.CreatedOn
							.getMonth() + 1) + "." + item.CreatedOn.getFullYear();
						if (productsMap.get(item.Material.toString()).Karat === "22/22") {
							stockReportCollection22.push([
								date,
								productsMap.get(item.Material.toString()).Code,
								productsMap.get(item.Material.toString()).HindiName,
								item.OrderNo,
								item.Qty,
								item.CreatedBy,
								createdOn
							]);
						} else if (productsMap.get(item.Material.toString()).Karat === "22/20") {
							stockReportCollection20.push([
								date,
								productsMap.get(item.Material.toString()).Code,
								productsMap.get(item.Material.toString()).HindiName,
								item.OrderNo,
								item.Qty,
								item.CreatedBy,
								createdOn
							]);
						} else {
							stockReportCollection.push([
								date,
								productsMap.get(item.Material.toString()).Code,
								productsMap.get(item.Material.toString()).HindiName,
								item.OrderNo,
								item.Qty,
								item.CreatedBy,
								createdOn
							]);
						}
					}
					const options = {
						'!cols': [{
							wch: 12
						}, {
							wch: 12
						}, {
							wch: 22
						}, {
							wch: 22
						}, {
							wch: 22
						}, {
							wch: 22
						}, {
							wch: 12
						}]
					};
					var buffer = xlsx.build([{
						name: "22-22",
						data: stockReportCollection22
					}, {
						name: "22-20",
						data: stockReportCollection20
					}, {
						name: "##-##",
						data: stockReportCollection
					}], options);
					return res.status(200).type("application/vnd.ms-excel").send(buffer);
				});
			});
		});
		app.get('/DailyReport', function(req, res) {
			var dDateStart = new Date(req.query.date);
			dDateStart.setHours(0, 0, 0, 1);
			var dDateEnd = new Date(dDateStart);
			dDateEnd.setHours(23, 59, 59, 59);
			var stockItemsSet = new Set();
			var usersMap = new Map();
			var productsMap = new Map();
			var dateObj = new Date();
			console.log(dDateStart);
			console.log(dDateEnd);
			app.models.StockItem.find({
				where: {
					Date: {
						between: [dDateStart, dDateEnd]
					}
				}
			}).then(function(stockItems, err) {
				// calculating  quantity
				console.log("Stock items " + JSON.stringify(stockItems));
				for (item of stockItems) {
					stockItemsSet.add(item.Material.toString());
					usersMap.set(item.CreatedBy.toString(), "");
				}
				app.models.AppUser.find({
					// where: {
					// 	TechnicalId: {
					// 		inq: Array.from(usersMap.keys())
					// 	}
					// },
					fields: {
						TechnicalId: true,
						UserName: true
					}
				}).then(function(appusers, err) {
					for (user of appusers) {
						usersMap.set(user.TechnicalId.toString(), user.UserName);
					}
					app.models.Product.find({
						where: {
							id: {
								inq: Array.from(stockItemsSet)
							}
						},
						fields: {
							id: true,
							ProductCode: true,
							HindiName: true,
							Karat: true
						}
					}).then(function(products, err) {
						// combining data product,stockItems
						console.log("Products " + JSON.stringify(products));
						for (item of products) {
							// var qty = stockItemsMap.get(item.id.toString()).Quantity;
							productsMap.set(item.id.toString(), {
								// Quantity: qty,
								Code: item.ProductCode,
								HindiName: item.HindiName,
								Karat: item.Karat
							})
						}
						// collection of json obj total quantity item wise,
						// var stockItemReport = Array.from(stockItemsMap.values());
						//
						// collecion for whole stock table report
						var stockReportCollection = [
							["Date", "Item Code", "Name", "Order No", "Quantity", "CreatedBy", "CreatedOn"]
						];
						var stockReportCollection20 = [
							["Date", "Item Code", "Name", "Order No", "Quantity", "CreatedBy", "CreatedOn"]
						];
						var stockReportCollection22 = [
							["Date", "Item Code", "Name", "Order No", "Quantity", "CreatedBy", "CreatedOn"]
						];
						for (item of stockItems) {
							var date = (item.Date.getDate() < 9 ? "0" + item.Date.getDate() : item.Date.getDate()) + "." + (item.Date.getMonth() + 1) + "." + item.Date.getFullYear();
							var createdOn = (item.CreatedOn.getDate() < 9 ? "0" + item.CreatedOn.getDate() : item.CreatedOn.getDate()) + "." + (item.CreatedOn.getMonth() + 1) + "." + item.CreatedOn.getFullYear();
							if (productsMap.get(item.Material.toString()).Karat === "22/22") {
								stockReportCollection22.push([
									date,
									productsMap.get(item.Material.toString()).Code,
									productsMap.get(item.Material.toString()).HindiName,
									item.OrderNo,
									item.Qty,
									usersMap.get(item.CreatedBy.toString()),
									createdOn
								]);
							} else if (productsMap.get(item.Material.toString()).Karat === "22/20") {
								stockReportCollection20.push([
									date,
									productsMap.get(item.Material.toString()).Code,
									productsMap.get(item.Material.toString()).HindiName,
									item.OrderNo,
									item.Qty,
									usersMap.get(item.CreatedBy.toString()),
									createdOn
								]);
							} else {
								stockReportCollection.push([
									date,
									productsMap.get(item.Material.toString()).Code,
									productsMap.get(item.Material.toString()).HindiName,
									item.OrderNo,
									item.Qty,
									usersMap.get(item.CreatedBy.toString()),
									createdOn
								]);
							}
						}
						const options = {
							'!cols': [{
								wch: 12
							}, {
								wch: 12
							}, {
								wch: 22
							}, {
								wch: 22
							}, {
								wch: 22
							}, {
								wch: 22
							}, {
								wch: 12
							}]
						};
						var buffer = xlsx.build([{
							name: "22-22",
							data: stockReportCollection22
						}, {
							name: "22-20",
							data: stockReportCollection20
						}, {
							name: "##-##",
							data: stockReportCollection
						}], options);
						return res.status(200).type("application/vnd.ms-excel").send(buffer);
					});
				});
				//
			});
		});
		///// code added by Surya - start
		app.get('/custCodeDownload', function(req, res) {

			var reportType = req.query.type;

			var responseData = [];

			var async = require('async');
			var Customer = app.models.Customer;
			async.waterfall([
					function(callback) {
						//Find all Customers
						Customer.find({})
							.then(function(customerRecord, err) {
								// call second function of the waterfall
								callback(err, customerRecord);
							});
					},
					function(customerRecord, callback) {
						//Loop customer data and put all the city and Group codes in different arrays

						var arrCities = [];
						var arrGroups = [];
						// nishan

						for (var i = 0; i < customerRecord["length"]; i++) {
							// try {
							if (customerRecord[i].City !== undefined) {
								if (!(arrCities.includes(customerRecord[i].City.toString()))) {
									arrCities.push(customerRecord[i].City.toString());
								}
							}
							if (customerRecord[i].Group !== undefined) {
								if (!(arrGroups.includes(customerRecord[i].Group.toString()))) {
									arrGroups.push(customerRecord[i].Group.toString());
								}
							}

							// if(typeof(customerRecord[0].Group)!=="object"){
							//
							// }
							// 							catch(err) {
							//   // Block of code to handle errors
							//
							// }
						}
						//Fetch city data on the basis of city codes array
						var City = app.models.City;
						City.find({
							where: {
								id: {
									inq: arrCities
								}
							},
							fields: {
								"id": true,
								"cityCode": true,
								"cityName": true
							}
						}).then(function(cityRecord, err) {
							callback(err, customerRecord, cityRecord, arrGroups);
						});
					}
				], function(err, customerRecord, cityRecord, arrGroups) {
					//get grouprecord

					try {
						//Fetch Groups data on the basis of group codes array
						var Group = app.models.Group;
						Group.find({
							where: {
								id: {
									inq: arrGroups
								}
							},
							fields: {
								"id": true,
								"groupCode": true,
								"groupName": true
							}
						}).then(function(groupRecord, err) {
							var custFinals = [];

							for (var i = 0; i < customerRecord.length; i++) {
								var custFinal = {};
								//Get fields from customer table
								custFinal.MobilePhone = customerRecord[i].MobilePhone;
								custFinal.Address = customerRecord[i].Address;
								custFinal.CustomerCode = customerRecord[i].CustomerCode;
								custFinal.Name = customerRecord[i].Name;
								custFinal.SecondaryPhone = customerRecord[i].SecondaryPhone;
								custFinal.Type = customerRecord[i].Type;
								custFinal.Interest = customerRecord[i].Interest;
								//loop through city records to get city name
								for (var m = 0; m < cityRecord.length; m++) {
									if (customerRecord[i].City !== undefined) {
										if (customerRecord[i].City.toString() == cityRecord[m].id.toString()) {
											custFinal.City = cityRecord[m].cityName.toString();
											break;
										}
									}
								}

								//loop through Group records to get group name
								for (var k = 0; k < groupRecord.length; k++) {
									if (customerRecord[i].Group !== undefined) {
										if (customerRecord[i].Group.toString() == groupRecord[k].id.toString()) {
											custFinal.Group = groupRecord[k].groupName.toString();
											break;
										}
									}
								}
								//Now push prepared record object to the array of Final Customer
								custFinals.push(custFinal);
							}

							if (custFinals) {
								// complete excel processing and downloading
								var excel = require('exceljs');
								var workbook = new excel.Workbook(); //creating workbook
								var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

								//Heading for excel

								sheet.mergeCells('A1:H1');
								sheet.getCell('H1').value = 'Customer Code Report';
								sheet.getCell('A1').alignment = {
									vertical: 'middle',
									horizontal: 'center'
								};
								sheet.getCell('A1').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: '808080'
									}
								};

								//Merging second Row
								sheet.mergeCells('A2:I2');

								//Code for getting current datetime
								var currentdate = new Date();
								var datetime = currentdate.getDate() + "." + (currentdate.getMonth() + 1) + "." + currentdate.getFullYear() + " / " +
									currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
								sheet.getCell('G2').value = datetime;
								sheet.getRow(2).font === {
									bold: true
								};

								// Header creation
								var header = ["City", "MobilePhone", "Address", "CustomerCode", "Name", "SecondaryPhone", "Group", "Type", "Interest %"];
								sheet.addRow().values = header;

								//Coding for cell color and bold character
								sheet.getCell('A2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('B2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('C2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('D2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('E2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('F2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('G2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('H2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('I2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};

								// Looping through the records
								for (var l = 0; l < custFinals["length"]; l++) {
									var items = custFinals[l];
									var item = [items.City, items.MobilePhone, items.Address, items.CustomerCode, items.Name, items.SecondaryPhone, items.Group,
										items.Type, items.Interest
									];
									sheet.addRow().values = item;
								}

								var totText = custFinals["length"] + 3;

								//Coding for rows and column border
								var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE,
									colMaxLengthF, colMaxLengthG, colMaxLengthH, colMaxLengthI;
								for (var j = 1; j <= totText; j++) {
									sheet.getCell('A' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('B' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('C' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('D' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('E' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('F' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('G' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('H' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('I' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};

									// code added by surya for autocolumn width - started
									//setting absolute length for column A
									if (j > "2") {
										if (sheet.getCell('A' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthA = sheet.getCell('A' + (j)).value.length;
											} else {
												if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
													colMaxLengthA = sheet.getCell('A' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('A').width = colMaxLengthA + 2;
										}
										//setting absolute length for column B
										if (sheet.getCell('B' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthB = sheet.getCell('B' + (j)).value.length;
											} else {
												if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
													colMaxLengthB = sheet.getCell('B' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('B').width = colMaxLengthB + 2;
										}
										//setting absolute length for column C
										if (sheet.getCell('C' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthC = sheet.getCell('C' + (j)).value.length;
											} else {
												if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
													colMaxLengthC = sheet.getCell('C' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('C').width = colMaxLengthC + 2;
										}
										//setting absolute length for column D
										if (sheet.getCell('D' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthD = sheet.getCell('D' + (j)).value.length;
											} else {
												if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
													colMaxLengthD = sheet.getCell('D' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('D').width = colMaxLengthD + 2;
										}
										//setting absolute length for column E
										if (sheet.getCell('E' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthE = sheet.getCell('E' + (j)).value.length;
											} else {
												if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
													colMaxLengthE = sheet.getCell('E' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('E').width = colMaxLengthE + 2;
										}
										//setting absolute length for column F
										if (sheet.getCell('F' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthF = sheet.getCell('F' + (j)).value.length;
											} else {
												if (sheet.getCell('F' + (j)).value.length > colMaxLengthF) {
													colMaxLengthF = sheet.getCell('F' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('F').width = colMaxLengthG + 2;
										}
										//setting absolute length for column G
										if (sheet.getCell('G' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthG = sheet.getCell('G' + (j)).value.length;
											} else {
												if (sheet.getCell('G' + (j)).value.length > colMaxLengthG) {
													colMaxLengthG = sheet.getCell('G' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('G').width = colMaxLengthG + 2;
										}
										//setting absolute length for column H
										if (sheet.getCell('H' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthH = sheet.getCell('H' + (j)).value.length;
											} else {
												if (sheet.getCell('H' + (j)).value.length > colMaxLengthH) {
													colMaxLengthH = sheet.getCell('H' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('H').width = colMaxLengthH + 2;
										}

										if (sheet.getCell('I' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthI = sheet.getCell('I' + (j)).value.length;
											} else {
												if (sheet.getCell('I' + (j)).value.length > colMaxLengthI) {
													colMaxLengthI = sheet.getCell('I' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('I').width = colMaxLengthI + 2;
										}
									}
									// code added by surya for autocolumn width - ended

								}

								//Coding to download in a folder
								// var tempFilePath = 'C:\\dex\\' + reportType + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() +
								// 	currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
								// console.log("tempFilePath : ", tempFilePath);
								// workbook.xlsx.writeFile(tempFilePath).then(function() {
								// 	res.sendFile(tempFilePath, function(err) {
								// 		if (err) {
								// 			console.log('---------- error downloading file: ', err);
								// 		}
								// 	});
								// 	console.log('file is written @ ' + tempFilePath);
								// });

								var tempFilePath = reportType + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() +
									currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
								res.setHeader(
									"Content-Type",
									"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
								);
								res.setHeader(
									"Content-Disposition",
									"attachment; filename=" + tempFilePath
								);
								return workbook.xlsx.write(res).then(function(data) {
									console.log(data);
									res.status(200).end();
								});
							}
						}).catch(function(oError) {

							that.getView().setBusy(false);
						});
					} catch (e) {

					} finally {

					}
				}
				//res.send(responseData);

			);
		});

		app.get('/materialDownload', function(req, res) {
			var reportType = req.query.type;
			//read products
			var responseData = [];
			var Product = app.models.Product;

			var async = require('async');
			async.waterfall([
					function(callback) {

						try {
							Product.find({})
								.then(function(records, err) {

									// result now equals 'done'
									//set all values to local variables which we need inside next promise
									//name = records.Name;
									if (records) {
										var excel = require('exceljs');
										var workbook = new excel.Workbook(); //creating workbook
										var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

										//Heading for excel
										var heading = {
											heading: "Product Report"
										};
										sheet.mergeCells('A1:M1');
										sheet.getCell('M1').value = 'Product Report';
										sheet.getCell('A1').alignment = {
											vertical: 'middle',
											horizontal: 'center'
										};
										sheet.getCell('A1').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '808080'
											}
										};

										//Merging second Row
										sheet.mergeCells('A2:M2');

										//Code for getting current datetime
										var currentdate = new Date();
										var datetime = currentdate.getDate() + "." + (currentdate.getMonth() + 1) + "." + currentdate.getFullYear() + " / " +
											currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
										sheet.getCell('A2').value = datetime;
										sheet.getRow(2).font === {
											bold: true
										};

										// Header creation
										var header = ["ProductCode", "ProductName", "Type", "Karat", "HindiName", "Tunch", "Wastage", "CustomerTunch",
											"AlertQuantity", "Making", "Category", "PricePerUnit", "WSTunch"
										];
										sheet.addRow().values = header;

										//Coding for cell color and bold character
										sheet.getRow(3).font === {
											bold: true
										};
										sheet.getCell('A2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('B2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('C2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('D2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('E2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('F2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('G2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('H2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('I2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('J2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('K2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('L2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('M2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('A3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('B3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('C3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('D3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('E3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('F3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('G3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('H3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('I3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('J3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('K3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('L3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('M3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};

										// Looping through the records
										for (var i = 0; i < records["length"]; i++) {
											var items = records[i];
											var item = [items["ProductCode"], items["ProductName"], items["Type"], items["Karat"], items["HindiName"], items["Tunch "],
												items["Wastage"], items["CustomerTunch"], items["AlertQuantity"], items["Making"], items["Category "], items[
													"PricePerUnit"], items["WSTunch"]
											];
											sheet.addRow().values = item;
										}

										var totText = records["length"] + 3;
										var totCol = totText - 1;

										//Coding for rows and column border
										var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE,
											colMaxLengthF, colMaxLengthG, colMaxLengthH, colMaxLengthI, colMaxLengthJ,
											colMaxLengthK, colMaxLengthL, colMaxLengthM;
										for (var j = 1; j <= totText; j++) {
											sheet.getCell('A' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('B' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('C' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('D' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('E' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('F' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('G' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('H' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('I' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('J' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('K' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('L' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('M' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											// code added by surya for autocolumn width - started
											//setting absolute length for column A
											if (j > "2") {
												if (sheet.getCell('A' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthA = sheet.getCell('A' + (j)).value.length;
													} else {
														if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
															colMaxLengthA = sheet.getCell('A' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('A').width = colMaxLengthA + 2;
												}
												//setting absolute length for column B
												if (sheet.getCell('B' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthB = sheet.getCell('B' + (j)).value.length;
													} else {
														if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
															colMaxLengthB = sheet.getCell('B' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('B').width = colMaxLengthB + 2;
												}
												//setting absolute length for column C
												if (sheet.getCell('C' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthC = sheet.getCell('C' + (j)).value.length;
													} else {
														if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
															colMaxLengthC = sheet.getCell('C' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('C').width = colMaxLengthC + 2;
												}
												//setting absolute length for column D
												if (sheet.getCell('D' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthD = sheet.getCell('D' + (j)).value.length;
													} else {
														if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
															colMaxLengthD = sheet.getCell('D' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('D').width = colMaxLengthD + 2;
												}
												//setting absolute length for column E
												if (sheet.getCell('E' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthE = sheet.getCell('E' + (j)).value.length;
													} else {
														if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
															colMaxLengthE = sheet.getCell('E' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('E').width = colMaxLengthE + 2;
												}
												//setting absolute length for column F
												if (sheet.getCell('F' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthF = sheet.getCell('F' + (j)).value.length;
													} else {
														if (sheet.getCell('F' + (j)).value.length > colMaxLengthF) {
															colMaxLengthF = sheet.getCell('F' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('F').width = colMaxLengthF + 2;
												}
												//setting absolute length for column G
												if (sheet.getCell('G' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthG = sheet.getCell('G' + (j)).value.length;
													} else {
														if (sheet.getCell('G' + (j)).value.length > colMaxLengthG) {
															colMaxLengthG = sheet.getCell('G' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('G').width = colMaxLengthG + 2;
												}
												//setting absolute length for column H
												if (sheet.getCell('H' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthH = sheet.getCell('H' + (j)).value.length;
													} else {
														if (sheet.getCell('H' + (j)).value.length > colMaxLengthH) {
															colMaxLengthH = sheet.getCell('H' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('H').width = colMaxLengthH + 2;
												}
												if (sheet.getCell('I' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthI = sheet.getCell('I' + (j)).value.length;
													} else {
														if (sheet.getCell('I' + (j)).value.length > colMaxLengthI) {
															colMaxLengthI = sheet.getCell('I' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('I').width = colMaxLengthI + 2;
												}
												//setting absolute length for column J
												if (sheet.getCell('J' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
													} else {
														if (sheet.getCell('J' + (j)).value.length > colMaxLengthJ) {
															colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('J').width = colMaxLengthJ + 2;
												}
												//setting absolute length for column K
												if (sheet.getCell('K' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthK = sheet.getCell('K' + (j)).value.length;
													} else {
														if (sheet.getCell('K' + (j)).value.length > colMaxLengthK) {
															colMaxLengthK = sheet.getCell('K' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('K').width = colMaxLengthK + 2;
												}
												//setting absolute length for column L
												if (sheet.getCell('L' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthL = sheet.getCell('L' + (j)).value.length;
													} else {
														if (sheet.getCell('L' + (j)).value.length > colMaxLengthL) {
															colMaxLengthL = sheet.getCell('L' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('L').width = colMaxLengthL + 2;
												}
												//setting absolute length for column M
												if (sheet.getCell('M' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthM = sheet.getCell('M' + (j)).value.length;
													} else {
														if (sheet.getCell('M' + (j)).value.length > colMaxLengthM) {
															colMaxLengthM = sheet.getCell('M' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('M').width = colMaxLengthM + 2;
												}
											}
											// code added by surya for autocolumn width - ended

										}

										//Coding to download in a folder
										// var tempFilePath = 'C:\\dex\\' + reportType + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() +
										// 	currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										// console.log("tempFilePath : ", tempFilePath);
										// // nishan
										// workbook.xlsx.writeFile(tempFilePath).then(function() {
										// 	res.sendFile(tempFilePath, function(err) {
										// 		if (err) {
										// 			console.log('---------- error downloading file: ', err);
										// 		}
										// 	});
										// 	console.log('file is written @ ' + tempFilePath);
										// });

										var tempFilePath = reportType + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() +
											currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										res.setHeader(
											"Content-Type",
											"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
										);
										res.setHeader(
											"Content-Disposition",
											"attachment; filename=" + tempFilePath
										);
										return workbook.xlsx.write(res).then(function(data) {
											console.log(data);
											res.status(200).end();
										});
									}
								}).catch(function(oError) {
									that.getView().setBusy(false);
									var oPopover = that.getErrorMessage(oError);
								});
						} catch (e) {

						} finally {

						}

					}
				]
				//res.send(responseData);
			);
		});

		app.get('/cityDownload', function(req, res) {
			var reportType = req.query.type;
			//read cities
			var responseData = [];
			//var oSubCounter = {};
			var City = app.models.City;

			var async = require('async');
			async.waterfall([
					function(callback) {

						try {
							City.find({})
								.then(function(records, err) {

									// result now equals 'done'
									//set all values to local variables which we need inside next promise
									//name = records.Name;
									if (records) {
										var excel = require('exceljs');
										var workbook = new excel.Workbook(); //creating workbook
										var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

										//Heading for excel
										var heading = {
											heading: "City Report"
										};
										sheet.mergeCells('A1:C1');
										sheet.getCell('C1').value = 'City Report';
										sheet.getCell('A1').alignment = {
											vertical: 'middle',
											horizontal: 'center'
										};
										sheet.getCell('A1').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '808080'
											}
										};

										//Merging second Row
										sheet.mergeCells('A2:C2');

										//Code for getting current datetime
										var currentdate = new Date();
										var datetime = currentdate.getDate() + "." + (currentdate.getMonth() + 1) + "." + currentdate.getFullYear() + " / " +
											currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
										sheet.getCell('A2').value = datetime;
										sheet.getRow(2).font === {
											bold: true
										};

										// Header creation
										var header = ["cityCode", "cityName", "state"];
										sheet.addRow().values = header;

										//Coding for cell color and bold character
										sheet.getRow(3).font === {
											bold: true
										};
										sheet.getCell('A2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('B2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('C2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('A3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('B3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('C3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};

										// Looping through the records
										for (var i = 0; i < records["length"]; i++) {
											var items = records[i];
											var item = [items["cityCode"], items["cityName"], items["state"]];
											sheet.addRow().values = item;
										}

										var totText = records["length"] + 3;
										var totCol = totText - 1;

										//Coding for rows and column border
										var colMaxLengthA, colMaxLengthB, colMaxLengthC;
										for (var j = 1; j <= totText; j++) {
											sheet.getCell('A' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('B' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('C' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};

											// code added by surya for autocolumn width - started
											//setting absolute length for column A
											if (j > "2") {
												if (sheet.getCell('A' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthA = sheet.getCell('A' + (j)).value.length;
													} else {
														if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
															colMaxLengthA = sheet.getCell('A' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('A').width = colMaxLengthA + 2;
												}
												//setting absolute length for column B
												if (sheet.getCell('B' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthB = sheet.getCell('B' + (j)).value.length;
													} else {
														if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
															colMaxLengthB = sheet.getCell('B' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('B').width = colMaxLengthB + 2;
												}
												//setting absolute length for column C
												if (sheet.getCell('C' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthC = sheet.getCell('C' + (j)).value.length;
													} else {
														if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
															colMaxLengthC = sheet.getCell('C' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('C').width = colMaxLengthC + 2;
												}
											}
										}

										//Coding to download in a folder
										// var tempFilePath = 'C:\\dex\\' + reportType + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() +
										// 	currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										// console.log("tempFilePath : ", tempFilePath);
										// workbook.xlsx.writeFile(tempFilePath).then(function() {
										// 	res.sendFile(tempFilePath, function(err) {
										// 		if (err) {
										// 			console.log('---------- error downloading file: ', err);
										// 		}
										// 	});
										// 	console.log('file is written @ ' + tempFilePath);
										// });

										var tempFilePath = reportType + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() +
											currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										res.setHeader(
											"Content-Type",
											"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
										);
										res.setHeader(
											"Content-Disposition",
											"attachment; filename=" + tempFilePath
										);
										return workbook.xlsx.write(res).then(function(data) {
											console.log(data);
											res.status(200).end();
										});
									}
								}).catch(function(oError) {
									that.getView().setBusy(false);
									var oPopover = that.getErrorMessage(oError);
								});
						} catch (e) {

						} finally {

						}

					}
				]
				//res.send(responseData);
			);
		});

		app.get('/groupsDownload', function(req, res) {
			var reportType = req.query.type;
			//read Groups
			var responseData = [];
			var Group = app.models.Group;

			var async = require('async');
			async.waterfall([
					function(callback) {

						try {
							Group.find({})
								.then(function(records, err) {

									// result now equals 'done'
									//set all values to local variables which we need inside next promise
									//name = records.Name;
									if (records) {
										var excel = require('exceljs');
										var workbook = new excel.Workbook(); //creating workbook
										var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

										//Heading for excel
										var heading = {
											heading: "Group Report"
										};
										sheet.mergeCells('A1:C1');
										sheet.getCell('C1').value = 'Group Report';
										sheet.getCell('A1').alignment = {
											vertical: 'middle',
											horizontal: 'center'
										};
										sheet.getCell('A1').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: '808080'
											}
										};

										//Merging second Row
										sheet.mergeCells('A2:C2');

										//Code for getting current datetime
										var currentdate = new Date();
										var datetime = currentdate.getDate() + "." + (currentdate.getMonth() + 1) + "." + currentdate.getFullYear() + " / " +
											currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
										sheet.getCell('A2').value = datetime;
										sheet.getRow(2).font === {
											bold: true
										};

										// Header creation
										var header = ["groupCode", "groupName", "description"];
										sheet.addRow().values = header;

										//Coding for cell color and bold character
										sheet.getRow(3).font === {
											bold: true
										};
										sheet.getCell('A2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('B2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('C2').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('A3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('B3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};
										sheet.getCell('C3').fill = {
											type: 'pattern',
											pattern: 'solid',
											fgColor: {
												argb: 'A9A9A9'
											}
										};

										// Looping through the records
										for (var i = 0; i < records["length"]; i++) {
											var items = records[i];
											var item = [items["groupCode"], items["groupName"], items["description"]];
											sheet.addRow().values = item;
										}

										var totText = records["length"] + 3;
										var totCol = totText - 1;

										//Coding for rows and column border
										var colMaxLengthA, colMaxLengthB, colMaxLengthC;
										for (var j = 1; j <= totText; j++) {
											sheet.getCell('A' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('B' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											sheet.getCell('C' + (j)).border = {
												top: {
													style: 'thin'
												},
												left: {
													style: 'thin'
												},
												bottom: {
													style: 'thin'
												},
												right: {
													style: 'thin'
												}
											};
											// code added by surya for autocolumn width - started
											//setting absolute length for column A
											if (j > "2") {
												if (sheet.getCell('A' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthA = sheet.getCell('A' + (j)).value.length;
													} else {
														if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
															colMaxLengthA = sheet.getCell('A' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('A').width = colMaxLengthA + 2;
												}
												//setting absolute length for column B
												if (sheet.getCell('B' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthB = sheet.getCell('B' + (j)).value.length;
													} else {
														if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
															colMaxLengthB = sheet.getCell('B' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('B').width = colMaxLengthB + 2;
												}
												//setting absolute length for column C
												if (sheet.getCell('C' + (j)).value !== null) {
													if (j == "3") {
														colMaxLengthC = sheet.getCell('C' + (j)).value.length;
													} else {
														if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
															colMaxLengthC = sheet.getCell('C' + (j)).value.length;
														}
													}
												}
												if (j == totText) {
													sheet.getColumn('C').width = colMaxLengthC + 2;
												}
											}
										}

										//Coding to download in a folder
										// var tempFilePath = 'C:\\dex\\' + reportType + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() +
										// 	currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										// console.log("tempFilePath : ", tempFilePath);
										// workbook.xlsx.writeFile(tempFilePath).then(function() {
										// 	res.sendFile(tempFilePath, function(err) {
										// 		if (err) {
										// 			console.log('---------- error downloading file: ', err);
										// 		}
										// 	});
										// 	console.log('file is written @ ' + tempFilePath);
										// });

										var tempFilePath = reportType + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() +
											currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
										res.setHeader(
											"Content-Type",
											"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
										);
										res.setHeader(
											"Content-Disposition",
											"attachment; filename=" + tempFilePath
										);
										return workbook.xlsx.write(res).then(function(data) {
											console.log(data);
											res.status(200).end();
										});
									}
								}).catch(function(oError) {
									that.getView().setBusy(false);
									var oPopover = that.getErrorMessage(oError);
								});
						} catch (e) {

						} finally {

						}

					}
				]
				//res.send(responseData);
			);
		});

		app.get('/groupWiseEntryDownload', async function(req, res) {

			var reportType = req.query.type;
			var grp = req.query.group;
			var gname = req.query.name;


			var async = require('async');
			// fetch all the entries
			var items = [];
			var items2 = [];
			var Entry = app.models.Entry;
			var collection = Entry.getDataSource().connector.collection(Entry.modelName);
			var entryRecord = new Set();

			async.waterfall([
					function(callback) {

						collection.aggregate([{
							$group: {
								_id: '$Customer',
								Cash: {
									$sum: "$Cash"
								},
								Gold: {
									$sum: "$Gold"
								},
								Silver: {
									$sum: "$Silver"
								},
								Date: {
									$max: "$Date"
								}
							}
						}], function(err, data) {
							if (err) return callback(err);
							data.on('data', async function(data) {
								items.push(data);
								entryRecord.add(data._id.toString());
							});

							data.on('end', function() {
								// callback(err, entryRecord);
								//console.log(JSON.stringify(items));
								var aItemsToday = items;
								//TILL TODAY TOTAL STOCK PER PRODUCT AGGREGATE SUM OF QUANTITY
								app.models.Customer.find({
									where: {
										id: {
											inq: Array.from(entryRecord)
										}
									}
								}, function(err, customerRecord) {

									// return entryRecord;
									callback(err, customerRecord, items);

								});
							});
						});
					},

					function(customerRecord, entryRecord, callback) {
						// var customerRecord=entryRecord;
						//Loop customer data and put all the city and Group codes in different arrays

						var arrCities = [];
						var arrGroups = [];

						for (var i = 0; i < customerRecord["length"]; i++) {
							console.log(customerRecord[i].CustomerCode + " " + customerRecord[i].City);
							if (!(arrCities.includes(customerRecord[i].City.toString()))) {

								arrCities.push(customerRecord[i].City.toString());
							}
							if (!(arrGroups.includes(customerRecord[i].Group.toString()))) {
								arrGroups.push(customerRecord[i].Group.toString());
							}
						}

						//Fetch city data on the basis of city codes array
						var City = app.models.City;
						City.find({
							where: {
								id: {
									inq: arrCities
								}
							},
							fields: {
								"id": true,
								"cityCode": true,
								"cityName": true
							}
						}).then(function(cityRecord, err) {

							// call second function of the waterfall
							callback(err, customerRecord, entryRecord, cityRecord, arrGroups);
						});
					}
				], function(err, customerRecord, entryRecord, cityRecord, arrGroups) {

					try {
						//Fetch Groups data on the basis of group codes array
						//
						var Group = app.models.Group;
						Group.find({
							where: {
								id: {
									inq: arrGroups
								}
							},
							fields: {
								"id": true,
								"groupCode": true,
								"groupName": true
							}
						}).then(function(groupRecord, err) {
							//
							var entryFinals = [];
							var noGroupEntries = [];
							var gro = [];
							for (var a = 0; a < entryRecord.length; a++) {
								var entryFinal = {};
								//Get fields from customer table
								entryFinal.Date = entryRecord[a].Date;
								entryFinal.Cash = entryRecord[a].Cash;
								entryFinal.Gold = entryRecord[a].Gold;
								entryFinal.Silver = entryRecord[a].Silver;
								//

								//loop through customer records to get customer details
								for (var i = 0; i < customerRecord.length; i++) {
									if (entryRecord[a]._id.toString() == customerRecord[i].id.toString()) {
										//loop through city records to get city name
										for (var m = 0; m < cityRecord.length; m++) {
											if (customerRecord[i].City.toString() == cityRecord[m].id.toString()) {
												entryFinal.City = cityRecord[m].cityName;
												entryFinal.CustomerCode = customerRecord[i].CustomerCode;
												entryFinal.CustomerName = customerRecord[i].Name;
												break;
											}
										}
										//
										if (customerRecord[i].Group.toString() == grp) {
											//loop through Group records to get group name
											for (var k = 0; k < groupRecord.length; k++) {
												if (customerRecord[i].Group.toString() == groupRecord[k].id.toString()) {
													entryFinal.Group = groupRecord[k].groupName;
													break;
												}
											}
										}
										if (grp == "00" || grp == "01") {
											//loop through Group records to get group name
											for (var k = 0; k < groupRecord.length; k++) {
												if (customerRecord[i].Group.toString() == groupRecord[k].id.toString()) {
													entryFinal.Group = groupRecord[k].groupName;
													break;
												}
											}
										}
										// if(grp == "01"){
										// 	for (var k = 0; k < groupRecord.length; k++) {
										// 		if (customerRecord[i].Group.toString() == groupRecord[k].id.toString()) {
										// 			gro.Group = groupRecord[k].groupName;
										// 			break;
										// 		}
										// 	}
										// 	if(gro.Group == null){
										// 		noGroupEntries.push(entryFinal);
										// 	}
										// }
										if (!(entryFinal.Group == null)) {
											// if(grp !="01"){
											entryFinals.push(entryFinal);
											// }
										} else {
											//
											noGroupEntries.push(entryFinal);
										}
										break;
									}
								}

								//Now push prepared record object to the array of Final Entries
							}
							//
							if (entryFinals) {

								//sort customer arrays on the basis of Group
								entryFinals.sort(function(a, b) {
									return ('' + a.Group).localeCompare(b.Group);
								})

								var currentdate = new Date();
								var datetime = currentdate.getDate() + "." + (currentdate.getMonth() + 1) + "." + currentdate.getFullYear() + " / " +
									currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();

								//declare function for making one complete tab groupwise
								function createTabForGroup(group, groupRecords) {
									//
									//create a tab sheet with the Group name
									var sheet = workbook.addWorksheet(group); //creating worksheet
									//Heading for excel

									sheet.mergeCells('A1:G1');
									sheet.getCell('G1').value = 'Customer Code Report';
									sheet.getCell('A1').alignment = {
										vertical: 'middle',
										horizontal: 'center'
									};
									sheet.getCell('A1').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: '808080'
										}
									};

									//Merging second Row
									sheet.mergeCells('A2:G2');

									//Code for getting current datetime
									var currentdate = new Date();
									var datetime = currentdate.getDate() + "." + (currentdate.getMonth() + 1) + "." + currentdate.getFullYear() + " / " +
										currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
									sheet.getRow(2).font === {
										bold: true
									};

									// Header creation
									var header = ["Customer Code", "Customer Name", "City Name", "Total Amount", "Total Gold", "Total Silver", "Last Entry on"];
									sheet.addRow().values = header;

									//Code for getting current datetime
									sheet.getCell('A2').value = datetime;
									sheet.getRow(2).font === {
										bold: true
									};

									//Coding for cell color and bold character
									sheet.getCell('A2').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('B2').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('C2').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('D2').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('E2').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('F2').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('G2').fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};

									function formatDateForEntry(date) {
										var d = new Date(date),
											month = '' + (d.getMonth() + 1),
											day = '' + d.getDate(),
											year = d.getFullYear();

										if (month.length < 2)
											month = '0' + month;
										if (day.length < 2)
											day = '0' + day;

										return [day, month, year].join('.');
									}
									//variables for total aggregation
									var totalSilver = 0;
									var totalCash = 0;
									var totalGold = 0;
									// Looping through the records
									for (var j = 0; j < groupRecords["length"]; j++) {
										var items = groupRecords[j];
										//

										var date1 = formatDateForEntry(items.Date);
										var item = [items.CustomerCode, items.CustomerName, items.City, items.Cash, items.Gold, items.Silver, date1];
										totalSilver = totalSilver + items["Silver"];
										totalCash = totalCash + items["Cash"];
										totalGold = totalGold + items["Gold"];
										sheet.addRow().values = item;
									}
									//For Footer aggregation line
									var totText = groupRecords["length"] + 4;
									sheet.getCell('A' + totText).value = "TOTAL";

									sheet.getCell('D' + totText).value = totalCash;

									if (totalGold === 0) {
										sheet.getCell('E' + totText).value = totalGold + '.00 gm';
									} else {
										sheet.getCell('E' + totText).value = totalGold + 'gm';
									}

									if (totalSilver === 0) {
										sheet.getCell('F' + totText).value = totalSilver + '.00 gm';
									} else {
										sheet.getCell('F' + totText).value = totalSilver + 'gm';
									}

									sheet.getCell('E' + totText).value = totalGold;
									sheet.getCell('F' + totText).value = totalSilver;

									sheet.getCell('A' + totText).fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: '000000'
										},
										bgColor: {
											argb: '000000'
										}
									};
									sheet.getCell('A' + totText).font = {
										color: {
											argb: '000000'
										},
										bold: true
									};

									sheet.getCell('A' + totText).fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('B' + totText).fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('C' + totText).fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('D' + totText).fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('E' + totText).fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('F' + totText).fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};
									sheet.getCell('G' + totText).fill = {
										type: 'pattern',
										pattern: 'solid',
										fgColor: {
											argb: 'A9A9A9'
										}
									};

									//Coding for rows and column border
									var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE,
										colMaxLengthF, colMaxLengthG;
									for (var j = 1; j <= totText; j++) {

										//Column color code

										if (sheet.getCell('D' + (j)).value == '') {
											sheet.getCell('D' + (j)).fill = {
												type: 'pattern',
												pattern: 'solid',
												bgColor: {
													argb: '00FFFF'
												},
												fgColor: {
													argb: '00FFFF'
												}
											};

										} else if (sheet.getCell('D' + (j)).value < 0) {
											sheet.getCell('D' + (j)).font = {
												color: {
													argb: 'FF0000'
												},
												bold: true
											};
										} else {
											sheet.getCell('D' + (j)).font = {
												color: {
													argb: '000000'
												},
												bold: true
											};
										}

										if (sheet.getCell('E' + (j)).value == '') {
											sheet.getCell('E' + (j)).fill = {
												type: 'pattern',
												pattern: 'solid',
												bgColor: {
													argb: '00FFFF'
												},
												fgColor: {
													argb: '00FFFF'
												}
											};
											// if (j > 3 && j <= (totText - 2)) {
											// 	var valC = sheet.getCell('E' + (j)).value;
											// 	sheet.getCell('E' + (j)).value = valC + '/-';
											// 	sheet.getCell('E' + (j)).alignment = {
											// 		vertical: 'bottom',
											// 		horizontal: 'right'
											// 	};
											// }

										} else if (sheet.getCell('E' + (j)).value < 0) {
											sheet.getCell('E' + (j)).font = {
												color: {
													argb: 'FF0000'
												},
												bold: true
											};
											// if (j > 3 && j <= (totText - 2)) {
											// 	var valC = sheet.getCell('E' + (j)).value;
											// 	sheet.getCell('E' + (j)).value = valC + '/-';
											// 	sheet.getCell('E' + (j)).alignment = {
											// 		vertical: 'bottom',
											// 		horizontal: 'right'
											// 	};
											// }

										} else {
											sheet.getCell('E' + (j)).font = {
												color: {
													argb: '000000'
												},
												bold: true
											};
											// if (j > 3 && j <= (totText - 2)) {
											// 	var valC = sheet.getCell('E' + (j)).value;
											// 	sheet.getCell('E' + (j)).value = valC + '/-';
											// 	sheet.getCell('E' + (j)).alignment = {
											// 		vertical: 'bottom',
											// 		horizontal: 'right'
											// 	};
											// }

										}

										if (sheet.getCell('F' + (j)).value == '') {
											sheet.getCell('F' + (j)).fill = {
												type: 'pattern',
												pattern: 'solid',
												bgColor: {
													argb: '00FFFF'
												},
												fgColor: {
													argb: '00FFFF'
												}
											};

										} else if (sheet.getCell('F' + (j)).value < 0) {
											sheet.getCell('F' + (j)).font = {
												color: {
													argb: 'FF0000'
												},
												bold: true
											};
										} else {
											sheet.getCell('F' + (j)).font = {
												color: {
													argb: '000000'
												},
												bold: true
											};
										}

										//Column color code end


										sheet.getCell('A' + (j)).border = {
											top: {
												style: 'thin'
											},
											left: {
												style: 'thin'
											},
											bottom: {
												style: 'thin'
											},
											right: {
												style: 'thin'
											}
										};
										sheet.getCell('B' + (j)).border = {
											top: {
												style: 'thin'
											},
											left: {
												style: 'thin'
											},
											bottom: {
												style: 'thin'
											},
											right: {
												style: 'thin'
											}
										};
										sheet.getCell('C' + (j)).border = {
											top: {
												style: 'thin'
											},
											left: {
												style: 'thin'
											},
											bottom: {
												style: 'thin'
											},
											right: {
												style: 'thin'
											}
										};
										sheet.getCell('D' + (j)).border = {
											top: {
												style: 'thin'
											},
											left: {
												style: 'thin'
											},
											bottom: {
												style: 'thin'
											},
											right: {
												style: 'thin'
											}
										};
										sheet.getCell('E' + (j)).border = {
											top: {
												style: 'thin'
											},
											left: {
												style: 'thin'
											},
											bottom: {
												style: 'thin'
											},
											right: {
												style: 'thin'
											}
										};
										sheet.getCell('F' + (j)).border = {
											top: {
												style: 'thin'
											},
											left: {
												style: 'thin'
											},
											bottom: {
												style: 'thin'
											},
											right: {
												style: 'thin'
											}
										};
										sheet.getCell('G' + (j)).border = {
											top: {
												style: 'thin'
											},
											left: {
												style: 'thin'
											},
											bottom: {
												style: 'thin'
											},
											right: {
												style: 'thin'
											}
										};

										// code added by surya for autocolumn width - started
										//setting absolute length for column A
										if (j > "2") {
											if (sheet.getCell('A' + (j)).value !== null) {
												if (j == "3") {
													colMaxLengthA = sheet.getCell('A' + (j)).value.length;
												} else {
													if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
														colMaxLengthA = sheet.getCell('A' + (j)).value.length;
													}
												}
											}
											if (j == totText) {
												sheet.getColumn('A').width = colMaxLengthA + 2;
											}
											//setting absolute length for column B
											if (sheet.getCell('B' + (j)).value !== null) {
												if (j == "3") {
													colMaxLengthB = sheet.getCell('B' + (j)).value.length;
												} else {
													if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
														colMaxLengthB = sheet.getCell('B' + (j)).value.length;
													}
												}
											}
											if (j == totText) {
												sheet.getColumn('B').width = colMaxLengthB + 2;
											}
											//setting absolute length for column C
											if (sheet.getCell('C' + (j)).value !== null) {
												if (j == "3") {
													colMaxLengthC = sheet.getCell('C' + (j)).value.length;
												} else {
													if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
														colMaxLengthC = sheet.getCell('C' + (j)).value.length;
													}
												}
											}
											if (j == totText) {
												sheet.getColumn('C').width = colMaxLengthC + 2;
											}
											//setting absolute length for column D
											if (sheet.getCell('D' + (j)).value !== null) {
												if (j == "3") {
													colMaxLengthD = sheet.getCell('D' + (j)).value.length;
												} else {
													if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
														colMaxLengthD = sheet.getCell('D' + (j)).value.length;
													}
												}
											}
											if (j == totText) {
												sheet.getColumn('D').width = colMaxLengthD + 2;
											}
											//setting absolute length for column E
											if (sheet.getCell('E' + (j)).value !== null) {
												if (j == "3") {
													colMaxLengthE = sheet.getCell('E' + (j)).value.length;
												} else {
													if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
														colMaxLengthE = sheet.getCell('E' + (j)).value.length;
													}
												}
											}
											if (j == totText) {
												sheet.getColumn('E').width = colMaxLengthE + 2;
											}
											//setting absolute length for column F
											if (sheet.getCell('F' + (j)).value !== null) {
												if (j == "3") {
													colMaxLengthF = sheet.getCell('F' + (j)).value.length;
												} else {
													if (sheet.getCell('F' + (j)).value.length > colMaxLengthF) {
														colMaxLengthF = sheet.getCell('F' + (j)).value.length;
													}
												}
											}
											if (j == totText) {
												sheet.getColumn('F').width = colMaxLengthG + 2;
											}
											//setting absolute length for column G
											if (sheet.getCell('G' + (j)).value !== null) {
												if (j == "3") {
													colMaxLengthG = sheet.getCell('G' + (j)).value.length;
												} else {
													if (sheet.getCell('G' + (j)).value.length > colMaxLengthG) {
														colMaxLengthG = sheet.getCell('G' + (j)).value.length;
													}
												}
											}
											if (j == totText) {
												sheet.getColumn('G').width = colMaxLengthG + 2;
											}
										}
										// code added by surya for autocolumn width - ended

									}

								}
								// Start the excel instance
								var excel = require('exceljs');
								var workbook = new excel.Workbook(); //creating workbook

								//loop the sorted table & for each group create a new sheet.
								var sameGroupEntries = [];


								function GetSortOrder(prop) {
									return function(a, b) {
										if (a[prop] > b[prop]) {
											return 1;
										} else if (a[prop] < b[prop]) {
											return -1;
										}
										return 0;
									}
								}

								// entryFinals.sort(GetSortOrder("CustomerName"));


								if (grp != "01") {
									for (var n = 0; n < entryFinals.length; n++) {

										if (n !== 0) {
											// check if the group is going to change from the next record
											if (entryFinals[n].Group !== entryFinals[n - "1"].Group) {
												sameGroupEntries.sort(GetSortOrder("CustomerName"));

												//call function to create new tab and prepare complete tab data
												createTabForGroup(entryFinals[n - "1"].Group, sameGroupEntries);
												//clear sameGroup entry as group is changed now
												sameGroupEntries = [];
											}
										}

										//push the entry in the collecting array
										sameGroupEntries.push(entryFinals[n]);
									}
									if (sameGroupEntries) {
										sameGroupEntries.sort(GetSortOrder("CustomerName"));
										//call function to create new tab and prepare complete tab data
										createTabForGroup(entryFinals[n - "1"].Group, sameGroupEntries);
									}
								}
								if (noGroupEntries) {
									if (grp == "00" || grp == "01") {
										//call function to create new tab and prepare complete tab data

										noGroupEntries.sort(GetSortOrder("CustomerName"));
										createTabForGroup("No_Group_Customers", noGroupEntries);
									}
									// if(grp=="01"){entryFinal=noGroupEntries;}
								}

								//Coding to download in a folder
								if (grp == "00") {
									var tempFilePath = reportType + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() +
										currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
								} else if (grp == "01") {
									var tempFilePath = 'Group-No Group Customers _' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() +
										currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
								} else {
									var tempFilePath = 'Group-' + gname + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() +
										currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';
								}
								// console.log("tempFilePath : ", tempFilePath);
								// workbook.xlsx.writeFile(tempFilePath).then(function() {
								// 	res.sendFile(tempFilePath, function(err) {
								// 		if (err) {
								// 			console.log('---------- error downloading file: ', err);
								// 		}
								// 	});
								// 	console.log('file is written @ ' + tempFilePath);
								// });    nngroup
								res.setHeader(
									"Content-Type",
									"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
								);
								res.setHeader(
									"Content-Disposition",
									"attachment; filename=" + tempFilePath
								);
								// console.log("came");
								return workbook.xlsx.write(res).then(function(data) {
									console.log(data);
									//res.writeHead(200, [['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
									//res.end(new Buffer(data, 'base64'));
									res.status(200).end();
								});


							}
						}).catch(function(oError) {

							// that.getView().setBusy(false);
						});
					} catch (e) {

					} finally {

					}
				}
				//res.send(responseData);

			);
		});

		///// code added by surya - end




		app.get('/entryDownloadDate', function(req, res) {

			var reportType = req.query.type;
			var min = req.query.min;
			var max = req.query.max;
			var async = require('async');
			// fetch all the entries
			var Entry = app.models.Entry;
			async.waterfall([
				function(callback) {
					//Find all Customers
					Entry.find({
							order: ['Date ASC', 'ChangedOn DESC', 'CreatedOn DESC'],
							where: {
								"Date": {
									between: [new Date(min), new Date(max)]
								}
							}
						})
						.then(function(entryRecord, err) {
							// call second function of the waterfall
							callback(err, entryRecord);
						});
				},
				function(entryRecord, callback) {
					//Loop customer data and put all the city and Group codes in different arrays

					var arrCustomers = [];

					for (var p = 0; p < entryRecord["length"]; p++) {
						if (!(arrCustomers.includes(entryRecord[p].Customer.toString()))) {
							arrCustomers.push(entryRecord[p].Customer.toString());
						}
					}

					//Fetch city data on the basis of city codes array
					var Customer = app.models.Customer;
					Customer.find({
						where: {
							id: {
								inq: arrCustomers
							}
						},
						fields: {
							"id": true,
							"City": true,
							"CustomerCode": true,
							"Name": true,
							"Group": true
						}
					}).then(function(customerRecord, err) {

						callback(err, customerRecord, entryRecord);
					});
				},
				function(customerRecord, entryRecord, callback) {
					//Loop customer data and put all the city and Group codes in different arrays

					var arrCities = [];
					// var arrGroups = [];

					for (var i = 0; i < customerRecord["length"]; i++) {
						if (!(arrCities.includes(customerRecord[i].City.toString()))) {
							arrCities.push(customerRecord[i].City.toString());
						}

					}

					//Fetch city data on the basis of city codes array
					var City = app.models.City;
					City.find({
						where: {
							id: {
								inq: arrCities
							}
						},
						fields: {
							"id": true,
							"cityCode": true,
							"cityName": true
						}
					}).then(function(cityRecord, err) {
						// call second function of the waterfall
						callback(err, customerRecord, entryRecord, cityRecord);
					});
				}
			], function(err, customerRecord, entryRecord, cityRecord, arrGroups) {

				try {
					{
						var entryFinals = [];
						var noGroupEntries = [];
						var gro = [];
						for (var a = 0; a < entryRecord.length; a++) {
							var entryFinal = {};
							//Get fields from customer table
							entryFinal.Date = entryRecord[a].Date;
							entryFinal.Cash = entryRecord[a].Cash;
							entryFinal.Gold = entryRecord[a].Gold;
							entryFinal.Silver = entryRecord[a].Silver;


							//loop through customer records to get customer details
							for (var i = 0; i < customerRecord.length; i++) {
								if (entryRecord[a].Customer.toString() == customerRecord[i].id.toString()) {
									//loop through city records to get city name
									for (var m = 0; m < cityRecord.length; m++) {
										if (customerRecord[i].City.toString() == cityRecord[m].id.toString()) {
											entryFinal.City = cityRecord[m].cityName;
											entryFinal.CustomerCode = customerRecord[i].CustomerCode;
											entryFinal.CustomerName = customerRecord[i].Name;
											entryFinals.push(entryFinal);
											break;
										}
									}
								}
							}

							//Now push prepared record object to the array of Final Entries
						}

						if (entryFinals) {
							var currentdate = new Date();
							var datetime = currentdate.getDate() + "." + (currentdate.getMonth() + 1) + "." + currentdate.getFullYear() + " / " +
								currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();

							//declare function for making one complete tab groupwise
							function createTabForGroup(group, groupRecords) {


								//create a tab sheet with the Group name
								var sheet = workbook.addWorksheet(group); //creating worksheet
								function formatDateForEntry(date) {
									var d = new Date(date),
										month = '' + (d.getMonth() + 1),
										day = '' + d.getDate(),
										year = d.getFullYear();

									if (month.length < 2)
										month = '0' + month;
									if (day.length < 2)
										day = '0' + day;

									return [day, month, year].join('.');
								}
								//Heading for excel

								sheet.mergeCells('A1:G1');
								sheet.getCell('G1').value = 'Customer DayBook Report';
								sheet.getCell('A1').alignment = {
									vertical: 'middle',
									horizontal: 'center'
								};
								sheet.getCell('A1').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: '808080'
									}
								};

								//Merging second Row
								sheet.mergeCells('A2:G2');

								//Code for getting current datetime
								var currentdate = new Date();
								var datetime = currentdate.getDate() + "." + (currentdate.getMonth() + 1) + "." + currentdate.getFullYear() + " / " +
									currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
								sheet.getRow(2).font === {
									bold: true
								};

								// Header creation
								var header = ["Customer Code", "Customer Name", "City Name", "Total Amount", "Total Gold", "Total Silver", "Date"];
								sheet.addRow().values = header;

								//Code for getting current datetime
								sheet.getCell('A2').value = datetime;
								sheet.getRow(2).font === {
									bold: true
								};

								//Coding for cell color and bold character
								sheet.getCell('A2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('B2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('C2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('D2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('E2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('F2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('G2').fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};

								//variables for total aggregation
								var totalSilver = 0;
								var totalCash = 0;
								var totalGold = 0;
								// Looping through the records
								for (var j = 0; j < groupRecords["length"]; j++) {
									var items = groupRecords[j];
									var datet = formatDateForEntry(items.Date);
									var item = [items.CustomerCode, items.CustomerName, items.City, items.Cash, items.Gold, items.Silver, datet];
									totalSilver = totalSilver + items["Silver"];
									totalCash = totalCash + items["Cash"];
									totalGold = totalGold + items["Gold"];
									sheet.addRow().values = item;
								}
								//For Footer aggregation line
								var totText = groupRecords["length"] + 4;
								sheet.getCell('A' + totText).value = "TOTAL";

								sheet.getCell('D' + totText).value = totalCash;

								if (totalGold === 0) {
									sheet.getCell('E' + totText).value = totalGold + '.00 gm';
								} else {
									sheet.getCell('E' + totText).value = totalGold + 'gm';
								}

								if (totalSilver === 0) {
									sheet.getCell('F' + totText).value = totalSilver + '.00 gm';
								} else {
									sheet.getCell('F' + totText).value = totalSilver + 'gm';
								}

								sheet.getCell('E' + totText).value = totalGold;
								sheet.getCell('F' + totText).value = totalSilver;

								sheet.getCell('A' + totText).fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: '000000'
									},
									bgColor: {
										argb: '000000'
									}
								};
								sheet.getCell('A' + totText).font = {
									color: {
										argb: '000000'
									},
									bold: true
								};

								sheet.getCell('A' + totText).fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('B' + totText).fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('C' + totText).fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('D' + totText).fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('E' + totText).fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('F' + totText).fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};
								sheet.getCell('G' + totText).fill = {
									type: 'pattern',
									pattern: 'solid',
									fgColor: {
										argb: 'A9A9A9'
									}
								};

								//Coding for rows and column border
								var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE,
									colMaxLengthF, colMaxLengthG;
								for (var j = 1; j <= totText; j++) {

									//Column color code

									if (sheet.getCell('D' + (j)).value == '') {
										sheet.getCell('D' + (j)).fill = {
											type: 'pattern',
											pattern: 'solid',
											bgColor: {
												argb: '00FFFF'
											},
											fgColor: {
												argb: '00FFFF'
											}
										};

									} else if (sheet.getCell('D' + (j)).value < 0) {
										sheet.getCell('D' + (j)).font = {
											color: {
												argb: 'FF0000'
											},
											bold: true
										};
									} else {
										sheet.getCell('D' + (j)).font = {
											color: {
												argb: '000000'
											},
											bold: true
										};
									}

									if (sheet.getCell('E' + (j)).value == '') {
										sheet.getCell('E' + (j)).fill = {
											type: 'pattern',
											pattern: 'solid',
											bgColor: {
												argb: '00FFFF'
											},
											fgColor: {
												argb: '00FFFF'
											}
										};
									} else if (sheet.getCell('E' + (j)).value < 0) {
										sheet.getCell('E' + (j)).font = {
											color: {
												argb: 'FF0000'
											},
											bold: true
										};
									} else {
										sheet.getCell('E' + (j)).font = {
											color: {
												argb: '000000'
											},
											bold: true
										};
									}

									if (sheet.getCell('F' + (j)).value == '') {
										sheet.getCell('F' + (j)).fill = {
											type: 'pattern',
											pattern: 'solid',
											bgColor: {
												argb: '00FFFF'
											},
											fgColor: {
												argb: '00FFFF'
											}
										};

									} else if (sheet.getCell('F' + (j)).value < 0) {
										sheet.getCell('F' + (j)).font = {
											color: {
												argb: 'FF0000'
											},
											bold: true
										};
									} else {
										sheet.getCell('F' + (j)).font = {
											color: {
												argb: '000000'
											},
											bold: true
										};
									}

									//Column color code end


									sheet.getCell('A' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('B' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('C' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('D' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('E' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('F' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};
									sheet.getCell('G' + (j)).border = {
										top: {
											style: 'thin'
										},
										left: {
											style: 'thin'
										},
										bottom: {
											style: 'thin'
										},
										right: {
											style: 'thin'
										}
									};

									// code added by surya for autocolumn width - started
									//setting absolute length for column A
									if (j > "2") {
										if (sheet.getCell('A' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthA = sheet.getCell('A' + (j)).value.length;
											} else {
												if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
													colMaxLengthA = sheet.getCell('A' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('A').width = colMaxLengthA + 2;
										}
										//setting absolute length for column B
										if (sheet.getCell('B' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthB = sheet.getCell('B' + (j)).value.length;
											} else {
												if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
													colMaxLengthB = sheet.getCell('B' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('B').width = colMaxLengthB + 2;
										}
										//setting absolute length for column C
										if (sheet.getCell('C' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthC = sheet.getCell('C' + (j)).value.length;
											} else {
												if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
													colMaxLengthC = sheet.getCell('C' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('C').width = colMaxLengthC + 2;
										}
										//setting absolute length for column D
										if (sheet.getCell('D' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthD = sheet.getCell('D' + (j)).value.length;
											} else {
												if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
													colMaxLengthD = sheet.getCell('D' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('D').width = colMaxLengthD + 2;
										}
										//setting absolute length for column E
										if (sheet.getCell('E' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthE = sheet.getCell('E' + (j)).value.length;
											} else {
												if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
													colMaxLengthE = sheet.getCell('E' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('E').width = colMaxLengthE + 3;
										}
										//setting absolute length for column F
										if (sheet.getCell('F' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthF = sheet.getCell('F' + (j)).value.length;
											} else {
												if (sheet.getCell('F' + (j)).value.length > colMaxLengthF) {
													colMaxLengthF = sheet.getCell('F' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('F').width = colMaxLengthG + 6;
										}
										//setting absolute length for column G
										if (sheet.getCell('G' + (j)).value !== null) {
											if (j == "3") {
												colMaxLengthG = sheet.getCell('G' + (j)).value.length;
											} else {
												if (sheet.getCell('G' + (j)).value.length > colMaxLengthG) {
													colMaxLengthG = sheet.getCell('G' + (j)).value.length;
												}
											}
										}
										if (j == totText) {
											sheet.getColumn('G').width = colMaxLengthG + 8;
										}
									}
									// code added by surya for autocolumn width - ended

								}

							}
							// Start the excel instance
							var excel = require('exceljs');
							var workbook = new excel.Workbook();
							createTabForGroup("DayBook_Customers", entryFinals);
							var tempFilePath = reportType + '_' + currentdate.getDate() + (currentdate.getMonth() + 1) + currentdate.getFullYear() +
								currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds() + '.xlsx';

							res.setHeader(
								"Content-Type",
								"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							);
							res.setHeader(
								"Content-Disposition",
								"attachment; filename=" + tempFilePath
							);
							// console.log("came");
							return workbook.xlsx.write(res).then(function(data) {
								console.log(data);
								//res.writeHead(200, [['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
								//res.end(new Buffer(data, 'base64'));
								res.status(200).end();
							});


						}
					}

				} catch (e) {

				} finally {

				}
			});
		});


		// app.get('/getOrderNoForSale', function(req, res) {
		// 	var start = new Date(req.query.Date);
		// 	start.setHours(0, 0, 0, 0);
		//
		// 	var end = new Date(req.query.Date);
		// 	end.setHours(23, 59, 59, 999);
		// 	var OrderHeader = app.models.OrderHeader;
		// 	OrderHeader.find({
		// 			where: {
		// 				and: [{
		// 					Date: {
		// 						gt: start
		// 					}
		// 				}, {
		// 					Date: {
		// 						lt: end
		// 					}
		// 				}]
		// 			},
		// 			fields: {
		// 				"OrderNo": true,
		// 				"id": true
		// 			}
		// 		})
		// 		.then(function(orders) {
		// 			// debugger;
		// 			//sort the orders in descending order created today
		// 			if (orders.length > 0) {
		// 				//if there are/is order created today sort and get next order no
		// 				orders.sort(function(a, b) {
		// 					return b.OrderNo - a.OrderNo;
		// 				});
		//
		// 				//i am gonna create a new order only when the last order has at least one item inside
		// 				var oItem = app.models.OrderItem;
		// 				oItem.find({
		// 						where: {
		// 							"OrderNo": orders[0].id.toString()
		// 						}
		// 					})
		// 					.then(function(record) {
		// 						if (record.length > 0) {
		// 							//incrementing order no here --comes here when order has item
		// 							// debugger;
		// 							// ctx.instance.OrderNo = orders[0].OrderNo + 1;
		// 							res.send({
		// 								OrderNo: orders[0].OrderNo + 1
		// 							});
		// 							//telling system to go ahead and create new order with new no.
		// 							//next() --> it will go to framework and create a new data record
		// 							// next();
		// 						} else {
		// 							//do not do anything
		// 							// debugger;
		// 							// return next();
		// 							//ctx.res(ctx.instance.__data);
		// 							//return ctx.instance.__data;
		// 							// ctx.instance.OrderNo = orders[0].OrderNo;
		// 							// ctx.instance.__data.id = orders[0].id.toString();
		// 							res.statusCode = 401;
		// 							res.send("last order already empty use same:" + orders[0].id);
		// 							// next(new Error("last order already empty use same:" + orders[0].id));
		// 						}
		// 					});
		// 			} else {
		// 				//assign a fresh order no
		// 				//for wholesale, this becomes 251
		// 				// orderNo = 1;
		// 				res.send({
		// 					OrderNo: 1
		// 				});
		// 			}
		//
		// 		});
		// });




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
					}).then(function(records) {
						res.send({
							"msg": "All the records has been deleted successfully for the customer"
						});
					}).catch(function(err, ns) {
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
				case "Customer":
					var Customer = app.models.Customer;
					Customer.destroyAll({
						// "Customer": customerId
					}).then(function(records) {
						res.send({
							"msg": "All the records has been deleted successfully"
						});
					}).catch(function(err, ns) {
						;
					});
					break;
				case "EntryD":
					var Entry = app.models.Entry;
					Entry.destroyAll({
						// "Customer": customerId
					}).then(function(records) {
						res.send({
							"msg": "All the records has been deleted successfully from Entry Table"
						});
					}).catch(function(err, ns) {
						;
					});
					break;
				case "DelAll":
					var msg = "All records from All Tables Deleted";

					var Customer = app.models.Customer;
					Customer.destroyAll({}).then(function(records) {
						var Product = app.models.Product;
						Product.destroyAll({}).then(function(records) {
							var Entry = app.models.Entry;
							Entry.destroyAll({}).then(function(records) {
								var Booking = app.models.BookingDetail;
								Booking.destroyAll({}).then(function(records) {
									var OrderHeader = app.models.OrderHeader;
									OrderHeader.destroyAll({}).then(function(records) {
										var OrderItem = app.models.OrderItem;
										OrderItem.destroyAll({}).then(function(records) {
											var OrderReturn = app.models.OrderReturn;
											OrderReturn.destroyAll({}).then(function(records) {
												var WSOrderHeader = app.models.WSOrderHeader;
												WSOrderHeader.destroyAll({}).then(function(records) {
													var WSOrderItem = app.models.WSOrderItem;
													WSOrderItem.destroyAll({}).then(function(records) {
														var WSOrderReturn = app.models.WSOrderReturn;
														WSOrderReturn.destroyAll({}).then(function(records) {
															var Kacchi = app.models.Kacchi;
															Kacchi.destroyAll({}).then(function(records) {
																var CustomerOrder = app.models.CustomerOrder;
																CustomerOrder.destroyAll({}).then(function(records) {
																	var StockMaint = app.models.StockMaint;
																	StockMaint.destroyAll({}).then(function(records) {
																		res.send({
																			"msg": msg
																		});
																	}).catch(function(err, ns) {
																		;
																	});
																}).catch(function(err, ns) {
																	;
																});
															}).catch(function(err, ns) {
																;
															});
														}).catch(function(err, ns) {
															;
														});
													}).catch(function(err, ns) {
														;
													});
												}).catch(function(err, ns) {
													;
												});
											}).catch(function(err, ns) {
												;
											});
										}).catch(function(err, ns) {
											;
										});
									}).catch(function(err, ns) {
										;
									});
								}).catch(function(err, ns) {
									;
								});
							}).catch(function(err, ns) {
								;
							});
						}).catch(function(err, ns) {
							;
						});

						// res.send({
						// 	"msg": "All the records has been deleted successfully from Entry Table"
						// });
					}).catch(function(err, ns) {
						;
					});
					res.send({
						"msg": msg
					});
					break;
				default:

			}

		});

		app.post('/getTotalStockItems', function(req, res) {
			var matId = req.body.MaterialId;
			var StockItems = app.models.StockItems;
			StockItems.find({
				where: {
					"Material": matId
				}
			}).then(function(records) {
				var tQuantity = 0,
					tWeight = 0;
				for (var i = 0; i < records.length; i++) {
					tQuantity = tQuantity + records[i].Qty;
					tWeight = tWeight + records[i].Weight;
				}
				res.send({
					"QuantityTotal": tQuantity,
					"WeightTotal": tWeight
				});
			});
		});

		app.post('/getTotalBookingCustomer', function(req, res) {

			var customerId = req.body.myData.Customer;
			var typeId = req.body.myData.Type;
			var Booking = app.models.BookingDetail;
			Booking.find({
				where: {
					"Customer": customerId,
					"Type": typeId
				}
			}).then(function(records) {
				var tBQty = 0,
					tBPrice = 0,
					tBAvgPrice = 0,
					n = 0;
				for (var i = 0; i < records.length; i++) {
					tBQty = tBQty + records[i].Quantity;

					tBPrice = tBPrice + (records[i].Quantity * records[i].Bhav);

				}
				tBAvgPrice = tBPrice / tBQty;

				res.send({

					"BookedQtyTotal": tBQty,
					"BookedAvgPriceTotal": tBAvgPrice

				});
			});

		});
		app.post('/getTotalDeliveredCustomer', function(req, res) {

			var customerId = req.body.myData.Customer;
			var typeId = req.body.myData.Type;
			var Delivered = app.models.BookingDlvDetail;
			Delivered.find({
				where: {
					"Customer": customerId,
					"Type": typeId
				}
			}).then(function(records) {
				var tDQty = 0,
					tDPrice = 0,
					tDAvgPrice = 0,
					n = 0;
				for (var i = 0; i < records.length; i++) {
					tDQty = tDQty + records[i].Quantity;

					tDPrice = tDPrice + (records[i].Quantity * records[i].Bhav);
				}
				tDAvgPrice = tDPrice / tDQty;
				res.send({

					"DeliveredQtyTotal": tDQty,
					"DeliveredAvgPriceTotal": tDAvgPrice

				});
			});

		});

		app.post('/getTotalEntryCustomer', function(req, res) {

			var customerId = req.body.Customer;
			// var Date = req.body.Date;
			var min = req.body.min;

			if (customerId != "") {
				var Entry = app.models.Entry;
				Entry.find({
					where: {
						"Customer": customerId
						// "Date": min
					}
				}).then(function(records) {
					var tSilver = 0,
						tGold = 0,
						tCash = 0;
					for (var i = 0; i < records.length; i++) {
						tSilver = tSilver + records[i].Silver;
						tGold = tGold + records[i].Gold;
						tCash = tCash + parseFloat(records[i].Cash);
					}

					res.send({
						"SilverTotal": tSilver,
						"GoldTotal": tGold,
						"CashTotal": tCash
					});
				});
			} else {
				var Entry = app.models.Entry;
				Entry.find({
					where: {
						// "Customer": customerId,
						"Date": new Date(min)
					}
				}).then(function(records) {
					var tSilver = 0,
						tGold = 0,
						tCash = 0;
					for (var i = 0; i < records.length; i++) {
						tSilver = tSilver + records[i].Silver;
						tGold = tGold + records[i].Gold;
						tCash = tCash + parseFloat(records[i].Cash);
					}

					res.send({
						"SilverTotal": tSilver,
						"GoldTotal": tGold,
						"CashTotal": tCash
					});
				});
			}

		});



		app.post('/getTotalEntryCustomerBetween', function(req, res) {

			var customerId = req.body.Customer;
			var Entry = app.models.Entry;
			var min = req.body.min;
			var max = req.body.max;
			if (customerId != "") {
				Entry.find({
					where: {
						"Customer": customerId,
						"Date": {
							between: [new Date(min), new Date(max)]
						}
					}
				}).then(function(records) {
					var tSilver = 0,
						tGold = 0,
						tCash = 0;
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
			} else {
				Entry.find({
					where: {
						// "Customer": customerId,
						"Date": {
							between: [new Date(min), new Date(max)]
						}
					}
				}).then(function(records) {
					var tSilver = 0,
						tGold = 0,
						tCash = 0;
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

			}
		});



		app.post('/getTotalStockProduct', function(req, res) {

			var productId = req.body.Product;
			var StockMaint = app.models.stockMaint;
			StockMaint.find({
				where: {
					"Product": productId
				}
			}).then(function(records) {
				var tQuantity = 0,
					tWeight = 0;
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
		app.post('/EntryTransfer', function(req, res) {

			var date = new Date(JSON.parse(JSON.stringify(req.body.entryData.Date)));
			var orderNo = req.body.entryData.OrderNo;
			var customer = req.body.entryData.Customer;
			var Entry = app.models.Entry;
			Entry.find({
					where: {
						"Date": date,
						"Customer": customer,
						"OrderType": 'R'
					},
					fields: {
						"Customer": true,
						"Cash": true,
						"OrderNo": true,
						"id": true
					}
				})
				.then(function(entry) {

					for (var i = 0; i < entry.length; i++) {
						if (entry[i].OrderNo === orderNo) {
							res.send({
								"OrderNo": entry[i].OrderNo,
								"Cash": entry[i].Cash,
								"Customer": entry[i].Customer.toString(),
								"id": entry[i].id.toString()
							});
						}
					}
				})
		});
		app.post('/previousOrder', function(req, res) {

			var OrderHeader = app.models.OrderHeader;
			var start = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
			start.setHours(0, 0, 0, 0);

			var end = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
			end.setHours(23, 59, 59, 999);
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
						fields: {
							"OrderNo": true,
							"Customer": true,
							"id": true
						}
					})
					.then(function(orders) {
						//sort the orders in descending order created today
						if (orders.length > 0) {
							//if there are/is order created today sort and get next order no
							orders.sort(function(a, b) {
								return b.OrderNo - a.OrderNo;
							});
							res.send({
								"OrderNo": orders[0].OrderNo,
								"Customer": orders[0].Customer.toString(),
								"id": orders[0].id.toString()
							});
						}
					});

			} else {

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
							}, {
								OrderNo: {
									lt: orderNo
								}
							}]
						},
						fields: {
							"OrderNo": true,
							"Customer": true,
							"id": true
						}
					})
					.then(function(orders) {

						//sort the orders in descending order created today
						if (orders.length > 0) {
							//if there are/is order created today sort and get next order no
							orders.sort(function(a, b) {
								return b.OrderNo - a.OrderNo;
							});
							//if there are/is order created today sort and pass the previous order no
							res.send({
								"OrderNo": orders[0].OrderNo,
								"Customer": orders[0].Customer,
								"id": orders[0].id.toString()
							});
						}
					});
			}

		}); //previous order
		//function to get next order
		app.post('/nextOrder', function(req, res) {

			var OrderHeader = app.models.OrderHeader;
			var start = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
			start.setHours(0, 0, 0, 0);

			var end = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
			end.setHours(23, 59, 59, 999);
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
						fields: {
							"OrderNo": true,
							"Customer": true,
							"id": true
						}
					})
					.then(function(orders) {
						//sort the orders in descending order created today
						if (orders.length > 0) {
							res.send({
								"OrderNo": orders[0].OrderNo,
								"Customer": orders[0].Customer.toString(),
								"id": orders[0].id.toString()
							});
						}
					});

			} else {

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
							}, {
								OrderNo: {
									gt: orderNo
								}
							}]
						},
						fields: {
							"OrderNo": true,
							"Customer": true,
							"id": true
						}
					})
					.then(function(orders) {

						if (orders.length > 0) {
							//if there are/is order created today pass next order no
							res.send({
								"OrderNo": orders[0].OrderNo,
								"Customer": orders[0].Customer.toString(),
								"id": orders[0].id.toString()
							});
						}
					});
			}
		}); //next order

		app.post('/StockDelete', function(req, res) {

			var date = new Date(JSON.parse(JSON.stringify(req.body.Stock.Date)));
			var materialId = req.body.Stock.Product;
			var orderNo = req.body.Stock.OrderItemId;
			var Stock = app.models.stockMaint;

			Stock.find({
					where: {
						"OrderItemId": orderNo
					},
					fields: {
						"Product": true,
						"Quantity": true,
						"Weight": true,
						"OrderItemId": true,
						"id": true
					}
				})
				.then(function(Stock) {

					res.send({
						"Product": Stock[0].Product.toString(),
						"Quantity": Stock[0].Quantity,
						"Weight": Stock[0].Weight,
						"id": Stock[0].id.toString()
					});
				});
		}); //StockDelete
		app.post('/previousWSOrder', function(req, res) {

			var WSOrderHeader = app.models.WSOrderHeader;
			var start = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
			start.setHours(0, 0, 0, 0);

			var end = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
			end.setHours(23, 59, 59, 999);
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
						fields: {
							"OrderNo": true,
							"Customer": true,
							"id": true
						}
					})
					.then(function(orders) {
						//sort the orders in descending order created today
						if (orders.length > 0) {
							//if there are/is order created today sort and get next order no
							orders.sort(function(a, b) {
								return b.OrderNo - a.OrderNo;
							});
							res.send({
								"OrderNo": orders[0].OrderNo,
								"Customer": orders[0].Customer.toString(),
								"id": orders[0].id.toString()
							});
						}
					});

			} else {

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
							}, {
								OrderNo: {
									lt: orderNo
								}
							}]
						},
						fields: {
							"OrderNo": true,
							"Customer": true,
							"id": true
						}
					})
					.then(function(orders) {

						//sort the orders in descending order created today
						if (orders.length > 0) {
							//if there are/is order created today sort and get next order no
							orders.sort(function(a, b) {
								return b.OrderNo - a.OrderNo;
							});
							//if there are/is order created today sort and pass the previous order no
							res.send({
								"OrderNo": orders[0].OrderNo,
								"Customer": orders[0].Customer,
								"id": orders[0].id.toString()
							});
						}
					});
			}

		});



		app.get('/VictoriaBackup', function(req, res) {

			// const zipfile = archiver('zip');
			var backup = require('mongodb-backup');
			var path11 = require('path');
			var exec = require('child_process').exec;
			const zipFolder = require("zip-folder");
			const config = require('./config.json');
			const path = __dirname;
			const download = require('downloadjs');
			const path1 = path.split("project")[0];
			const path2 = path1 + "\project\\dump\\test";
			var options = {
				root: path11.join(__dirname + "\\zip")
			};

			try {
				// function takeMongoBackup() {


				var nrc = require('node-run-cmd');
				nrc.run('mongodump --uri' + '=' + '"mongodb://anurag:6oLWjE9MUhHKzbwP@cluster0-shard-00-00-gnqvx.mongodb.net:27017,cluster0-shard-00-01-gnqvx.mongodb.net:27017,cluster0-shard-00-02-gnqvx.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"');
				//remove directory
				// rimraf.sync(config.DB_OPTIONS.database);

				//backup mongo
				const uri1 = 'mongodb://anurag:6oLWjE9MUhHKzbwP@cluster0-shard-00-00-gnqvx.mongodb.net:27017,cluster0-shard-00-01-gnqvx.mongodb.net:27017,cluster0-shard-00-02-gnqvx.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
				const cmd = 'mongodump --uri' + '=' + '"mongodb://anurag:6oLWjE9MUhHKzbwP@cluster0-shard-00-00-gnqvx.mongodb.net:27017,cluster0-shard-00-01-gnqvx.mongodb.net:27017,cluster0-shard-00-02-gnqvx.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"';
				// Command for mongodb dump process

				console.log("DB backup started ... ");
				console.log(cmd);
				exec(cmd, function(error, stdout, stderr) {
					if ((res)) {
						console.log("DB backup generated ... ");

						function formatDateForEntry(date) {
							var d = new Date(date),
								month = '' + (d.getMonth() + 1),
								day = '' + d.getDate(),
								year = d.getFullYear();

							if (month.length < 2)
								month = '0' + month;
							if (day.length < 2)
								day = '0' + day;

							return [day, month, year].join('.');
						}
						var date1 = new Date();
						var date = formatDateForEntry(date1);
						var tempFilePath = "victoria-" + date + ".zip";
						var v1 = __dirname + "//zip" + "/" + tempFilePath

						zipFolder(

							path2,
							// __dirname + "test" + ".zip",
							__dirname + "//zip" + "/" + tempFilePath,
							function(err) {
								if (err) {
									console.log("Zip error ... ");
									console.log("oh no!", err);
								} else {

									res.setHeader('Content-Type', 'application/zip');
									res.setHeader(
										"Content-Disposition",
										"attachment; filename=" + tempFilePath
									);


									res.sendFile(tempFilePath, options);
									// res.end();
									console.log("Backup zipped successful");

								}
							}
						);
					}
				});
			} catch (res) {
				//
			}

		})







		// var mongo = require('mongodb');
		// var mongoose = require('mongoose');
		//
		// var Grid = require('gridfs-stream');
		// const mongoURI = 'mongodb://anurag:6oLWjE9MUhHKzbwP@cluster0.gnqvx.mongodb.net/design?retryWrites=true&w=majority';
		// const conn = mongoose.createConnection(mongoURI);
		// let gfs
		// conn.once('open',()=>{
		// 	gfs = Grid(conn.db,mongoose.mongo);
		// 	gfs.collecion('uploads');
		// })
		//
		// const storage = new GridFsStorage({
		// 	url:mongoURI,
		// 	file:(req,res)=>{
		// 		return new Promise((resolve,reject)=>{
		// 			crypto.randomBytes(16,(err,buf)=>{
		// 				if(err){
		// 					return reject(err);
		// 				}
		// 				const filename = buf.toString('hex') + path.extname(file.originalname);
		// 				const fileInfo = {
		// 					filename : filename,
		// 					bucketName  :'uploads'
		// 				};
		// 				resolve(fileInfo);
		// 			});
		// 		});
		// 	}
		// });

		// const upload = multer({storage});

		// app.post('/VictoriaGFS',upload.single('file'),(req,res)=>{
		//
		//
		// res.setHeader('Content-Type', 'application/zip');
		// res.setHeader(
		// 	"Content-Disposition",
		// 	"attachment; filename=" + req.files.file.name
		// );



		// res.json({file:req.files.file});
		// res.json({file:req.files.file.data});
		// res.redirect('/');
		//
		//
		//
		// })




		app.get('/files', (req, res) => {

			gfs.files.find().toArray((err, files) => {
				if (!files || files.length === 0) {
					return res.status(404).json({
						err: 'No files exist'
					});
				}
				return res.json(files);
			});
		});

		// const port =5000;

		//previous order
		//function to get next order
		app.post('/nextWSOrder', function(req, res) {

			var WSOrderHeader = app.models.WSOrderHeader;
			var start = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
			start.setHours(0, 0, 0, 0);

			var end = new Date(JSON.parse(JSON.stringify(req.body.OrderDetails.Date)));
			end.setHours(23, 59, 59, 999);
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
						fields: {
							"OrderNo": true,
							"Customer": true,
							"id": true
						}
					})
					.then(function(orders) {
						//sort the orders in descending order created today
						if (orders.length > 0) {
							res.send({
								"OrderNo": orders[0].OrderNo,
								"Customer": orders[0].Customer.toString(),
								"id": orders[0].id.toString()
							});
						}
					});

			} else {

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
							}, {
								OrderNo: {
									gt: orderNo
								}
							}]
						},
						fields: {
							"OrderNo": true,
							"Customer": true,
							"id": true
						}
					})
					.then(function(orders) {

						if (orders.length > 0) {
							//if there are/is order created today pass next order no
							res.send({
								"OrderNo": orders[0].OrderNo,
								"Customer": orders[0].Customer.toString(),
								"id": orders[0].id.toString()
							});
						}
					});
			}
		}); //next order
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
