/*global location*/
sap.ui.define([
	"victoria/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"victoria/models/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/Dialog"
], function(BaseController, JSONModel, formatter, MessageToast, MessageBox, Dialog) {
	"use strict";
	return BaseController.extend("victoria.controller.sales", {
		formatter: formatter,
		//global Variables
		orderAmount: 0,
		finalBal: 0,
		settings: false,
		noChange: {
			index: 0,
			flag: "true"
		},
		noChangeTable: [],
		headerNoChange: false,
		//return no Change
		noChangeReturn: false,
		valueChange: false,

		onInit: function(oEvent) {
			BaseController.prototype.onInit.apply(this);
			var oRouter = this.getRouter();
			oRouter.getRoute("sales").attachMatched(this._onRouteMatched, this);
			this.byId("idRetailTransfer").setEnabled(false);
			var that = this;
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			loginUser = "Hey " + loginUser;
			this.getView().byId("idUser").setText(loginUser);
		},
		_onRouteMatched: function(oEvent) {
			var that = this;
			var id = "";
			this.onClear(oEvent, id);
			this.getPrintCustHeaderData();
			setTimeout(function() {
				$("input[type='Number']").focus(function() {
					$(this).select();
				});
			}, 3000);
		},

		getPrintCustHeaderData: function() {
			var that = this;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/prints", "GET", {}, {}, this)
				.then(function(oData) {
					var printHeadData = that.getView().getModel("local").getProperty("/printCustomizing");
					for (var i = 0; i < oData.results.length; i++) {
						switch (oData.results[i].Name) {
							case "__component0---idPrint--idAdd":
								printHeadData.Address = oData.results[i].Value;
								break;
							case "__component0---idPrint--idCompName":
								printHeadData.CompName = oData.results[i].Value;
								break;
							case "__component0---idPrint--idTnC":
								printHeadData.TnC = oData.results[i].Value;
								break;
							case "__component0---idPrint--idgstn":
								printHeadData.GSTNumber = oData.results[i].Value;
								break;
							case "__component0---idPrint--idContNo":
								printHeadData.ContNumber = oData.results[i].Value;
								break;
							case "__component0---idPrint--idMarking":
								printHeadData.Marking = oData.results[i].Value;
								break;
							default:
						}
					};
					that.getView().getModel("local").setProperty("/printCustomizing", printHeadData);

				}).catch(function(oError) {});
		},
		getIndianCurr: function(value) {

			if (value) {
				var x = value;
				x = x.toString();
				var decimal = x.split('.', 2)
				x = decimal[0];
				var lastThree = x.substring(x.length - 3);
				var otherNumbers = x.substring(0, x.length - 3);
				if (otherNumbers != '')
					lastThree = ',' + lastThree;
				if (decimal[1]) {
					var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + '.' + decimal[1].match(/\d{0,2}/);
				} else {
					var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
				}
				return res;
			}
		},
		//retail Transfer
		onTransfer: function(oEvent) {

			var that = this;
			var oLocale = new sap.ui.core.Locale("en-US");
			var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
			var orderDetail = this.getView().getModel('local').getProperty('/orderHeader');
			var orderHeaderT = this.getView().getModel('local').getProperty('/orderHeaderTemp');
			var finalAmount = oFloatFormat.parse(orderHeaderT.FinalBalance);
			var custId = orderDetail.Customer;
			var orderNo = orderHeaderT.OrderId;
			var date = new Date(orderDetail.Date);
			var postedEntryData = that.getView().getModel('local').getProperty('/EntryData');

			if (postedEntryData.Cash === finalAmount) {
				var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("noAmountToTransfer");
				MessageBox.show(
					oBundle, {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {}
					}
				);
			} else if (((postedEntryData.Cash !== "") &&
					(postedEntryData.Cash !== "0") &&
					(postedEntryData.Cash !== 0)) &&
				(finalAmount) &&
				(finalAmount !== "" || finalAmount !== 0) &&
				(that.byId("Sales--idSaveIcon").getColor() === 'green') &&
				(postedEntryData.Cash !== finalAmount)) {

				var entryData = this.getView().getModel("local").getProperty("/EntryData");
				entryData.Date = new Date(orderDetail.Date);
				entryData.OrderNo = orderHeaderT.OrderId;
				entryData.OrderType = 'R';
				var date = this.getView().byId("Sales--DateId").getDateValue();
				entryData.Remarks = "[Auto-Entry]Retail Transfer for Order" + "" +
					orderDetail.OrderNo + " " + date;
				var id = postedEntryData.id;
				entryData.Cash = 0 - finalAmount;
				entryData.Customer = orderDetail.Customer;
				entryData.ChangedBy = "";
				entryData.ChangedOn = "";
				entryData.CreatedBy = "";
				entryData.CreatedOn = "";
				//change in final amount
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/Entrys('" + id + "')",
						"PUT", {}, entryData, this)
					.then(function(oData) {
						var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("TransferAmountUpdated");
						MessageToast.show(oBundle);
					})
			} else
			if ((postedEntryData.Cash === "" ||
					postedEntryData.Cash === "0" ||
					postedEntryData.Cash === 0) &&
				(that.byId("Sales--idSaveIcon").getColor() === 'green') &&
				(finalAmount) && (finalAmount !== "" || finalAmount !== 0)) {
				that.getView().setBusy(true);
				var entryData = this.getView().getModel("local").getProperty("/EntryData");
				entryData.Date = orderDetail.Date;
				// entryData.OrderNo = orderDetail.OrderNo;
				entryData.OrderNo = orderHeaderT.OrderId;
				entryData.OrderType = 'R';
				var date = this.getView().byId("Sales--DateId").getDateValue();
				entryData.Remarks = "[Auto-Entry]Retail Transfer for Order" + "" +
					orderDetail.OrderNo + " " + date;
				//orderDetail.Date;
				entryData.Cash = 0 - finalAmount;
				entryData.Customer = orderDetail.Customer;
				entryData.ChangedBy = "";
				entryData.ChangedOn = "";
				entryData.CreatedBy = "";
				entryData.CreatedOn = "";
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Entrys",
						"POST", {}, entryData, this)
					.then(function(oData) {
						that.getView().setBusy(false);
						sap.m.MessageToast.show("Data Transferred Successfully");
					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
					});

			} else if ((!finalAmount) && (finalAmount === "" || finalAmount === 0)) {
				var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("noAmountToTransfer");
				MessageBox.show(
					oBundle, {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {}
					}
				);
			} else {
				var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("saveBeforeTransfer");
				MessageBox.show(
					oBundle, {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {}
					}
				);
			}

		},
		//customer value help
		valueHelpCustomer: function(oEvent) {

			this.getCustomerPopup(oEvent);
		},

		onEnter: function(oEvent) {
			this.getCustomer(oEvent);
		},
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},
		// getPrintCustData: function(){
		//   this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
		//       "/prints", "GET", {}, {}, this)
		//     .then(function(oData) {
		//
		//       // that.getView().setBusy(false);
		//       // if(oData.results.length > 0){
		//
		//     }).catch(function(oError) {
		//   });
		// },
		onPrint: function() {

			var that = this;

			// var allItems = this.getView().getModel("local").getProperty("/printCustomizingData");
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/prints", "GET", {}, {}, this)
				.then(function(oData) {

					that.retailPrint(oData);
					// that.getView().getModel("local").setProperty("/printCustomizingData",oData);

				}).catch(function(oError) {});
		},
		retailPrint: function(oData) {

			var arrayRemoveFromPrint = [];
			var hideHeaderContents = [];
			var orderHeader = this.getView().getModel("local").getProperty("/orderHeaderTemp"); // Cust Id/Name
			var orderDetails = this.getView().getModel('local').getProperty("/orderHeader"); //order no/date/Gold/Silver Bhav
			var printCustHeadVal = this.getView().getModel("local").getProperty("/printCustomizing"); //print cust view header details
			if (orderDetails.Date) {
				var orderLocDate = orderDetails.Date
			}else{
				orderLocDate = new Date();
			}
			if(typeof(orderLocDate) === "string"){
				var dd = parseInt(orderLocDate.split("-")[2]);
				var mm = parseInt(orderLocDate.split("-")[1]);
				var yyyy = parseInt(orderLocDate.split("-")[0]);
				if (dd < 10) {
					dd = '0' + dd;
				}
				if (mm < 10) {
					mm = '0' + mm;
				}
				var orderDate = dd + '.' + mm + '.' + yyyy;
			}else{
				var dd = orderLocDate.getDate();
				var mm = orderLocDate.getMonth() + 1;
				var yyyy = orderLocDate.getFullYear();
				if (dd < 10) {
					dd = '0' + dd;
				}
				if (mm < 10) {
					mm = '0' + mm;
				}
				var orderDate = dd + '.' + mm + '.' + yyyy;
			}
			if (orderDetails.Customer) {
				var custId = orderDetails.Customer;
				var cusData = this.allMasterData.customers[custId];
				// console.log(cusData);
				// cusData.City = this.allMasterData.cities[custId].cityName;
				// console.log(cusData);
			}
			var printDate = formatter.getFormattedDate(0);
			var rCompName, rAddress, rContNumber, rGSTNumber, rEstimate, rWeight, rBhav, rSubtotal, title, rTnC, rMarking;
			for (var i = 0; i < oData.results.length; i++) {
				switch (oData.results[i].Name) {
					case "__component0---idPrint--idRCompName":
						if (oData.results[i].Value === "true") {
							rCompName = printCustHeadVal.CompName;
						} else {
							arrayRemoveFromPrint.push('idRCompName');
						}
						break;
					case "__component0---idPrint--idRAddress":
						if (oData.results[i].Value === "true") {
							rAddress = printCustHeadVal.Address;
						} else {
							arrayRemoveFromPrint.push('idRAddress');
						}
						break;
					case "__component0---idPrint--idContNo":
						if (oData.results[i].Value === "true") {
							rContNumber = printCustHeadVal.ContNumber;
						} else {
							arrayRemoveFromPrint.push('idRPhoneNumber');
						}
						break;
					case "__component0---idPrint--idRGSTN":
						if (oData.results[i].Value === "true") {
							rGSTNumber = printCustHeadVal.GSTNumber;
						} else {
							arrayRemoveFromPrint.push('idRGSTN');
						}
						break;
					case "__component0---idPrint--idRWeight":

						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRWeight');
						}
						break;
					case "__component0---idPrint--idREstimate":
						if (oData.results[i].Value === "true") {
							title = "Estimate";
						} else {
							title = "Invoice";
						}
						break;
					case "__component0---idPrint--idRSubTotal":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRSubTotal');
						}
						break;
					case "__component0---idPrint--idRBhav":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRBhav');
						}
						break;
					case "__component0---idPrint--idRMakingCharge":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRMakingCharge');
						}
						break;
					case "__component0---idPrint--idRTnC":
						if (oData.results[i].Value === "true") {
							rTnC = printCustHeadVal.TnC;
						} else {
							arrayRemoveFromPrint.push('idRTnC');
						}
						break;
					case "__component0---idPrint--idRMarking":
						if (oData.results[i].Value === "true") {
							rMarking = printCustHeadVal.Marking;
						} else {
							arrayRemoveFromPrint.push('idRMarking');
						}
						break;
					case "__component0---idPrint--idRQuantity":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRQuantity');
						}
						break;
					case "__component0---idPrint--idRReturnWeight":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRReturnWeight');
						}
						break;
					case "__component0---idPrint--idRReturnBhav":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRReturnBhav');
						}
						break;
					case "__component0---idPrint--idRWeightD":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRWeightD');
						}
						break;
					case "__component0---idPrint--idRQuantityD":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRQuantityD');
						}
						break;
					case "__component0---idPrint--idRMakingChargeD":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRMakingChargeD');
						}
						break;
					case "__component0---idPrint--idRRemarks":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRRemarks');
						}
						break;
					case "__component0---idPrint--idRReturnRemarks":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRReturnRemarks');
						}
						break;
					case "__component0---idPrint--idRReturnKattaWeight":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRReturnKattaWeight');
						}
						break;
					case "__component0---idPrint--idRReturnTunch":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRReturnTunch');
						}
						break;
					case "__component0---idPrint--idRReturnSubTotal":
						if (oData.results[i].Value === "false") {
							arrayRemoveFromPrint.push('idRReturnSubTotal');
						}
						default:
				}
			}
			var header = '<h2 style="text-align: center;"><strong>' + title + '</strong></h2><hr />' +
				'<table style="display: inline-block; float: left; width: 450px; height: 100px;">' +
				'<tbody>' +
				'<tr>' +
				'<td class="idRCompName" style="width: 150px; height: 13.5px;"><strong>Company Name</strong></td>' +
				'<td class="idRCompName" style="width: 300px; height: 13.5px;">' + rCompName + '</td>' +
				'</tr>' +
				'<tr>' +
				'<td class="idRAddress" style="width: 150px; height: 13px;"><strong>Address</strong></td>' +
				'<td class="idRAddress" style="width: 300px; height: 13px;">' + rAddress + '</td>' +
				'</tr>' +
				'<tr>' +
				'<td class="idRPhoneNumber" style="width: 150px; height: 13px;"><strong>Ph No</strong></td>' +
				'<td class="idRPhoneNumber" style="width: 300px; height: 13px;">' + rContNumber + '</td>' +
				'</tr>' +
				'<tr>' +
				'<td class="idRGSTN" style="width: 150px; height: 13px;"><strong>GSTN</strong></td>' +
				'<td class="idRGSTN" style="width: 300px; height: 13px;">' + rGSTNumber + '</td>' +
				'</tr>' +
				'</tbody>' +
				'</table>' +
				'<table style="display: inline-block; width: 500px; height: 100px;">' +
				'<tbody>' +
				'<tr>' +
				'<td style="width: 150px;"><strong>Customer Name</strong></td>' +
				'<td style="width: 350px;">' + orderHeader.CustomerName + '</td>' +
				'</tr>' +
				'<tr>' +
				'<td style="width: 150px;"><strong>City</strong></td>' +
				'<td style="width: 350px;">' + this.allMasterData.cities[cusData.City].cityName + '</td>' +
				'</tr>' +
				'<tr>' +
				'<td style="width: 150px;"><strong>Customer Contact</strong></td>' +
				'<td style="width: 350px;">' + cusData.MobilePhone + '</td>' +
				'</tr>' +
				'<tr>' +
				'<td style="width: 150px;"><strong>Print Date</strong></td>' +
				'<td style="width: 350px;">' + printDate + '</td>' +
				'</tr>' +
				'</tbody>' +
				'</table>' +
				'<hr />' +
				'<table style="width: 900px;">' +
				'<tbody>' +
				'<tr>' +
				'<td style="width: 160px;"><strong>Invoice Number</strong></td>' +
				'<td style="width: 300px;">&nbsp;' + orderDetails.OrderNo + '</td>' +
				'<td style="width: 150px;"><strong>Date</strong></td>' +
				'<td style="width: 270px;">&nbsp;' + orderDate + '</td>' +
				'</tr>' +
				'</tbody>' +
				'</table>' +
				'<hr />';

			// Prepare Order table header
			var table =
				"<table style='border-collapse: collapse;border:1px solid black;'width='95%'';'text-align:center';'border-spacing: 5px';>" +
				// '<tbody>'+
				'<tr>' +
				'<th style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">&nbsp;Material</h4></th>' +
				// '<th style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">&nbsp;Description</h4></th>'+
				'<th class="idRQuantity" style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">&nbsp;Qty</h4></th>' +
				'<th class="idRQuantityD" style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">&nbsp;QtyD</h4></th>' +
				'<th class="idRWeight" style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">Weight</h4></th>' +
				'<th class="idRWeightD" style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">WeightD</h4></th>' +
				'<th class="idRMakingCharge" style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">Making</h4></th>' +
				'<th class="idRMakingChargeD" style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">MakingD</h4></th>' +
				'<th class="idRRemarks" style="width: 80px;border: 1px solid black"><h4 style="text-align: center;">Remarks</h4></th>' +
				'<th class="idRSubTotal" style="width: 80px;border: 1px solid black"><h4 style="text-align: center;">Sub Total</h4></th>' +
				'</tr>';
			// '</tbody>';
			// Order Table Line Items
			var oTableDetails = this.getView().byId('orderItemBases');
			var oBinding = oTableDetails.getBinding("rows");
			var totalQuantity = 0;
			var totalWeight = 0;
			var sumOfSubTotal = 0.00;
			for (var i = 0; i < oBinding.getLength(); i++) {
				if (oBinding.oList[i].MaterialCode) {
					totalQuantity = totalQuantity + oBinding.oList[i].Qty;
					totalWeight = totalWeight + oBinding.oList[i].Weight;
					var matDesc = oBinding.oList[i].MaterialCode.concat('-', oBinding.oList[i].Description);
					if(oBinding.oList[i].Remarks === undefined){
						oBinding.oList[i].Remarks = "  ";
					}
					table += '<tr>';
					table += '<td style="width: 80px;border: 1px solid black;">&nbsp;' + matDesc + '</td>' +
						// '<td style="width: 80px;border: 1px solid black;">&nbsp;'+oBinding.oList[i].Description+'</td>'+
						'<td class="idRQuantity" style="width: 80px;border: 1px solid black;">&nbsp;' + oBinding.oList[i].Qty + '</td>' +
						'<td class="idRQuantityD" style="width: 80px;border: 1px solid black;">&nbsp;' + oBinding.oList[i].QtyD + '</td>' +
						'<td class="idRWeight" style="width: 80px;border: 1px solid black;">&nbsp;' + oBinding.oList[i].Weight + '</td>' +
						'<td class="idRWeightD" style="width: 80px;border: 1px solid black;">&nbsp;' + oBinding.oList[i].WeightD + '</td>' +
						'<td class="idRMakingCharge" style="width: 80px;border: 1px solid black;">&nbsp;' + oBinding.oList[i].Making + '</td>' +
						'<td class="idRMakingChargeD" style="width: 80px;border: 1px solid black;">&nbsp;' + oBinding.oList[i].MakingD + '</td>' +
						'<td class="idRRemarks" style="width: 80px;border: 1px solid black;">&nbsp;' + oBinding.oList[i].Remarks + '</td>' +
						'<td class="idRSubTotal" style="width: 80px;border: 1px solid black;s">&nbsp;' + oBinding.oList[i].SubTotal + '</td></tr>';
				}
			}
			// table for order totals
			table += '<tr>' + '<td style="width: 80px;">&nbsp;</td>' +
				// '<td style="width: 80px;">&nbsp;</td>'+
				'<td class="idRQuantity" style="width: 80px;"><strong>&nbsp;' + totalQuantity + '</strong></td>' +
				'<td class="idRQuantityD" style="width: 80px;">&nbsp;</td>' +
				'<td class="idRWeight" style="width: 80px;"><strong>&nbsp;' + totalWeight + '</strong></td>' +
				'<td class="idRWeightD" style="width: 80px;">&nbsp;</td>' +
				'<td class="idRMakingCharge" style="width: 80px;">&nbsp;</td>' +
				'<td class="idRMakingChargeD" style="width: 80px;">&nbsp;</td>' +
				'<td class="idRRemarks" style="width: 80px;">&nbsp;</td>' +
				'<td class="idRSubTotal" style="width: 80px;"><strong>&nbsp;' + orderHeader.TotalOrderValue + '</strong></td></tr>';

			// Return table
			var oReturns = this.getView().getModel("returnModel").getProperty("/TransData");
			if (oReturns[0].Type) {
				table +=
					"<table style='border-collapse: collapse;border:1px solid black;'width='95%'';'text-align:center';'border-spacing: 5px';>" +
					'<tr>' +
					'<th style="width: 80px;border:1px solid black"><h4 style="text-align: center;">&nbsp;Product Type</h4></th>' +
					'<th class="idRReturnQuantity" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">&nbsp;Quantity</h4></th>' +
					'<th class="idRReturnWeight"   style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Weight</h4></th>' +
					'<th class="idRReturnKattaWeight"   style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Katta Weight</h4></th>' +
					'<th class="idRReturnTunch"   style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Tunch(%)</h4></th>' +
					'<th class="idRReturnBhav" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Return Bhav</h4></th>' +
					'<th class="idRReturnRemarks" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Return Remarks</h4></th>' +
					'<th class="idRReturnSubTotal" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Sub Total</h4></th>' +
					'</tr>' +
					'<p><h3>Returns:</h3></p>';
				for (var i = 0; i < oReturns.length; i++) {

					if (oReturns[i].Type) {
						var retTotQuant = retTotQuant + oReturns[i].Qty;
						var retTotWeight = retTotWeight + oReturns[i].Weight;
						var remark=oReturns[i].Remarks ? oReturns[i].Remarks : '';
						table += '<tr>';
						table += '<td  style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].Type + '</td>' +
							'<td  class="idRReturnQuantity" style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].Qty + '</td>' +
							'<td  class="idRReturnWeight"   style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].Weight + '</td>' +
							'<td  class="idRReturnKattaWeight"   style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].KWeight + '</td>' +
							'<td  class="idRReturnTunch"   style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].Tunch + '</td>' +
							'<td  class="idRReturnBhav"     style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].Bhav + '</td>' +
							'<td  class="idRReturnRemarks"     style="width: 80px;border:1px solid black">&nbsp;' + remark + '</td>' +
							'<td  class="idRReturnSubTotal" style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].SubTotal + '</td></tr>';
					}
				}

				table += '<tr>' + '<td style="width: 80px;"><strong>&nbsp;Final Balance</strong></td>' +
					'<td class="idRReturnQuantity" style="width: 80px;">&nbsp;' + '</td>' +
					'<td class="idRReturnWeight" style="width: 80px;">&nbsp;</td>' +
					'<td class="idRReturnKattaWeight" style="width: 80px;">&nbsp;</td>' +
					'<td class="idRReturnTunch" style="width: 80px;">&nbsp;</td>' +
					'<td class="idRReturnBhav" style="width: 80px;">&nbsp;</td>' +
					'<td class="idRReturnRemarks" style="width: 80px;">&nbsp;</td>' +
					'<td class="idRReturnSubTotal" style="width: 80px;"><strong>&nbsp;' + orderHeader.FinalBalance + '</strong></td></tr>';

			}
			table += '</table>';
			var footer = '<table style="height: 40px; width: 950px;">' +
				'<tbody>' +
				'<tr>' +
				'<td class="idRTnC" style="width: 150px;"><strong>Terms &amp; Conditions:</strong></td>' +
				'<td class="idRTnC" style="width: 800px;">&nbsp;' + rTnC + '</td>' +
				'</tr>' +
				'<tr>' +
				'<td class="idRMarking" style="width: 150px;">&nbsp;<strong>Marking:</strong></td>' +
				'<td class="idRMarking" style="width: 800px;">&nbsp;' + rMarking + '</td>' +
				'</tr>' +
				'</tbody></table>';

			var random = Math.floor(Math.random() * 10000);
			var myWindows = window.open("", "PrintWindow" + random, "width=1200,height=800");
			myWindows.document.write(header + table + footer);
			for (var i = 0; i < arrayRemoveFromPrint.length; i++) {
				var coll = myWindows.document.getElementsByClassName(arrayRemoveFromPrint[i]);
				for (var j = 0; j < coll.length; j++) {
					coll[j].style.display = "none";
				}
			}
			myWindows.document.close();
			myWindows.focus();
			setTimeout(function() {
				myWindows.print();
				myWindows.stop();
			}, 1500);

			// var random = Math.floor(Math.random()*10000);
			// var myWindows = window.open("", "PrintWindow" + random, "width=1200,height=800");
			// myWindows.document.write(header + table + footer);
			// for (var i = 0; i < arrayRemoveFromPrint.length; i++) {
			// 	var coll = myWindows.document.getElementsByClassName(arrayRemoveFromPrint[i]);
			// 	for (var j = 0; j < coll.length; j++) {
			// 		coll[j].style.display = "none";
			// 	}
			// }
			// myWindows.document.close();
			// myWindows.focus();
			// setTimeout(function() {
			// 	myWindows.print();
			// }, 3000);
			//
			// myWindows.stop();

		},
		onSubmitQuantity: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[3].focus();
		},
		onSubmitQuantityD: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[4].focus(oEvent);
		},
		onSubmitWeight: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[5].focus();
			//this.getView().byId("IdWeightD").focus();
		},
		onSubmitWeightD: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[6].focus(oEvent);
		},
		onSubmitMaking: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[7].focus();
		},
		onSubmitMakingD: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[8].focus();
		},
		onSubmitTunch: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[9].focus();
		},
		onSubmitRemarks: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getParent().getRows()[oRow.getIndex() + 1].getCells()[0].focus()
		},
		onReturnSubmitWeight: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[2].focus();
		},
		onReturnSubmitKWeight: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[3].focus();
		},
		onReturnSubmitTunch: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[4].focus();
		},
		onReturnSubmitQty: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[5].focus();
		},
		onReturnSubmitBhav: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[6].focus();
		},
		onReturnSubmitDropdown: function(oEvent) {
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			oRow.getCells()[1].focus();
		},
		onConfirm: function(oEvent) {
			var that = this;

			//order popup
			// if (oEvent.getParameter('id') === 'orderNo'){
			if (oEvent.getParameters().selectedItem.mBindingInfos.label.binding.sPath === 'OrderNo') {
				this.byId("Sales--idSaveIcon").setColor('green');
				this.byId("idRetailTransfer").setEnabled(true);
				delete this.orderAmount;
				delete this.deduction;
				var id = oEvent.getSource().getParent().getId().split('---')[1];
				var orderDate = this.getView().getModel('local').getProperty('/orderHeader/Date');
				var orderDetail = this.getView().getModel('local').getProperty('/orderHeader');
				// that.onClear(oEvent,id);
				//Clear Item table
				this.orderItem(oEvent, id);
				this.materialPopupOrderItem(oEvent, id);
				//return table
				this.orderReturn(oEvent, id);
				//adjust width of order tablePath
				this.setWidths(false);
				var orderNo = oEvent.getParameter("selectedItem").getLabel();
				var orderId = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
				// this.OrderDetails(orderId);
				this.getView().getModel("local").setProperty("/orderHeader/OrderNo",
					orderNo);
				this.getView().getModel("local").setProperty("/orderHeader/Date", orderDate);
				if (orderDetail.Customer) {
					this.byId("Sales--idSaveIcon").setColor('red');
					var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, orderDetail.Customer);
				} else {
					var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, "");
				}
				oEvent.sId = "orderReload";
				this.getView().getModel("local").setProperty("/orderHeaderTemp/OrderId", orderId);
				this.getOrderDetails(oEvent, orderId, oFilter, orderNo);
				this.byId("Sales--idSaveIcon").setColor('green');
				// this.orderSearchPopup.destroyItems();
			} else {
				var oCustDetail = this.getView().getModel('local').getProperty('/orderHeaderTemp');
				//customer popup
				var selCust = oEvent.getParameter("selectedItem").getLabel();
				var selCustName = oEvent.getParameter("selectedItem").getValue();
				oCustDetail.CustomerId = selCust;
				oCustDetail.CustomerName = selCustName;
				// this.getView().byId("customerId").setValue(selCust);
				this.getView().byId("Sales--custName").setText(selCustName);
				this.getView().getModel("local").setProperty("/orderHeader/Customer",
					oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
				this.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerId",
					selCust);
					this.getView().byId("__component0---idsales--Sales--idCustomerNameForSale").setVisible(selCust === "SALE").getFields()[0].setValue();
					this.getView().byId("__component0---idsales--Sales--idCustomerCityForSale").setVisible(selCust === "SALE").getFields()[0].setValue();
			}
		},
		onPayDateChange: function(oEvent) {
			if (oEvent.getParameter('newValue')) {
				this.getView().getModel('local').setProperty('/orderHeader/Date',
					oEvent.getParameter('newValue'));

			}
		},
		getEntryData: function(oEvent, custId, orderNo, date, postedEntryData) {

			var retVal;
			var that = this;
			var orderDate = date;
			var orderId = this.getView().getModel('local').getProperty('/orderHeaderTemp/OrderId');
			var entryData = this.getView().getModel('local').getProperty('/EntryData');
			entryData.OrderNo = orderId;
			entryData.Date = orderDate;
			entryData.Customer = custId;
			$.post("/EntryTransfer", {
					entryData
				})
				.then(function(result) {

					postedEntryData.Customer = result.Customer;
					postedEntryData.Cash = result.Cash;
					postedEntryData.OrderNo = result.OrderNo;
					postedEntryData.id = result.id;
					retVal = true;
				})
			return retVal;
		},
		getOrderDetails: function(oEvent, orderId, oFilter, orderNo) {

			var that = this;

			// that.getView().setBusy(true);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/OrderHeaders('" + orderId + "')", "GET", {
						filters: [oFilter]
					}, {}, this)
				.then(function(oData) {

					// that.getView().setBusy(false);

					var date = oData.Date;
					var custId = oData.Customer;
					// that.getEntryData(oEvent,custId,orderNo,date)

					var customerData = that.allMasterData.customers[custId];
					var customerCity = customerData.City;
					that.getView().getModel("local").setProperty("/orderHeader", oData);
					that.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerId", customerData.CustomerCode);
					that.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerName", customerData.Name + " - " + that.allMasterData.cities[
						customerCity].cityName);

					that.getView().byId("Sales--custName").setText(customerData.Name + " - " + that.allMasterData.cities[customerCity].cityName);
					var postedEntryData = that.getView().getModel('local').getProperty('/EntryData');
					// that.getEntryData(oEvent, custId, orderNo, date, postedEntryData)
					// assign the item Details
					// that.getView().setBusy(true);
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
							"/OrderHeaders('" + orderId + "')/ToOrderItems",
							"GET", {}, {}, that)
						.then(function(oData) {
							if (oData.results.length > 0) {
								var allItems = that.getView().getModel("orderItems").getProperty("/itemData");
								for (var i = 0; i < oData.results.length; i++) {
									allItems[i].OrderNo = oData.results[i].OrderNo;
									allItems[i].itemNo = oData.results[i].id;
									allItems[i].Making = oData.results[i].Making;
									allItems[i].MakingD = oData.results[i].MakingD;
									allItems[i].Qty = oData.results[i].Qty;
									allItems[i].QtyD = oData.results[i].QtyD;
									allItems[i].Weight = oData.results[i].Weight;
									allItems[i].WeightD = oData.results[i].WeightD;
									allItems[i].Remarks = oData.results[i].Remarks;
									var MaterialData = that.allMasterData.materials[oData.results[i].Material];
									allItems[i].Material = oData.results[i].Material;
									allItems[i].Description = MaterialData.ProductName;
									allItems[i].MaterialCode = MaterialData.ProductCode;
									var oTablePath = "/itemData" + '/' + i;
									oEvent.sId = "orderReload";
									that.Calculation(oEvent, oTablePath, i);
								}
								that.getView().getModel("orderItems").setProperty("/itemData", allItems);
							}
						})
						.catch(function(oError) {
							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);
						});

					//Assign return table values
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
							"/OrderHeaders('" + orderId + "')/ToOrderReturns",
							"GET", {}, {}, that)
						.then(function(oData) {
							if (oData.results.length > 0) {
								var allReturns = that.getView().getModel("returnModel").getProperty("/TransData");
								for (var i = 0; i < oData.results.length; i++) {
									allReturns[i].ReturnId = oData.results[i].id;
									allReturns[i].Type = oData.results[i].Type;
									allReturns[i].Weight = oData.results[i].Weight;
									allReturns[i].KWeight = oData.results[i].KWeight;
									allReturns[i].Tunch = oData.results[i].Tunch;
									allReturns[i].Qty = oData.results[i].Qty;
									allReturns[i].Bhav = oData.results[i].Bhav;
									allReturns[i].Key = oData.results[i].Key;
									allReturns[i].Remarks = oData.results[i].Remarks;
									that.getView().getModel("returnModel").setProperty("/TransData", allReturns);
									var seletedLine = "/TransData" + '/' + i;
									oEvent.sId = "orderReload";
									var orderHeader = that.getView().getModel('local').getProperty('/orderHeader');
									that.returnCalculation(oEvent, orderHeader, seletedLine);
								}
								// that.getView().getModel("returnModel").setProperty("/TransData", allReturns);
							}
						})
						.catch(function(oError) {
							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);
						});
				})
				.catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},
		//on order valuehelp,get the exsisting order from //DB
		valueHelpOrder: function(oEvent) {
			this.orderPopup(oEvent);
			// this.orderSearchPopup.destroyItems();
		},
		onCancel: function(oEvent) {
			// this.orderSearchPopup.destroyItems();
		},
		//on order create Button
		orderCreate: function(oEvent) {
			var that = this;

			if (this.getView().getModel('local').getProperty('/orderHeader').OrderNo) {
				var id = oEvent.getSource().getParent().getParent().getParent().getId().split('---')[1].split('--')[0];
				var oBundle = this.getView().getModel("i18n").getResourceBundle().getText("deleteUnsaveData");
				sap.m.MessageBox.confirm(oBundle, {
					title: "Confirm", // default
					// id:id,                                               // Id
					styleClass: "", // default
					initialFocus: null, // default
					textDirection: sap.ui.core.TextDirection.Inherit, // default
					onClose: function(sButton) {
						if (sButton === MessageBox.Action.OK) {
							var orderdate = that.getView().getModel('local').getProperty('/orderHeader').Date;
							var customerNo = that.getView().getModel('local').getProperty('/orderHeader').Customer;
							var customerId = that.getView().getModel('local').getProperty('/orderHeaderTemp').CustomerId;
							var customerName = that.getView().getModel('local').getProperty('/orderHeaderTemp').CustomerName;
							var order = that.getView().getModel('local').getProperty('/orderHeader')
							that.onClear(oEvent, id);
							that.getView().getModel('local').setProperty('/orderHeaderTemp/CustomerId', customerId);
							that.getView().byId("Sales--custName").setText(customerName);
							that.getView().getModel('local').setProperty('/orderHeader/Customer', customerNo);
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
									"/CustomCalculations", "GET", {}, {}, that)
								.then(function(oData) {
									that.orderCheck();
								}).catch(function(oError) {
									that.getView().getModel("local").setProperty("/orderHeader/GoldBhav22", 0);
									that.getView().getModel("local").setProperty("/orderHeader/GoldBhav20", 0);
									that.getView().getModel("local").setProperty("/orderHeader/GoldBhav", 0);
									that.getView().getModel("local").setProperty("/orderHeader/SilverBhav", 0);
								});
						} //Sbutton if condition
					} //onClose
				});
			} else {
				that.orderCheck();
			}
		},
		orderCheck: function() {
			var that = this;
			that.getView().setBusy(true);
			that.byId("Sales--idSaveIcon").setColor('red');
			// get the data from screen in local model
			var orderData = this.getView().getModel('local').getProperty("/orderHeader");
			if (orderData.Customer === "") {
				this.getView().byId("Sales--customerId").setValueState("Error").setValueStateText("Mandatory Input");
				that.getView().setBusy(false);
			} else {
				if (orderData) {
					orderData.id = "";
					orderData.CreatedBy = "";
					orderData.ChangedBy = "";
					orderData.CreatedOn = "";
					orderData.CreatedBy = "";
					delete orderData.ToOrderItems;
					delete orderData.ToCustomers;
					delete orderData.ToOrderReturns;
					that.orderCustomCalculations();
				}
				this.getView().byId("Sales--customerId").setValueState("None");
				//call the odata promise method to post the data
				orderData.Date = this.getView().byId("Sales--DateId").getValue();
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/OrderHeaders",
						"POST", {}, orderData, this)
					.then(function(oData) {
						that.getView().setBusy(false);
						//create the new json model and get the order id no generated
						var oOrderId = that.getView().getModel('local').getProperty('/OrderId');
						oOrderId.OrderId = oData.id;
						oOrderId.OrderNo = oData.OrderNo;
						that.getView().getModel('local').setProperty('/OrderId', oOrderId);
						that.getView().getModel('local').setProperty('/orderHeaderTemp/OrderId', oData.id);
						//assign the no on ui
						that.getView().getModel("local").setProperty("/orderHeader/OrderNo", oData.OrderNo);
					})
					.catch(function(oError) {
						if (oError.responseText.includes("last order already empty use same")) {
							var id = oError.responseText.split(':')[2];
							if (id) {
								var customer = that.getView().getModel('local').getProperty('/orderHeader/Customer');
								that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
										"/OrderHeaders(" + id + ")",
										"GET", {}, {}, that)
									.then(function(oData) {
										that.getView().setBusy(false);
										//create the new json model and get the order id no generated
										var oOrderHeader = that.getView().getModel('local').getProperty('/orderHeader');
										var oOrderId = that.getView().getModel('local').getProperty('/OrderId');
										oOrderHeader.OrderNo = oData.OrderNo;
										oOrderHeader.Customer = customer;
										oOrderId.OrderId = oData.id;
										oOrderId.OrderNo = oData.OrderNo;
										that.headerNoChange = true;
										that.getView().getModel('local').setProperty('/OrderId', oOrderId);
										that.getView().getModel('local').setProperty('/orderHeader', oOrderHeader);
										that.getView().getModel('local').setProperty('/orderHeaderTemp/OrderId', oData.id);
										var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("orderReloadMessage");
										sap.m.MessageToast.show(oBundle, {
											duration: 3000, // default
											width: "15em", // default
										});
									})
									.catch(function(oError) {
										that.getView().setBusy(false);
										var oPopover = that.getErrorMessage(oError);
									});
							} else {
								that.getView().setBusy(false);
								var oPopover = that.getErrorMessage(oError);
							}
						} else {
							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);
						}
					});
			} //Else
		},
		onValidation: function() {
			var that = this;
			//---all validation true
			var retVal = true;
			//header validations
			var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
			if (oHeader.OrderNo === 0 ||
				oHeader.OrderNo === "") {
				retVal = false;
				var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("orderValidation");
				MessageBox.show(
					oBundle, {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {}
					}
				);
			}
			that.getView().setBusy(false);
			return retVal;
		},
		onValidationItem: function(data, i) {
			//line item validations
			var that = this;
			var model = this.getView().getModel("orderItems").getProperty("/itemData");
			var oOrderDetail = that.getView().getModel('local').getProperty('/OrderItem');
			var oTableDetails = that.getView().byId("orderItemBases");
			var tableBinding = oTableDetails.getBinding("rows");
			// //---all errors are false
			var returnError = false;
			if ((data.Weight) && (data.WeightD) &&
				(data.WeightD >= data.Weight)) {
				if (this.settings === true) {
					oTableDetails.getRows()[i].getCells()[3].setValueState("Error");
				} else {
					oTableDetails.getRows()[i].getCells()[4].setValueState("Error");
					oTableDetails.getRows()[i].getCells()[5].setValueState("Error");
					returnError = true;
					this.getView().setBusy(false);
					return;
				}
			} else {
				if (this.settings === true) {
					oTableDetails.getRows()[i].getCells()[3].setValueState("None");
				} else {
					oTableDetails.getRows()[i].getCells()[4].setValueState("None");
					oTableDetails.getRows()[i].getCells()[5].setValueState("None");
				}
			}
			//Quantity
			if ((data.Type === 'GS') ||
				((data.Type === 'Gold' && data.Category === "pcs") ||
					(data.Type === 'Silver' && data.Category === "pcs"))) {
				if (data.Qty === "" || data.Qty === 0 || data.Qty === "0") {
					this.getView().setBusy(false);
					if (this.settings === true) {
						oTableDetails.getRows()[i].getCells()[2].setValueState("Error");
						oTableDetails.getRows()[i].getCells()[3].setValueState("None");
					} else {
						oTableDetails.getRows()[i].getCells()[2].setValueState("Error");
						oTableDetails.getRows()[i].getCells()[4].setValueState("None");
					}
					returnError = true;
					return;
				} else {
					oOrderDetail.Qty = data.Qty;
					oTableDetails.getRows()[i].getCells()[2].setValueState("None");
					this.getView().setBusy(false);
					// returnError = false;
				}
			} else
			if ((data.Type === 'Gold' && data.Category === "gm") ||
				(data.Type === 'Silver' && data.Category === "gm")) {
				//Weight check
				if (data.Weight === "" || data.Weight === 0 || data.Weight === '0') {
					this.getView().setBusy(false);
					if (this.settings === true) {
						oTableDetails.getRows()[i].getCells()[3].setValueState("Error");
						oTableDetails.getRows()[i].getCells()[2].setValueState("None");
					} else {
						oTableDetails.getRows()[i].getCells()[4].setValueState("Error");
						oTableDetails.getRows()[i].getCells()[2].setValueState("None");
					}
					returnError = true;
					return;
				} else {
					oOrderDetail.Weight = data.Weight;
					if (this.settings === true) {
						oTableDetails.getRows()[i].getCells()[3].setValueState("None");
					} else {
						oTableDetails.getRows()[i].getCells()[4].setValueState("None");
					}
					this.getView().setBusy(false);
					// returnError = false;
				}
			} //Gold/Silver check
			return returnError;
		},
		onReturnSave: function(oEvent, oId, oCommit, oHeader) {
			var returnTable = this.getView().getModel('local').getProperty('/OrderReturn');
			var oReturnTable = this.getView().byId('OrderReturn');
			var oBindingR = oReturnTable.getBinding("rows");
			for (var i = 0; i < oBindingR.getLength(); i++) {
				var that = this;
				var data = oBindingR.oList[i];
				//key
				if (data.Key != "") {
					returnTable.Key = data.Key;
					//Type
					if (data.Type === "" || data.Type === 0) {
						returnTable.Type = 0;
					} else {
						returnTable.Type = data.Type;
						//OrderId
						if ((oId) || (oId != "")) {
							returnTable.OrderNo = oId;
						} else if (oHeader.id) {
							returnTable.OrderNo = oHeader.id;
						}

						//Weight
						if (data.Weight === "" || data.Weight === 0) {
							returnTable.Weight = 0;
						} else {
							returnTable.Weight = data.Weight;
						}
						//kWeight
						if (data.KWeight === "" || data.KWeight === 0) {
							returnTable.KWeight = 0;
						} else {
							returnTable.KWeight = data.KWeight;
						}
						//tunch
						if (data.Tunch === "" || data.Tunch === 0) {
							returnTable.Tunch = 0;
						} else {
							returnTable.Tunch = data.Tunch;
						}
						//Quantity
						if (data.Qty === "" || data.Qty === 0) {
							returnTable.Qty = 0;
						} else {
							returnTable.Qty = data.Qty;
						}
						//Bhav
						if (data.Bhav === "" || data.Bhav === 0) {
							returnTable.Bhav = 0;
						} else {
							returnTable.Bhav = data.Bhav;
						}
						//Remarks
						if (data.Remarks === "") {
							returnTable.Remarks = "";
						} else {
							returnTable.Remarks = data.Remarks;
						}
						var oReturnOrderClone = JSON.parse(JSON.stringify(returnTable));
						if (data.ReturnId) {
							// that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							//                       "/OrderReturns('"+ oId +"')", "PUT",
							//                        {},oReturnOrderClone, that)
							//   .then(function(oData) {
							//
							//   that.getView().setBusy(false);
							//            })
							//   .catch(function(oError){
							//    that.getView().setBusy(false);
							//    var oPopover = that.getErrorMessage(oError);
							//    		});
						} else {
							//return data save
							that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
									"/OrderReturns", "POST", {}, oReturnOrderClone, that)
								.then(function(oData) {
									that.getView().setBusy(false);
									//loop the detaisl
									var allItems = that.getView().getModel("returnModel").getProperty("/TransData");
									for (var i = 0; i < allItems.length; i++) {
										if (allItems[i].Type === oData.Type &&
											allItems[i].ReturnId === "") {
											allItems[i].ReturnId = oData.id;
											allItems[i].orderNo = oId;
											oCommit = true;
											break;
										} //material compare if condition
									} //for loop
									that.getView().getModel("returnModel").setProperty("/TransData", allItems);
									that.getView().setBusy(false);
									var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("dataSave");
									sap.m.MessageToast.show(oBundle);
								})
								.catch(function(oError) {
									that.getView().setBusy(false);
									var oPopover = that.getErrorMessage(oError);
								});
						} //data.ReturnId else part
					} //type check
				} //key check
			} //forloop
			return oCommit;
		},
		ValueChangeHeader: function(oEvent) {
			var that = this;
			var oHeader = that.getView().getModel('local').getProperty('/orderHeader');
			var oTable = this.getView().byId("orderItemBases").getBinding('rows');
			var oPath = oTable.getPath();
			var oTableLength = oTable.getLength();
			var field = oEvent.getSource().getId().split('---')[1].split('--')[2];
			var newvalue = oEvent.getParameter('newValue');
			var oLocale = new sap.ui.core.Locale("en-US");
			var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
			this.headerNoChange = true;
			if (field === 'Gbhav2Id') {
				if (newvalue === "") {
					//Gold bhav 22/22
					oHeader.GoldBhav22 = 0;
					this.headerNoChange = true;
				} else
				if (newvalue === 0) {
					oHeader.GoldBhav22 = 0;
				} else {
					oHeader.GoldBhav22 = oFloatFormat.parse(newvalue);
				}
			} else if (field === 'Gbhav1Id') {
				//Gold bhav 22/20
				if (newvalue === "") {
					oHeader.GoldBhav20 = 0;
				} else
				if (newvalue === 0) {
					oHeader.GoldBhav20 = 0;
				} else {
					oHeader.GoldBhav20 = oFloatFormat.parse(newvalue);
				}
			} else if (field === 'GoldbhavId') {
				//Gold bhav
				// var oHeader = that.getView().getModel('local').getProperty('/orderHeader');
				// if (newvalue === "") {
				// 	oHeader.GoldBhav = 0;
				// } else
				// if (newvalue === 0) {
				// 	oHeader.GoldBhav = 0;
				// } else {
				// 	oHeader.GoldBhav = oFloatFormat.parse(newvalue);
				// }
			} else if (field === 'sbhavid') {
				//Silver Bhav
				// if (newvalue === "") {
				// 	oHeader.SilverBhav = 0;
				// } else
				// if (newvalue === 0) {
				// 	oHeader.SilverBhav = 0;
				// } else {
				// 	oHeader.SilverBhav = oFloatFormat.parse(newvalue);
				// }
			}
			that.getView().getModel('local').setProperty('/orderHeader', oHeader);
			for (var i = 0; i < oTableLength; i++) {
				var oTablePath = oPath + '/' + i;
				this.Calculation(oEvent, oTablePath, i);
				this.noChangeTable.push(this.noChange);
			}
		},
		onSave: function(oEvent) {

			var that = this;
			//if header check pass
			if (this.onValidation() === true) {
				//Item and value check
				var oOrderDetail = this.getView().getModel('local').getProperty('/OrderItem')
				var oTableDetails = this.getView().byId('orderItemBases');
				var oBinding = oTableDetails.getBinding("rows");
				var itemError = false;
				var valueCheck = false;
				var returnCheck = false;
				// delete this.orderAmount;
				// delete this.deduction;
				// delete this.finalBal;
				for (var i = 0; i < oBinding.getLength(); i++) {
					var that = this;
					var data = oBinding.oList[i];
					//posting the data
					if (data.Material !== "") {
						valueCheck = true;
						//check to 1st check return table
						if (i === 0 && returnCheck === false) {
							//Return table values check
							if (this.onRetItemValidation() === false) {
								returnCheck = true;
							}
						}
						// valueCheck = true;
						this.getView().setBusy(true);
						//---all errors are false
						var returnError = false;
						if (this.onValidationItem(data, i, returnError) === false) {
							itemError = false;
						} //validation endif
						else {
							itemError = true;
						}
					} //If condition end
				} //for loop brace end
				if (returnCheck === true && itemError === false) {
					this.commitRecords(oEvent);
				}
				//error if no valid entry
				if (valueCheck === false) {
					var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("validEntries");
					sap.m.MessageBox.error(oBundle, {
						title: "Error", // default
						styleClass: "", // default
						initialFocus: null, // default
						textDirection: sap.ui.core.TextDirection.Inherit, // default
						onClose: function(sButton) {}
					});
				}
			} else {
				this.byId("idRetailTransfer").setEnabled(true);
			}
			if (valueCheck === true && returnCheck === true && itemError === false) {
				var statusGreen = true;
				this.byId("idRetailTransfer").setEnabled(true);
				return statusGreen;
			}
		},
		commitRecords: function(oEvent) {

			if (this.byId('Sales--idSaveIcon').getColor() === 'red') {
				var that = this;
				var oHeader = that.getView().getModel('local').getProperty('/orderHeader');
				var oId = that.getView().getModel('local').getProperty('/orderHeaderTemp').OrderId;
				if (this.headerNoChange === true) {
					oHeader.Date = new Date(oHeader.Date);

					var oHeaderClone = JSON.parse(JSON.stringify(oHeader));
					// order header put

					$.post("/updateRetailOrderHdr",{OrderDetails: oHeaderClone})
					.done(function(data, status) {
					  sap.m.MessageToast.show("Order Header updated");

					})
					.fail(function(xhr, status, error) {
					  sap.m.MessageBox.error("Failed to update Header");
					});

					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							"/OrderHeaders('" + oId + "')",
							"PUT", {}, oHeader, this)
						.then(function(oData) {

							var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("orderSave");
							sap.m.MessageToast.show(oBundle);
							that.getView().setBusy(false);
						})
						.catch(function(oError) {
							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);
						});
				}
				var oOrderDetail = this.getView().getModel('local').getProperty('/OrderItem')
				var oTableDetails = this.getView().byId('orderItemBases');
				var oBinding = oTableDetails.getBinding("rows");
				var itemError = false;
				var oCommit = false;
				for (var i = 0; i < oBinding.getLength(); i++) {
					var that = this;
					var data = oBinding.oList[i];
					if (data.Material !== "") {
						if (oId != "") {
							oOrderDetail.OrderNo = oId; //orderno // ID
							this.getView().getModel('local').setProperty('/orderHeaderTemp/OrderId', oId);
						} else if (oHeader.id) {
							oOrderDetail.OrderNo = oHeader.id; //orderno // ID
							this.getView().getModel('local').setProperty('/orderHeaderTemp/OrderId', oHeader.id);
						}
						oOrderDetail.Material = data.Material;
						// Quantity
						if (data.Qty === "" || data.Qty === 0) {
							oOrderDetail.Qty = 0;
						} else {
							oOrderDetail.Qty = data.Qty;
						}
						// QuantityD
						if (data.QtyD === "" || data.QtyD === 0) {
							oOrderDetail.QtyD = 0;
						} else {
							oOrderDetail.QtyD = data.QtyD;
						}
						// Weight
						if (data.Weight === "" || data.Weight === 0) {
							oOrderDetail.Weight = 0;
						} else {
							oOrderDetail.Weight = data.Weight;
						}
						// WeightD
						if (data.WeightD === "" || data.WeightD === 0) {
							oOrderDetail.WeightD = 0;
						} else {
							oOrderDetail.WeightD = data.WeightD;
						}
						//making
						if (data.Making === "" || data.Making === 0) {
							oOrderDetail.Making = 0;
						} else {
							oOrderDetail.Making = data.Making;
						}
						//makingD
						if (data.MakingD === "" || data.MakingD === 0) {
							oOrderDetail.MakingD = 0;
						} else {
							oOrderDetail.MakingD = data.MakingD;
						}
						oOrderDetail.Remarks = data.Remarks;
						// oOrderDetail.SubTotal=data.SubTot;
						var oOrderDetailsClone = JSON.parse(JSON.stringify(oOrderDetail));
						//Item data save
						if (data.itemNo) {
							// if (this.noChange.flag === false) {
							//
							//   that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							//           "/OrderItems('"+ data.itemNo +"')","PUT", {},
							//           oOrderDetailsClone, this)
							//   .then(function(oData) {
							//
							//         that.getView().setBusy(false);
							// })
							//   .catch(function(oError){
							//   that.getView().setBusy(false);
							//   var oPopover = that.getErrorMessage(oError);
							//       });
							// }
						} else {

							that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
									"/OrderItems", "POST", {}, oOrderDetailsClone, this)
								.then(function(oData) {
									//loop the detaisl
									var allItems = that.getView().getModel("orderItems").getProperty("/itemData");
									that.getView().setBusy(false);
									for (var i = 0; i < allItems.length; i++) {
										if (allItems[i].Material === oData.Material &&
											allItems[i].itemNo === "") {

											allItems[i].itemNo = oData.id;
											allItems[i].OrderNo = oId;
											that.stockTransfer(allItems[i]);
											break;
										} //material compare if condition
									} //for loop
									that.getView().getModel("orderItems").setProperty("/itemData", allItems);
									that.getView().setBusy(false);
									var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("dataSucess");
									sap.m.MessageToast.show(oBundle);
								})
								.catch(function(oError) {
									that.getView().setBusy(false);
									var oPopover = that.getErrorMessage(oError);
								});
							that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
									"/Products('" + oOrderDetailsClone.Material + "')",
									"PUT", {}, {
										"CustomerMaking": oOrderDetailsClone.Making
									}, that)
								.then(function(oData) {})
								.catch(function(oError) {
									that.getView().setBusy(false);
									var oPopover = that.getErrorMessage(oError);
								});
						} //data.item no else part
					}
				}
				//Return values save
				if (oCommit === false) {
					that.onReturnSave(oEvent, oId, oCommit, oHeader);
				}
				that.byId("Sales--idSaveIcon").setColor('green');
				this.byId("idRetailTransfer").setEnabled(true);
			} //if status is red only than commit
			else {
				var oBundle = this.getView().getModel("i18n").getResourceBundle().getText("dataNoChnage");
				sap.m.MessageBox.error(oBundle, {
					title: "Error", // default
					styleClass: "", // default
					initialFocus: null, // default
					textDirection: sap.ui.core.TextDirection.Inherit, // default
					onClose: function(sButton) {}
				});
			}
		},
		stockTransfer: function(allItems) {

			var that = this;
			var orderNo = this.getView().getModel('local').getProperty('/orderHeader/OrderNo');
			// var orderId = this.getView().getModel('local').getProperty('/orderHeaderTemp/OrderId');
			var orderDate = this.getView().getModel('local').getProperty('/orderHeader/Date');
			var stockData = this.getView().getModel('local').getProperty('/stockMaint');
			stockData.Product = allItems.Material;
			stockData.Description = allItems.MaterialCode;
			if (allItems.Qty === '') {
				stockData.Quantity = '0';
			} else {
				stockData.Quantity = allItems.Qty;
			}
			if (allItems.Weight === '') {
				stockData.Weight = '0';
			} else {
				stockData.Weight = allItems.Weight;
			}
			stockData.OrderItemId = allItems.itemNo;
			stockData.OrderType = 'R';
			stockData.Date = orderDate;
			stockData.Remarks = "[Auto-Entry]Retail Sales Stock " + "for order" + " " + orderNo;

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/stockMaints",
					"POST", {}, stockData, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("Stock Updated Successfully");
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},
		onClearScreen: function(oEvent) {
			var that = this;
			var saveStatus = this.byId('Sales--idSaveIcon').getColor();
			if (!id) {
				var id = oEvent.getSource().getParent().getParent().getId().split('---')[1].split('--')[1];
			}
			if (saveStatus == "red") {
				var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("clearConfirmation");
				// sap.m.MessageBox.error("Are you sure you want to clear all entries? All unsaved changes will be lost!", {
				sap.m.MessageBox.error(oBundle, {
					title: "Alert!",
					actions: ["Save & Clear", "Clear", MessageBox.Action.CANCEL],
					onClose: function(oAction) {
						if (oAction === "Clear") {
							that.onClear(oEvent, id);
							that.byId("Sales--idSaveIcon").setColor('green');
							var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("clearSucess");
							// MessageToast.show("Screen cleared successfully!");
							MessageToast.show(oBundle);
						} else if (oAction === "Save & Clear") {
							if (that.onSave(oEvent)) {
								that.onClear(oEvent, id);
								MessageToast.show("Data has been Saved! Screen cleared successfully!");
							}
						}
					}
				});
			} else {
				that.onClear(oEvent, id);
				that.byId("Sales--idSaveIcon").setColor('green');
				var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("clearSucess");
				MessageToast.show(oBundle);
			}
		},
		onClear: function(oEvent, id) {

			var that = this;
			delete this.orderAmount;
			delete this.deduction;
			delete this.finalBal;
			this.settings = false;
			that.byId("Sales--idSaveIcon").setColor('green');
			var ovisibleSet = new sap.ui.model.json.JSONModel({
				set: true
			});
			this.setModel(ovisibleSet, "VisibleSet");
			//Clear Header Details
			var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
			var oHeaderT = this.getView().getModel('local').getProperty('/orderHeaderTemp');
			// oHeaderT.CustomerName ="";
			this.getView().byId("Sales--custName").setText("");
			oHeaderT.CustomerId = "";
			oHeaderT.FinalBalance = "0";
			oHeaderT.Deduction = "0";
			oHeaderT.TotalOrderValue = "0";
			oHeader.OrderNo = "";
			oHeader.CustomerName = null;
			oHeader.ContactNo = null;
			oHeader.Customer = "";
			oHeader.GoldBhav22 = 0;
			oHeader.GoldBhav20 = 0;
			oHeader.GoldBhav = 0;
			oHeader.SilverBhav = 0;
			this.getView().getModel('local').setProperty('/orderHeaderTemp', oHeaderT);
			// oHeader.Date=new Date();
			that.getView().getModel('local').setProperty('/orderHeader', oHeader);
			that.getView().getModel("local").setProperty("/orderHeader/Date", formatter.getFormattedDate(0));
			that.getView().byId("Sales--DateId").setDateValue(new Date());
			var postedEntryData = that.getView().getModel('local').getProperty('/EntryData');
			postedEntryData.Customer = "";
			postedEntryData.Date = "";
			postedEntryData.OrderNo = "";
			postedEntryData.OrderType = "";
			postedEntryData.Remarks = "";
			postedEntryData.id = "";
			postedEntryData.Cash = "";
			postedEntryData.ChangedBy = "";
			postedEntryData.ChangedOn = "";
			postedEntryData.CreatedBy = "";
			postedEntryData.CreatedOn = "";
			that.getView().getModel('local').setProperty('/EntryData', postedEntryData);
			this.orderCustomCalculations();
			this.orderItem(oEvent, id);
			this.materialPopupOrderItem(oEvent, id);
			//return table
			this.orderReturn(oEvent, id);
			//adjust width of order tablePath
			this.setWidths(false);

		},
		setWidths: function(settings) {
			var oTable = this.getView().byId("orderItemBases");
			var oTableReturn = this.getView().byId("OrderReturn")
			var tableBinding = oTable.getBinding("rows");
			if (settings === false) {
				//when setting button is reset
				oTable.getColumns()[0].setWidth("10%");
				oTable.getColumns()[1].setWidth("15%");
				oTable.getColumns()[2].setWidth("5%");
				oTable.getColumns()[3].setWidth("5%");
				oTable.getColumns()[4].setWidth("10%");
				oTable.getColumns()[5].setWidth("10%");
				oTable.getColumns()[6].setWidth("10%");
				oTable.getColumns()[7].setWidth("10%");
				oTable.getColumns()[8].setWidth("10%");
				oTable.getColumns()[9].setWidth("15%");

				for (var i = 0; i < oTable.getRows().length; i++) {
					oTable.getRows()[i].getCells()[2].setValueState('None');
					oTable.getRows()[i].getCells()[4].setValueState('None');
					oTable.getRows()[i].getCells()[5].setValueState('None');
				}
			} else {
				for (var i = 0; i < oTable.getRows().length; i++) {
					oTable.getRows()[i].getCells()[2].setValueState('None');
					oTable.getRows()[i].getCells()[3].setValueState('None');
					oTable.getRows()[i].getCells()[4].setValueState('None');
				}
			}
			for (var i = 0; i < oTableReturn.getRows().length; i++) {
				oTableReturn.getRows()[i].getCells()[1].setValueState('None');
				oTableReturn.getRows()[i].getCells()[2].setValueState('None');
				oTableReturn.getRows()[i].getCells()[3].setValueState('None');
				oTableReturn.getRows()[i].getCells()[4].setValueState('None');
				oTableReturn.getRows()[i].getCells()[5].setValueState('None');
			}
		},
		onDelete: function(oEvent) {

			var that = this;
			var oLocale = new sap.ui.core.Locale("en-US");
			var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
			var viewId = oEvent.getSource().getParent().getParent().getId().split('---')[1].split('--')[0];
			var oSourceCall = oEvent.getSource().getParent().getParent().getId().split('---')[1].split('--')[1];
			var selIdxs = that.getView().byId(oSourceCall).getSelectedIndices();
			if (selIdxs.length && selIdxs.length !== 0) {
				sap.m.MessageBox.confirm("Are you sure to delete the selected entries", {
					title: "Confirm", // default
					styleClass: "", // default
					initialFocus: null, // default
					textDirection: sap.ui.core.TextDirection.Inherit, // default
					onClose: function(sButton) {
						if (sButton === MessageBox.Action.OK) {

							for (var i = selIdxs.length - 1; i >= 0; --i) {
								if (oSourceCall === 'orderItemBases') {
									var itemDetail = that.getView().getModel("orderItems").getProperty("/itemData")[selIdxs[i]];
									var id = that.getView().getModel("orderItems").getProperty("/itemData")[selIdxs[i]].itemNo;
									var pid = that.getView().getModel("orderItems").getProperty("/itemData")[selIdxs[i]].Material;
									var orderId = that.getView().getModel("orderItems").getProperty("/itemData")[selIdxs[i]].OrderNo;
									var date = that.getView().byId("Sales--DateId").getDateValue();
									var subtotalItem = oFloatFormat.parse(itemDetail.SubTotal);
									if (subtotalItem) {
										that.orderAmount = that.orderAmount - subtotalItem;
										var orderAmountF = that.getIndianCurr(that.orderAmount);
										that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValue', orderAmountF);
									}
									that.finalBal = that.orderAmount - that.deduction;
									if (this.finalBal === 0) {
										var finalBalF = 0;
									} else {
										var finalBalF = that.getIndianCurr(that.finalBal);
									}
									that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalance', finalBalF);
									if (id) {
										var stockData = that.getView().getModel('local').getProperty('/stockMaint')
										stockData.Product = pid;
										stockData.OrderItemId = id;
										stockData.Date = date;
										stockData.Weight = that.getView().getModel("orderItems").getProperty("/itemData")[selIdxs[i]].Weight;
										stockData.Quantity = that.getView().getModel("orderItems").getProperty("/itemData")[selIdxs[i]].Qty;

										that.byId("Sales--idSaveIcon").setColor('green');
										that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/OrderItems('" + id + "')",
											"DELETE", {}, {}, that)
										$.post("/StockDelete", {
												Stock: stockData
											})
											.then(function(result) {

												var stockId = result.id;
												that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
													"/stockMaints('" + stockId + "')",
													"DELETE", {}, {}, that)
											});
										sap.m.MessageToast.show("Data Deleted Successfully");
									} else {
										that.byId("Sales--idSaveIcon").setColor('red');
									}
									var oTableData = that.getView().getModel("orderItems").getProperty("/itemData");
									oTableData.splice(selIdxs[i], 1);
									that.getView().getModel("orderItems").setProperty("/itemData", oTableData);
									oTableData.push({
										"OrderNo": "",
										"itemNo": "",
										"Material": "",
										"MaterialCode": "",
										"Description": "",
										"Qty": 0,
										"QtyD": 0,
										"Weight": 0,
										"WeightD": 0,
										"Making": 0,
										"MakingD": 0,
										"Tunch": 0,
										"Remarks": "",
										"SubTotal": 0,
										"SubTotalS": 0,
										"SubTotalG": 0,
										"Category": "",
										"CreatedBy": "",
										"CreatedOn": "",
										"ChangedBy": "",
										"ChangedOn": ""
									});
									that.getView().getModel("orderItems").setProperty("/itemData", oTableData);
								} //sourcecallCheck
								else if (oSourceCall === 'OrderReturn') {

									that.deleteReturnValues(oEvent, i, selIdxs[i], viewId, oTableData);
								} //order return else part
							} //for i loop
							if (oSourceCall === 'orderItemBases') {
								that.getView().byId('orderItemBases').clearSelection();
							} else {
								that.getView().byId('OrderReturn').clearSelection();
							}
						} //
					}
				});

			} else { // if selindx length check
				var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("selecteDeleteItem");
				MessageBox.show(
					oBundle, {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {}
					});
			}
		},
		onSetting: function(oEvent) {
			this.settings = true;
			this.hideDColumns(oEvent);
		},
		previousOrder: function(oEvent) {

			var selectedDate = this.getView().byId("Sales--DateId").getDateValue();
			var dateFrom = new Date(selectedDate);
			dateFrom.setDate(selectedDate.getDate());
			dateFrom.setHours(0, 0, 0, 1)
			var dateTo = new Date(selectedDate);
			dateTo.setDate(selectedDate.getDate());
			dateTo.setHours(23, 59, 59, 59)
			var oFilter1 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, dateFrom);
			var oFilter2 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, dateTo);
			var orFilter = new sap.ui.model.Filter({
				filters: [oFilter1, oFilter2],
				and: true
			});
			var that = this;

			this.setWidths(false);

			var myData = this.getView().getModel("local").getProperty("/orderHeader");
		// that.getView().setBusy(true);
			$.post("/previousOrder", {
					OrderDetails: myData
				})
				.then(function(result) {
					that.byId("idRetailTransfer").setEnabled(true);
					// that.getView().setBusy(true);
					console.log(result);
					if (result) {

						delete that.orderAmount;
						delete that.deduction;
						delete that.finalBal;
						var oHeaderT = that.getView().getModel('local').getProperty('/orderHeaderTemp');
						oHeaderT.FinalBalance = "0";
						oHeaderT.Deduction = "0";
						oHeaderT.TotalOrderValue = "0";
						that.getView().getModel('local').setProperty('/orderHeaderTemp', oHeaderT);
						var orderId = result.id;
						that.byId("Sales--idSaveIcon").setColor('green');
						if (result.Customer) {
							var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, result.Customer);
						} else {
							var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, "");
						}
						var id = 'sales';
						//Clear Item table
						that.orderItem(oEvent, id);
						//return table
						that.orderReturn(oEvent, id);
						oEvent.sId = "orderReload";
						that.getOrderDetails(oEvent, orderId, oFilter);
						if (!that.navigation) {
							var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, "");
							that.getOrderDetails(oEvent, result.id, orFilter);
							that.orderSearchPopup = new sap.ui.xmlfragment("victoria.fragments.popup", that);
							that.getView().addDependent(that.orderSearchPopup);
							that.orderSearchPopup.bindAggregation("items", {
								path: '/OrderHeaders',
								filters: orFilter,
								template: new sap.m.DisplayListItem({
									label: "{OrderNo}",
									value: {
										path: 'Customer',
										formatter: that.getCustomerName.bind(that)
									}
								})
							});
							that.navigation = true;
						}
					}
				});
		},
		changeInMaterial: function(oEvent) {
			// var value = oEvent.getParameters("value").value;
			// var fragIndicator =	sap.ui.core.Fragment.byId("fr1", "idSaveIndicator");
			//   if(fragIndicator){
			//       if(value !== ''){
			//         fragIndicator.setColor("red");
			//       }
			//   }
		},

		nextOrder: function(oEvent) {

			var selectedDate = this.getView().byId("Sales--DateId").getDateValue();
			var dateFrom = new Date(selectedDate);
			dateFrom.setDate(selectedDate.getDate());
			dateFrom.setHours(0, 0, 0, 1)
			var dateTo = new Date(selectedDate);
			dateTo.setDate(selectedDate.getDate());
			dateTo.setHours(23, 59, 59, 59)
			var oFilter1 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, dateFrom);
			var oFilter2 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, dateTo);
			var orFilter = new sap.ui.model.Filter({
				filters: [oFilter1, oFilter2],
				and: true
			});
			var that = this;

			this.setWidths(false);
			// that.getView().setBusy(false);
			var myData = this.getView().getModel("local").getProperty("/orderHeader");
			if (!myData.OrderNo && false) {
				this.orderPopup(oEvent);
				this.ODataHelper.callOData(that.getOwnerComponent().getModel(),
						"/OrderHeaders",
						"GET", {
							filters: [orFilter]
						}, {}, that)
					.then(function(oData) {

						// that.getView().setBusy(false);
						// ordersForSelectedDate = oData;
						var n = oData.results.length;
						if (n == 0) {
							sap.m.MessageToast.show("No orders for selected date");
						} else {
							var firstRecord = oData.results[0];

							var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, "");
							that.getOrderDetails(oEvent, firstRecord.id, orFilter);
							that.orderSearchPopup = new sap.ui.xmlfragment("victoria.fragments.popup", that);
							that.getView().addDependent(that.orderSearchPopup);
							that.orderSearchPopup.bindAggregation("items", {
								path: '/OrderHeaders',
								filters: orFilter,
								template: new sap.m.DisplayListItem({
									label: "{OrderNo}",
									value: {
										path: 'Customer',
										formatter: that.getCustomerName.bind(that)
									}
								})
							});
						}
					})
			} else {
				// this.getView().setBusy(false);
				$.post("/nextOrder", {
						OrderDetails: myData
					})
					.then(function(result) {
						// that.getView().setBusy(false);
						console.log(result);
						that.byId("idRetailTransfer").setEnabled(true);
						if (result) {
							var id = 'sales';
							delete that.orderAmount;
							delete that.deduction;
							delete that.finalBal;
							var oHeaderT = that.getView().getModel('local').getProperty('/orderHeaderTemp');
							oHeaderT.FinalBalance = "0";
							oHeaderT.Deduction = "0";
							oHeaderT.TotalOrderValue = "0";
							that.getView().getModel('local').setProperty('/orderHeaderTemp', oHeaderT);
							//Clear Item table
							that.orderItem(oEvent, id);
							//return table
							that.orderReturn(oEvent, id);
							var orderId = result.id;
							that.byId("Sales--idSaveIcon").setColor('green');
							if (result.Customer) {
								var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, result.Customer);
							} else {
								var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, "");
							}
							oEvent.sId = "orderReload";
							that.getOrderDetails(oEvent, orderId, oFilter);
							if (!that.navigation) {
								var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, "");
								that.getOrderDetails(oEvent, result.id, orFilter);
								that.orderSearchPopup = new sap.ui.xmlfragment("victoria.fragments.popup", that);
								that.getView().addDependent(that.orderSearchPopup);
								that.orderSearchPopup.bindAggregation("items", {
									path: '/OrderHeaders',
									filters: orFilter,
									template: new sap.m.DisplayListItem({
										label: "{OrderNo}",
										value: {
											path: 'Customer',
											formatter: that.getCustomerName.bind(that)
										}
									})
								});
								that.navigation = true;
							}
						}

					});
				// }
			}
		},

		getTotals: function(oEvent) {
			var oHeaderT = this.getView().getModel('local').getProperty('/orderHeaderTemp');
			var oLocale = new sap.ui.core.Locale("en-US");
			var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
			if ((oHeaderT.FinalBalance) && (oHeaderT.FinalBalance !== "")) {
				this.finalBal = oFloatFormat.parse(oHeaderT.FinalBalance)
			}
			if ((oHeaderT.TotalOrderValue) && (oHeaderT.TotalOrderValue !== "")) {
				// this.TotalOrderValue = oFloatFormat.parse(oHeaderT.TotalOrderValue)
				this.orderAmount = oFloatFormat.parse(oHeaderT.TotalOrderValue);
			}
			if ((oHeaderT.Deduction) && (oHeaderT.Deduction !== "")) {
				this.deduction = oFloatFormat.parse(oHeaderT.Deduction)
			}
		},
		ValueChange: function(oEvent) {
			var tablePath = "";
			var i = "";
			this.getTotals(oEvent);
			this.Calculation(oEvent, tablePath, i);
			this.noChangeTable.push(this.noChange);
			this.byId("Sales--idSaveIcon").setColor('red');
		}, //ValueChange function end

		setNewValue: function(data, fieldId, newValue) {
			//get the weight
			if (fieldId === "IdWeight") {
				if (data.Weight !== newValue) {
					data.Weight = newValue;
				}
			}
			if (fieldId === "IdWeightD") {
				if (data.WeightD !== newValue) {
					data.WeightD = newValue;
				}
			}
			//get the making charges
			if (fieldId === "IdMaking") {
				if (data.Making !== newValue) {
					data.Making = newValue;
				}
			}
			//making D
			if (fieldId === "IdMakingD") {
				if (data.MakingD !== newValue) {
					data.MakingD = newValue;
				}
			}
			// quantity of stone / quantityD
			if (fieldId === "IdQtyD") {
				if (data.QtyD !== newValue) {
					data.QtyD = newValue;
				}
			}
			// quantity
			if (fieldId === "IdQty") {
				if (data.Qty !== newValue) {
					data.Qty = newValue;
				}
			}
		},

		getFloatValue: function(data, oFloatFormat, quantityOfStone) {

			if (data.Making) {
				if (data.Making === "") {
					data.Making = 0;
				} else if (data.Making === 0) {
					data.Making = 0;
				} else {
					var making = data.Making.toString();
					data.Making = oFloatFormat.parse(making);
				}
			} else {
				data.Making = 0;
			}

			//MakindD
			if (data.MakingD) {
				if (data.MakingD === "") {
					data.MakingD = 0;
					makingD = 0;
				} else if (data.MakingD === 0) {
					data.MakingD = 0;
					makingD = 0;
				} else {
					var makingD = data.MakingD.toString();
					data.MakingD = oFloatFormat.parse(makingD);
				}
			} else {
				data.MakingD = 0;
				makingD = 0;
			}
			//weight
			if (data.Weight) {
				if (data.Weight === "") {
					data.Weight = 0;
				} else
				if (data.Weight === 0) {
					data.Weight = 0;
				} else {
					var weight = data.Weight.toString();
					data.Weight = oFloatFormat.parse(weight);
				}
			} else {
				data.Weight = 0;
			}

			//WeightD
			if (data.WeightD) {
				if (data.WeightD === "") {
					data.WeightD = 0;
				} else if (data.WeightD === 0) {
					data.WeightD = 0;
				} else {
					var weightD = data.WeightD.toString();
					data.WeightD = oFloatFormat.parse(weightD);
				}
			} else {
				data.WeightD = 0;
			}

			//Quantity
			if (data.Qty) {
				if (data.Qty === "") {
					data.Qty = 0;
				} else if (data.Qty === 0) {
					data.Qty = 0;
				} else {
					var qty = data.Qty.toString();
					data.Qty = oFloatFormat.parse(qty);
				}
			} else {
				data.Qty = 0;
			}

			//Quantity D
			if (data.QtyD) {
				if (data.QtyD === "") {
					data.QtyD = 0;
					quantityOfStone = 0;
				} else if (data.QtyD === 0) {
					data.QtyD = 0;
					quantityOfStone = 0;
				} else {
					var qtyD = data.QtyD.toString();
					data.QtyD = oFloatFormat.parse(qtyD);
					quantityOfStone = data.QtyD;
				}
			} else {
				data.QtyD = 0;
			}
		},

		deleteReturn: function(oEvent, selIdxs) {
			var oHeaderT = this.getView().getModel('local').getProperty('/orderHeaderTemp');
			var oLocale = new sap.ui.core.Locale("en-US");
			var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
			var subTotal = oFloatFormat.parse(this.getView().getModel('returnModel').getProperty('/TransData')[selIdxs].SubTotal);
			this.deduction = this.deduction - subTotal;
			if (this.deduction === 0) {
				this.finalBal = this.orderAmount;
			} else {
				this.finalBal = this.orderAmount - this.deduction;
			}

			//set value on screen
			if ((this.deduction) && (this.deduction !== "")) {
				oHeaderT.Deduction = this.getIndianCurr(this.deduction);
			} else {
				oHeaderT.Deduction = 0;
			}
			if ((this.orderAmount) && (this.orderAmount !== "")) {
				oHeaderT.TotalOrderValue = this.getIndianCurr(this.orderAmount);
			}
			if ((this.finalBal) && (this.finalBal !== "")) {
				oHeaderT.FinalBalance = this.getIndianCurr(this.finalBal);
			}
			this.getView().getModel('local').setProperty('/orderHeaderTemp', oHeaderT);
		},

		finalCalculation: function(category, data, priceF, tablePath, cells,
			quantityOfStone, gold20pergm, gold22pergm,
			silverpergm) {
				debugger;
			var oLocale = new sap.ui.core.Locale("en-US");
			var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
			var Qty1 = data.Weight * data.Qty;
			var QtyD1 = data.WeightD * data.QtyD;
			if ((category.Type === 'Gold' && category.Category === "gm") ||
			(category.Type === 'GLD' && category.Category === "gm") ||
			(category.Type === 'SLV' && category.Category === "gm") ||
				(category.Type === 'Silver' && category.Category === "gm")) {
				//get the final weight
				if (data.WeightD !== "" ||
					data.WeightD !== 0) {

					// var weightF = Qty1 - QtyD1;
					var weightF=data.Weight - data.WeightD
				} else {
					var weightF = data.Weight;
				}
				if (category.Type === 'Gold' || category.Type === 'GLD') {
					//get the gold price
					if (category.Karat === '22/22') {
						priceF = weightF * gold22pergm;
					} else
					if (category.Karat === '22/20') {
						priceF = weightF * gold20pergm;
					}
				} else if (category.Type === 'Silver'|| category.Type === 'SLV') {
					priceF = weightF * silverpergm;
				}
				//Making charges
				var makingCharges = data.Making * weightF;
				// var makingCharges = data.Making * Qty1;
				var stonevalue = quantityOfStone * data.MakingD;
				// var stonevalue = QtyD1 * data.MakingD;
				if ((priceF || makingCharges || stonevalue) ||
					(priceF === 0 || makingCharges === 0 || stonevalue === 0)) {
					var subTot = (priceF + makingCharges + stonevalue);

					if ((data.SubTotal) && (data.SubTotal != "")) {
						var currentSubTot = oFloatFormat.parse(data.SubTotal);
						this.orderAmount = subTot + this.orderAmount - currentSubTot;
					} else {
						data.SubTotal = 0;
						this.orderAmount = subTot + this.orderAmount;
						var orderAmount = this.orderAmount;
					}
					var orderAmount = this.orderAmount;
					var orderAmount = orderAmount.toString();
					var orderAmountF = this.getIndianCurr(orderAmount);
					this.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValue', orderAmountF);
					var subTotF = this.getIndianCurr(subTot);
					// gold price per gram
					if (tablePath) {

						if (subTotF) {
							category.SubTotal = subTotF;
						} else {
							category.SubTotal = 0;
						}
						//capture if there is any change
						// this.noChange.flag = true;
						this.getView().byId("orderItemBases").getModel("orderItems").setProperty(tablePath, category);
					} else {
						if (subTotF != "") {
							cells[cells.length - 1].setText(subTotF);
						} else {
							cells[cells.length - 1].setText('0');
						}
					}
				} else {
					cells[cells.length - 1].setText(0)
				}
			} else
			if (category.Type === 'GS') {
				//german silver//ignore Weight//Quantity Check
				//charges of german silver
				var charges = data.Qty * data.Making;
				var chargesD = data.QtyD * data.MakingD;
				// var charges = (data.Weight * data.Qty) * data.Making;
				// var chargesD = (data.WeightD * data.QtyD) * data.MakingD;
				//final charges on GS
				if (charges) {
					var subTot = charges + chargesD;
					var subTotF = this.getIndianCurr(subTot);
					if ((data.SubTotal) && (data.SubTotal != "")) {
						var currentSubTot = oFloatFormat.parse(data.SubTotal);
						this.orderAmount = subTot + this.orderAmount - currentSubTot;
					} else {
						this.orderAmount = subTot + this.orderAmount;
					}
					var orderAmount = this.orderAmount;
					var orderAmount = orderAmount.toString();
					var orderAmountF = this.getIndianCurr(orderAmount);
					this.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValue', orderAmountF);
					if (tablePath) {

						category.SubTotal = subTotF;
						// this.byId("Sales--idSaveIcon").setColor('red');
						this.noChange = true;
						this.getView().byId("orderItemBases").getModel("orderItems").setProperty(tablePath, category);
					} else {
						cells[cells.length - 1].setText(subTotF);
					}
				} else {
					cells[cells.length - 1].setText(0);
				}
			} else if ((category.Type === "Gold" && category.Category === "pcs") ||
			(category.Type === "GLD" && category.Category === "pcs") ||
			(category.Type === "SLV" && category.Category === "pcs") ||
				(category.Type === 'Silver' && category.Category === "pcs")) {
				//get the final weight
				if (data.WeightD !== "" ||
					data.WeightD !== 0) {
							// var weightF = Qty1 - QtyD1;
					var weightF = data.Weight - data.WeightD;
				} else {
					var weightF = data.Weight;
				}

				if (category.Type === 'Gold' || category.Type === 'GLD') {
					//get the gold price
					if (category.Karat === '22/22') {
						priceF = weightF * gold22pergm;
					} else
					if (category.Karat === '22/20') {
						priceF = weightF * gold20pergm;
					}
				} else if (category.Type === 'Silver' || category.Type === 'SLV') {
					priceF = weightF * silverpergm;
				}
				if (!priceF) {
					var priceF = 0;
				}
				//Making of Product
				var makingOfProduct = data.Qty * data.Making;
				// var makingOfProduct = Qty1 * data.Making;
				if (!makingOfProduct) {
					var makingOfProduct = 0;
				}
				//Stone value
				var stonevalue = quantityOfStone * data.MakingD;
					// var stonevalue = QtyD1 * data.MakingD;
				if (!stonevalue) {
					var stonevalue = 0;
				}
				if (priceF || makingOfProduct || stonevalue) {
					// gold price per gram
					var subTot = priceF + makingOfProduct + stonevalue;

					if ((data.SubTotal) && (data.SubTotal != "")) {
						var currentSubTot = oFloatFormat.parse(data.SubTotal);
						this.orderAmount = subTot + this.orderAmount - currentSubTot;
					} else {
						this.orderAmount = subTot + this.orderAmount;
					}
					var orderAmount = this.orderAmount;
					var orderAmount = orderAmount.toString();
					var orderAmountF = this.getIndianCurr(orderAmount);
					this.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValue', orderAmountF);

					var subTotF = this.getIndianCurr(subTot);
					if (tablePath) {
						category.SubTotal = subTotF;
						this.noChange = true;
						// this.byId("Sales--idSaveIcon").setColor('red');
						this.getView().byId("orderItemBases").getModel("orderItems").setProperty(tablePath, category);
					} else {
						cells[cells.length - 1].setText(subTotF);
					}
				} else {
					cells[cells.length - 1].setText(0)
				}
			} //end of per PCs calculation
		},


		onSuggest: function(oEvent) {
			// var key = oEvent.which || oEvent.keyCode || oEvent.charCode;
		const key = oEvent.key
		var id1 = oEvent.getParameter("id").split("--")[2]
		// if() alert('backspace');
			var searchStr = oEvent.getParameter("suggestValue");
			if(searchStr === "" || key == 8 || key === "Backspace" || key === "Delete"){
					this.getView().byId("customerId").setValue("");
				return;
			}
			if(!searchStr) {
				searchStr = oEvent.getParameter("newValue");
			}
			if(searchStr){
				var oFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("CustomerCode", sap.ui.model.FilterOperator.Contains, searchStr.toUpperCase()),
						new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, searchStr.toUpperCase())
					],
					and: false
				});
			}

			oEvent.getSource().getBinding("suggestionItems").filter(oFilter);
			var oSorter = new sap.ui.model.Sorter({

						path: "CustomerCode",
						descending: false

					});
	oEvent.getSource().getBinding("suggestionItems").sort(oSorter);
			this.getView().byId("customerId").setValue(searchStr);

							// this.getView().byId("idCash").focus();
							// this.getView().byId("idCash").$().find("input").select();
		},




		Calculation: function(oEvent, tablePath, i) {
			var that = this;
			var anubhav = 0;
			var orderHeader = this.getView().getModel('local').getProperty('/orderHeader');
			if ((oEvent.getId() === "orderReload") || (oEvent.getSource().getBindingInfo('value').binding.getPath().split('/')[1] ===
					'orderHeader')) {
				if (tablePath) {
					var category = this.getView().byId("orderItemBases").getModel("orderItems").getProperty(tablePath);
					var path = tablePath;
					var cells = this.getView().byId("orderItemBases")._getVisibleColumns();
					//only in case of table header change
					if (oEvent.getId() != "orderReload") {
						this.byId("Sales--idSaveIcon").setColor('red');
					}
				}
			} else {
				var oPath = oEvent.getSource().getParent().getBindingContext("orderItems").getPath();
				var category = this.getView().byId("orderItemBases").getModel("orderItems").getProperty(oPath);
				var path = this.getView().byId('orderItemBases').getBinding().getPath() + '/' + oEvent.getSource().getParent().getIndex();
				var oCurrentRow = oEvent.getSource().getParent();
				var cells = oCurrentRow.getCells();
				var i = oEvent.getSource().getParent().getIndex();
			}
			var data = this.getView().getModel('orderItems').getProperty(path);
			var priceF = 0.00;
			var tempWeight = 0.00;
			if (oEvent.getId() != "orderReload") {
				var fieldId = oEvent.getSource().getId().split('---')[1].split('--')[1].split('-')[0];
				var newValue = oEvent.getParameters().newValue;
			}
			//per gm
			var gold22pergm = orderHeader.GoldBhav22 / 10;
			var gold20pergm = orderHeader.GoldBhav20 / 10;
			var silverpergm = orderHeader.SilverBhav / 1000;
			var quantityOfStone = data.QtyD;
			var oLocale = new sap.ui.core.Locale("en-US");
			var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);

			if ((!category.Category) || (!category.Type)) {
				if (category.Material !== "") {
					that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							"/Products('" + category.Material + "')", "GET", {}, {}, that)
						.then(function(oData) {
							category.Category = oData.Category;

							if (!category.Making || category.Making === 0) {
								category.Making = oData.Making;
							}
							category.Tunch = oData.Tunch;
							category.Type = oData.Type;
							category.Karat = oData.Karat;
							if (fieldId) {
								that.setNewValue(data, fieldId, newValue);
								this.valueChange = 'true';
							}

							that.getFloatValue(data, oFloatFormat, quantityOfStone);
							that.finalCalculation(category, data, priceF, tablePath, cells,
								quantityOfStone, gold20pergm, gold22pergm,
								silverpergm);
							that.finalBal = that.orderAmount - that.deduction;
							if (that.finalBal === 0) {
								var finalBal = 0;
							} else {
								var finalBal = that.getIndianCurr(that.finalBal);
							}
							if (that.deduction === 0) {
								var deduction = 0;
							} else {
								var deduction = that.getIndianCurr(that.deduction);
							}
							if (that.orderAmount === 0) {
								var orderAmount = 0;
							} else {
								var orderAmount = that.getIndianCurr(that.orderAmount);
							}
							that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValue', orderAmount);
							that.getView().getModel('local').setProperty('/orderHeaderTemp/Deduction', deduction);
							that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalance', finalBal);
						})
						.catch(function(oError) {
							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);
						});
				}
			} else {
				if (newValue != "") {
					this.setNewValue(data, fieldId, newValue);
					this.valueChange = "true"
				}
				this.getFloatValue(data, oFloatFormat, quantityOfStone);
				this.finalCalculation(category, data, priceF, tablePath, cells,
					quantityOfStone, gold20pergm, gold22pergm,
					silverpergm);

				that.finalBal = that.orderAmount - that.deduction;
				if (that.finalBal === 0) {
					var finalBal = 0;
				} else {
					var finalBal = this.getIndianCurr(this.finalBal);
				}
				if (that.deduction === 0) {
					var deduction = 0;
				} else {
					var deduction = that.getIndianCurr(that.deduction);
				}
				if (that.orderAmount === 0) {
					var orderAmount = 0;
				} else {
					var orderAmount = that.getIndianCurr(that.orderAmount);
				}
				that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValue', orderAmount);
				that.getView().getModel('local').setProperty('/orderHeaderTemp/Deduction', deduction);
				that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalance', finalBal);
			} //Category else part
			this.byId("IdMaking");
			this.byId("IdMakingD");
			this.byId("IdWeightD");
			this.byId("IdWeight");
			this.byId("IdQty");
			this.byId("IdQtyD");
			this.byId("sbhavid");
		}, //calculation function end
		toggleFullScreen: function() {
			var btnId = "idFullScreenBtn";
			var headerId = "Sales--orderHeader";
			this.toggleUiTable(btnId, headerId)
		}
	});
});
