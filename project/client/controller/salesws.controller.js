/*global location*/
sap.ui.define(
	["victoria/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"victoria/models/formatter",
		"sap/m/MessageToast",
		"sap/ui/model/Filter",
		"sap/m/MessageBox"
	],
	function(BaseController, JSONModel, History, formatter,
		MessageToast, Filter, MessageBox) {
		"use strict";

		return BaseController.extend("victoria.controller.salesws", {
			formatter: formatter,
			FinalBalanceCash: 0,
			FinalBalanceGold: 0,
			FinalBalanceSilver: 0,
			TotalOrderValueCash: 0,
			TotalOrderValueGold: 0,
			TotalOrderValueSilver: 0,
			DeductionCash: 0,
			DeductionGold: 0,
			DeductionSilver: 0,
			onInit: function(oEvent) {

				BaseController.prototype.onInit.apply(this);
				var oRouter = this.getRouter();
				oRouter.getRoute("salesws").attachMatched(this._onRouteMatched, this);
				this.getPrintCustHeaderData();
			},
			_onRouteMatched: function(oEvent) {
				var that = this;
				this.clearScreen(oEvent);
				setTimeout(function(){
					$("input[type='Number']").focus(function () {
						$(this).select();
					});}, 3000);
			},
			onAfterRendering: function(){
			  $("input[type='Number']").focus(function () {
			    $(this).select();
			  });
			},
			valueHelpCustomer: function(oEvent) {
				this.getCustomerPopup(oEvent);
			},
			onEnter:function(oEvent){
			  this.getCustomer(oEvent);
			},
			setStatus: function(color) {
				this.byId("WSHeaderFragment--idSaveIcon").setColor(color);
			},
			getStatus: function() {
				var currStatus = this.byId("WSHeaderFragment--idSaveIcon").getColor();
				return currStatus;
			},
			moveNext: function(oEvent){
				//getsource
				//getParent
				//currentcellindex +1
				//if lastcell

			},
			onSubmitQuantity: function(oEvent){
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[3].focus();
			},
			onSubmitQuantityD: function(oEvent){
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[4].focus(oEvent);
			},
			onSubmitWeight: function(oEvent){
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[5].focus();
				//this.getView().byId("IdWeightD").focus();
			},
			onSubmitWeightD: function(oEvent){
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[6].focus(oEvent);
			},
			onSubmitMaking: function(oEvent){
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[7].focus();
			},
			onSubmitMakingD: function(oEvent){
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[8].focus();
			},
			onSubmitTunch: function(oEvent){
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[9].focus();
			},
			onReturnSubmitWeight: function(oEvent){
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[2].focus();
			},
			onReturnSubmitKWeight: function(oEvent){
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[3].focus();
			},
			onReturnSubmitTunch: function(oEvent){
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[4].focus();
			},
			onReturnSubmitQty: function(oEvent){
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[5].focus();
			},
			onReturnSubmitBhav: function(oEvent){
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[6].focus();
			},
			onReturnSubmitDropdown: function (oEvent) {
				var oCurrentControl = oEvent.getSource();
				var oRow = oCurrentControl.getParent();
				oRow.getCells()[1].focus();
			},
			onConfirm: function(oEvent) {

				// if (oEvent.getParameter('id') === 'orderNo') {
				if (oEvent.getParameters().selectedItem.mBindingInfos.label.binding.sPath === 'OrderNo') {
					this.setStatus('green');
					var orderDetail = this.getView().getModel('local').getProperty('/WSOrderHeader');
					var orderNo = oEvent.getParameter("selectedItem").getLabel();
					var orderId = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
					// this.OrderDetails(orderId);
					this.getView().getModel("local").setProperty("/WSOrderHeader/OrderNo",
						orderNo);
					var oOrderId = this.getView().getModel('local').getProperty('/OrderId');
					oOrderId.OrderId = orderId;
					oOrderId.OrderNo = orderNo;
					this.getView().getModel('local').setProperty('/OrderId', oOrderId);
					if (orderDetail.Customer) {
						var oFilter = new sap.ui.model.Filter("Customer", "EQ", "'" + orderDetail.Customer + "'");
					} else {
						var oFilter = new sap.ui.model.Filter("Customer", "EQ", "'" + "");
					}
					oEvent.sId = "orderReload";
					this.getOrderDetails(oEvent, orderId, oFilter, orderNo);
					this.orderSearchPopup.destroyItems();
				} else {
					this.setStatus('red');
					var oId = oEvent.getParameter('selectedItem').getId();
					var oCustDetail = this.getView().getModel('local').getProperty('/orderHeaderTemp');
					var oSource = oId.split("-" [0])

					var selCust = oEvent.getParameter("selectedItem").getLabel();
					var selCustName = oEvent.getParameter("selectedItem").getValue();
					// oCustDetail.customerId = selCust;
					// oCustDetail.CustomerName = selCustName;
					this.getView().getModel("local").setProperty("/WSOrderHeader/Customer",
						oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
					this.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerId",
						selCust);
					this.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerName",
						selCustName);
					this.getView().byId("WSHeaderFragment--custName").setText(selCustName);
					// Removing error notif. if value is entered
					this.getView().byId("WSHeaderFragment--customerId").setValueState("None");
				}
			},
			orderItem: function(oEvent, id) {
				//create the model to set the getProperty
				//visible or // NOT

				// this.setVisible(oEvent,id);
				//create json model
				var oOrderItem = new sap.ui.model.json.JSONModel();
				//create array
				var array = [];
				//loop the array values
				for (var i = 1; i <= 20; i++) {
					//var baseItem = this.getView().getModel("local").getProperty("/orderItemBase");
					var oItem = {
						"OrderNo": "",
						"itemNo": "",
						"Material": "",
						// "MaterialCode": "",
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
					};
					array.push(oItem);
				}
				//set the Data
				oOrderItem.setData({
					"itemData": array
				});
				//set the model

				this.setModel(oOrderItem, "orderItems");
			},
			orderReturn: function(oEvent, id) {
				//create the model to set the getProperty
				//visible or // NOT
				// this.setVisible(oEvent,id);
				//create structure of an array
				var oTransData = new sap.ui.model.json.JSONModel();
				var aTtype = [];
				for (var i = 1; i <= 5; i++) {
					var oRetailtab = {
						"Type": "",
						"Key": "",
						"ReturnId": "",
						"Weight": 0,
						"KWeight": 0,
						"Tunch": 0,
						"Qty": 0,
						"Bhav": 0,
						"Remarks": "",
						"SubTotalS": 0,
						"SubTotalG": 0,
						"SubTotal": 0,
						"CreatedBy": "",
						"CreatedOn": "",
						"ChangedBy": "",
						"ChangedOn": ""
					};
					aTtype.push(oRetailtab);
				}
				oTransData.setData({
					"TransData": aTtype
				});
				this.setModel(oTransData, "returnModel");
			},
			getOrderDetails: function(oEvent, orderId, oFilter, orderNo) {

				var that = this;
				that.orderItem(oEvent);
				that.orderReturn(oEvent);
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/WSOrderHeaders('" + orderId + "')", "GET", {
							filters: [oFilter]
						}, {}, this)
					.then(function(oData) {

						that.getView().setBusy(false);
						var date = oData.Date;
						var custId = oData.Customer;
						var customerData = that.allMasterData.customers[custId];
						debugger;
						that.TotalOrderValueCash = 0;
						that.TotalOrderValueGold = 0;
						that.TotalOrderValueSilver = 0;
						if (oData.SummaryMode == "O") {
							that.getView().byId("WSHeaderFragment--RB-4").setSelected(true);
						} else if (oData.SummaryMode == "C") {
							that.getView().byId("WSHeaderFragment--RB-1").setSelected(true);
						} else if (oData.SummaryMode == "G") {
							that.getView().byId("WSHeaderFragment--RB-2").setSelected(true);
						} else if (oData.SummaryMode == "S") {
							that.getView().byId("WSHeaderFragment--RB-3").setSelected(true);
						}
						var customerCity =  customerData.City;
						that.getView().getModel("local").setProperty("/WSOrderHeader", oData);
						that.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerId", customerData.CustomerCode);
						that.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerName", customerData.Name + " - " + that.allMasterData.cities[customerCity].cityName);
						that.getView().byId("WSHeaderFragment--custName").setText(customerData.Name + " - " + that.allMasterData.cities[customerCity].cityName);
						var postedEntryData = that.getView().getModel('local').getProperty('/EntryData');
						that.getEntryData(oEvent, custId, orderNo, date, postedEntryData)
						// var oFilter = new sap.ui.model.Filter("Customer","EQ", "'" + myData.Customer + "'");
						// assign the details on ui
						//   var that2 = this;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
								"/WSOrderHeaders('" + orderId + "')/ToWSOrderItem",
								"GET", {}, {}, that)
							.then(function(oData) {
								debugger;
								if (oData.results.length > 0) {
									// that.orderItem(oEvent);
									var allItems = that.getView().getModel("orderItems").getProperty("/itemData");
									for (var i = 0; i < oData.results.length; i++) {

										allItems[i].OrderNo = oData.results[i].OrderNo;
										allItems[i].itemNo = oData.results[i].id;
										allItems[i].Making = oData.results[i].Making;
										allItems[i].MakingD = oData.results[i].MakingD;
										allItems[i].Qty = oData.results[i].Qty;
										allItems[i].QtyD = oData.results[i].QtyD;
										allItems[i].Tunch = oData.results[i].Tunch;
										allItems[i].Weight = oData.results[i].Weight;
										allItems[i].WeightD = oData.results[i].WeightD;
										allItems[i].Remarks = oData.results[i].Remarks;
										var MaterialData = that.allMasterData.materials[oData.results[i].Material];
										allItems[i].Material = oData.results[i].Material;
										if (MaterialData) {
											allItems[i].Description = MaterialData.ProductName;
											allItems[i].MaterialCode = MaterialData.ProductCode;
										} else {
											MessageToast.show("One or more Materials in Order has been deleted in Master! Order Cannot be reloaded!");
										}

										// allItems[i].Category = MaterialData.ProductCode;
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

						that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
								"/WSOrderHeaders('" + orderId + "')/ToWSOrderReturns",
								"GET", {}, {}, that)
							.then(function(oData) {

								oEvent.sId = "orderReload";
								oEvent.viewId = "idsalesws";
								if (oData.results.length > 0) {
									// that.orderReturn(oEvent);
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
										var orderHeader = that.getView().getModel('local').getProperty('/WSOrderHeader');
										that.returnCalculation(oEvent, orderHeader, seletedLine);
									}
									// that.getView().getModel("returnModel").setProperty("/TransData", allReturns);
								}
							});

					})
					.catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
					});
			},
			//on order valuehelp,get the exsisting order from //DB
			valueHelpOrder: function(oEvent) {
				debugger;
				this.orderPopup(oEvent);
				this.orderSearchPopup.destroyItems();
			},
			orderPopup: function(oEvent) {
				//call the popup screen dynamically

				// if (!this.orderSearchPopup) {
				this.orderSearchPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
				this.getView().addDependent(this.orderSearchPopup);
				var title = this.getView().getModel("i18n").getProperty("orderSearch");
				this.orderSearchPopup.setTitle(title);
				// this.orderSearchPopup.sId = 'orderNo';
				var orderDate = this.byId("WSHeaderFragment--DateId").getValue();
				var customer = this.getView().getModel('local').getProperty('/WSOrderHeader').Customer;
				//when you sending date to filter use date Object var oObj = new Date(yyyymmdd);
				var dateFrom = new Date(orderDate);
				dateFrom.setHours(0, 0, 0, 1)
				var dateTo = new Date(orderDate);
				dateTo.setHours(23, 59, 59, 59)
				//Now you have to have 2 date Object
				//firstDate object set the time to 000000 second object 240000
				//now create 2 filter one ge low and two le High

				var oFilter1 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, dateFrom);
				var oFilter2 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, dateTo);
				if (customer) {
					var oFilter3 = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.Contains, customer);
				} else {
					var oFilter3 = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.Contains, "");
				}
				var orFilter = new sap.ui.model.Filter({
					filters: [oFilter1, oFilter2],
					and: true
				});
				var orFilterF = new sap.ui.model.Filter({
					filters: [orFilter, oFilter3],
					and: true
				});

				this.orderSearchPopup.bindAggregation("items", {
					path: '/WSOrderHeaders',
					filters: orFilter,
					template: new sap.m.DisplayListItem({
						label: "{OrderNo}",
						value: {
							path: 'Customer',
							formatter: this.getCustomerName.bind(this)
						}
					})
				});

				// }//order popup
				this.orderSearchPopup.open();
			},
			onSearch: function(oEvent) {

				var sourceField = oEvent.getSource().getId();
				var searchStr = oEvent.getParameter("value");
				if (searchStr) {
					var searchStrLower = searchStr.toLowerCase();
					var searchStrUpper = searchStr.toUpperCase();
					var searchStrUpLow = searchStr[0].toUpperCase() + searchStr.substr(1).toLowerCase();
				} else {
					searchStrLower = "";
					searchStrUpper = "";
					searchStrUpLow = "";
				}
				if (sourceField === "orderNo") {
					var oFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("OrderNo", sap.ui.model.FilterOperator.Contains, searchStr)
							// new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.Contains, searchStrLower),
							// new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.Contains, searchStrUpper),
							// new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.Contains, searchStrUpLow)
						],
						and: false
					});
					this.orderSearchPopup.getBinding("items").filter(oFilter);
				} else {
					var oFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("CustomerCode", sap.ui.model.FilterOperator.Contains, searchStrUpper),
							new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, searchStrLower),
							new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, searchStrUpper),
							new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, searchStrUpLow)
						],
						and: false
					});
					this.searchPopup.getBinding("items").filter(oFilter);
				}
			},
			onLiveSearch: function(oEvent) {

				this.onSearch(oEvent);
			},
			ValueChange: function(oEvent) {
				var tablePath = "";
				var i = "";
				this.Calculation(oEvent, tablePath, i);
				// this.onTunchChange(oEvent);
				// this.WSCalculation(oEvent);
				this.setStatus('red');
			},
			WSCalculation: function(oEvent) {

				var category = this.getView().byId("WSItemFragment--orderItemBases").getModel("orderItems").getProperty(oEvent.getSource().getParent().getBindingContext("orderItems").getPath());
				var oCurrentRow = oEvent.getSource().getParent();
				var cells = oCurrentRow.getCells();
				var fieldId = oEvent.getSource().getId().split('---')[1].split('--')[2].split('-')[0];
				var newValue = oEvent.getParameters().newValue;

				var oLocale = new sap.ui.core.Locale("en-US");
				var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
				if ((category.Type === 'Gold' && category.Category === "gm") ||
					(category.Type === 'Silver' && category.Category === "gm")) {
					//get the weight
					if (fieldId === "IdWeight") {
						if (category.Weight !== newValue) {
							category.Weight = newValue;
						}
					}
					if (category.Weight === "") {
						var weight = 0;
					} else
					if (category.Weight === 0) {
						var weight = 0;
					} else {
						var weight = oFloatFormat.parse(category.Weight);
					}

					if (fieldId === "IdWeightD") {
						if (category.WeightD !== newValue) {
							category.WeightD = newValue;
						}
					}
					if (category.WeightD === "") {
						var weightD = 0;
					} else if (category.WeightD === 0) {
						var weightD = 0;
					} else {
						var weightD = oFloatFormat.parse(category.WeightD);
					}

					//get the final weight // X=Weight - WeightD
					if (weightD !== "" ||
						weightD !== 0) {
						var weightF = weight - weightD;
					} else {
						var weightF = weight;
					};

					//get the making charges
					if (fieldId === "IdMaking") {
						if (category.Making !== newValue) {
							category.Making = newValue;
						}
					}
					if (category.Making === "") {
						category.Making = 0;
						var making = 0;
					} else if (category.Making === 0) {
						category.Making = 0;
						var making = 0;
					} else {
						var making = oFloatFormat.parse(category.Making);
					}

					//making D
					if (fieldId === "IdMakingD") {
						if (category.MakingD !== newValue) {
							category.MakingD = newValue;
						}
					}
					if (category.MakingD === "") {
						category.MakingD = 0;
						var makingD = 0;
					} else if (category.MakingD === 0) {
						category.MakingD = 0;
						var makingD = 0;
					} else {
						var makingD = oFloatFormat.parse(category.MakingD);
					}

					//Making charges
					var makingCharges = making * weightF;

					// quantity of stone / quantityD
					if (fieldId === "IdQtyD") {
						if (category.QtyD !== newValue) {
							category.QtyD = newValue;
						}
					}
					if (category.QtyD === "") {
						category.QtyD = 0;
						var quantityD = 0;
						var quantityOfStone = 0;
					} else if (category.QtyD === 0) {
						category.QtyD = 0;
						var quantityD = 0;
						var quantityOfStone = 0;
					} else {
						var quantityD = oFloatFormat.parse(category.QtyD);
						var quantityOfStone = quantityD;
					}

					var stonevalue = quantityOfStone * makingD;

					//Tunch
					if (fieldId === "IdTunch") {
						if (category.Tunch !== newValue) {
							category.Tunch = newValue;
						}
					}

					if (category.Tunch === "") {
						category.Tunch = 0;
						var tunch = 0;
					} else if (category.Tunch === 0) {
						category.Tunch = 0;
						var tunch = 0;
					} else {
						var tunch = oFloatFormat.parse(category.Tunch);
					}

					// SubTotalSilver / SubTotalGold = X * Tunch / 100
					if (weight === 0) {
						// cells[10].setText(0);
						// cells[11].setText(0);
						cells[cells.length - 3].setText(0);
						cells[cells.length - 2].setText(0)
					} else {
						if (category.Type === "Silver") {
							// cells[10].setText(weightF * tunch / 100);
							cells[cells.length - 3].setText(weightF * tunch / 100);
							cells[cells.length - 2].setText(0);
							// category.SubTotalS = weightF * tunch / 100;
						} else if (category.Type === "Gold") {
							// cells[11].setText(weightF * tunch / 100);
							cells[cells.length - 2].setText(weightF * tunch / 100);
							cells[cells.length - 3].setText(0);
							// category.SubTotalG = weightF * tunch / 100;
						};
					};

					if (weight === 0) {
						// cells[12].setValue(0);
						cells[cells.length - 1].setText(0);
					} else {
						if (makingCharges || stonevalue) {
							// gold price per gram
							// cells[12].setText(makingCharges + stonevalue);
							// category.SubTot = makingCharges + stonevalue;
							var subTot = makingCharges + stonevalue;
							var subTotF = this.getIndianCurr(subTot);
							cells[cells.length - 1].setText(subTotF);
						} else {
							// cells[12].setText(0);
							cells[cells.length - 1].setText(0);
							// category.SubTot = 0;
						};
					};

				} else if ((category.Type === 'Gold' && category.Category === "pcs") ||
					(category.Type === 'Silver' && category.Category === "pcs")) {
					//get the weight
					if (fieldId === "IdWeight") {
						if (category.Weight !== newValue) {
							category.Weight = newValue;
						}
					}
					if (category.Weight === "") {
						var weight = 0;
					} else
					if (category.Weight === 0) {
						var weight = 0;
					} else {
						var weight = oFloatFormat.parse(category.Weight);
					}

					if (fieldId === "IdWeightD") {
						if (category.WeightD !== newValue) {
							category.WeightD = newValue;
						}
					}
					if (category.WeightD === "") {
						var weightD = 0;
					} else
					if (category.WeightD === 0) {
						var weightD = 0;
					} else {
						var weightD = oFloatFormat.parse(category.WeightD);
					}

					//get the final weight // X=Weight - WeightD
					if (weightD !== "" ||
						weightD !== 0) {
						var weightF = weight - weightD;
					} else {
						var weightF = weight;
					};

					//get the making charges
					if (fieldId === "IdMaking") {
						if (category.Making !== newValue) {
							category.Making = newValue;
						}
					}
					if (category.Making === "") {
						category.Making = 0;
						var making = 0;
					} else if (category.Making === 0) {
						category.Making = 0;
						var making = 0;
					} else {
						var making = oFloatFormat.parse(category.Making);
					}

					//making D
					if (fieldId === "IdMakingD") {
						if (category.MakingD !== newValue) {
							category.MakingD = newValue;
						}
					}
					if (category.MakingD === "") {
						category.MakingD = 0;
						var makingD = 0;
					} else if (category.MakingD === 0) {
						category.MakingD = 0;
						var makingD = 0;
					} else {
						var makingD = oFloatFormat.parse(category.MakingD);
					}

					// quantity of material
					if (fieldId === "IdQty") {
						if (category.Qty !== newValue) {
							category.Qty = newValue;
						}
					}
					if (category.Qty === "") {
						category.Qty = 0;
						var quantity = 0;
					} else if (category.Qty === 0 || category.Qty === "0") {
						category.Qty = 0;
						var quantity = 0;
					} else {
						var quantity = oFloatFormat.parse(category.Qty);
					}

					//Making charges
					var makingCharges = making * quantity;

					// quantity of stone / quantityD
					if (fieldId === "IdQtyD") {
						if (category.QtyD !== newValue) {
							category.QtyD = newValue;
						}
					}
					if (category.QtyD === "") {
						category.QtyD = 0;
						var quantityD = 0;
						var quantityOfStone = 0;
					} else if (category.QtyD === 0 || category.QtyD === "0") {
						var quantityD = 0;
						var quantityOfStone = 0;
					} else {
						var quantityD = oFloatFormat.parse(category.QtyD);
						var quantityOfStone = quantityD;
					}

					if (quantityD !== "" ||
						quantityD !== 0) {
						var quantityOfStone = quantityD;
					} else {
						category.QtyD = 0;
						var quantityOfStone = 0;
					};

					var stonevalue = quantityOfStone * makingD;

					//Tunch
					if (fieldId === "IdTunch") {
						if (category.Tunch !== newValue) {
							category.Tunch = newValue;
						}
					}
					if (category.Tunch === "") {
						category.Tunch = 0;
						var tunch = 0;
					} else if (category.Tunch === 0) {
						category.Tunch = 0;
						var tunch = 0;
					} else {
						var tunch = oFloatFormat.parse(category.Tunch);
					}

					if (weight === 0) {
						// cells[10].setText(0);
						// cells[11].setText(0);
						cells[cells.length - 3].setText(0);
						cells[cells.length - 2].setText(0);
					} else {
						if (category.Type === "Silver") {
							// cells[10].setText(weightF * tunch / 100);
							cells[cells.length - 3].setText(weightF * tunch / 100);
							cells[cells.length - 2].setText(0);
							// category.SubTotalS = weightF * tunch / 100;
						} else if (category.Type === "Gold") {
							// cells[11].setText(weightF * tunch / 100);
							cells[cells.length - 2].setText(weightF * tunch / 100);
							cells[cells.length - 3].setText(0);
							// category.SubTotalG = weightF * tunch / 100;
						};
					};

					if (weight === 0) {
						// cells[12].setValue(0);
						cells[cells.length - 1].setText(0);
					} else {
						if (makingCharges || stonevalue) {
							// gold price per gram
							// cells[12].setText(makingCharges + stonevalue);
							// category.SubTot = makingCharges + stonevalue;
							var subTot = makingCharges + stonevalue;
							var subTotF = this.getIndianCurr(subTot);
							cells[cells.length - 1].setText(subTotF);
						} else {
							// cells[12].setText(0);
							cells[cells.length - 1].setText(0);
							// category.SubTot = 0;
						};
					};

				} else if (category.Type === 'GS') {
					//german silver//ignore Weight//Quantity Check
					if (fieldId === "IdQty") {
						if (category.Qty !== newValue) {
							category.Qty = newValue;
						}
					}
					if (category.Qty === "") {
						category.Qty = 0;
						var quantity = 0;
					} else if (category.Qty === 0 || category.Qty === "0") {
						category.Qty = 0;
						var quantity = 0;
					} else {
						var quantity = oFloatFormat.parse(category.Qty);
					}

					//Making charges
					if (fieldId === "IdMaking") {
						if (category.Making !== newValue) {
							category.Making = newValue;
						}
					}
					if (category.Making === "") {
						category.Making = 0;
						var making = 0;
					} else if (category.Making === 0) {
						category.Making = 0;
						var making = 0;
					} else {
						var making = oFloatFormat.parse(category.Making);
					}
					//charges of german silver
					var charges = quantity * making;

					//QuantityD
					if (fieldId === "IdQtyD") {
						if (category.QtyD !== newValue) {
							category.QtyD = newValue;
						}
					}
					if (category.QtyD === "") {
						category.QtyD = 0;
						var quantityD = 0;
						var quantityOfStone = 0;
					} else if (category.QtyD === 0 || category.QtyD === "0") {
						var quantityD = 0;
						var quantityOfStone = 0;
					} else {
						var quantityD = oFloatFormat.parse(category.QtyD);
						var quantityOfStone = quantityD;
					}

					// makingD charges
					if (fieldId === "IdMakingD") {
						if (category.MakingD !== newValue) {
							category.MakingD = newValue;
						}
					}
					if (category.MakingD === "") {
						category.MakingD = 0;
						var makingD = 0;
					} else if (category.MakingD === 0) {
						category.MakingD = 0;
						var makingD = 0;
					} else {
						var makingD = oFloatFormat.parse(category.MakingD);
					}
					var chargesD = quantityD * makingD;
					//final charges on GS
					if (charges) {
						var subTot = charges + chargesD;
						var subTotF = this.getIndianCurr(subTot);
						cells[cells.length - 1].setText(subTotF);
					} else {
						cells[cells.length - 1].setText(0);
					}
				};
			},
			onSetting: function(oEvent) {
				this.hideDColumns(oEvent);
			},
			gGBhav: 0,
			gGBhavK: 0,
			gSBhav: 0,
			gSBhavK: 0,
			ValueChangeHeader: function(oEvent) {
				this.setStatus('red');
			},
			// onTableExpand: function(oEvent) {
			// 	var splitApp = sap.ui.getCore().byId("__xmlview0--idSplitApp");
			// 	var masterVisibility = splitApp.getMode();
			// 	if (masterVisibility == "ShowHideMode") {
			//
			// 		splitApp.setMode(sap.m.SplitAppMode.HideMode);
			// 	} else {
			// 		splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
			// 	}
			// },

			clearScreen: function(oEvent) {
				var that = this;
				this.setStatus('green');
				delete this.TotalOrderValueCash;
				delete this.TotalOrderValueGold;
				delete this.TotalOrderValueSilver;
				delete this.DeductionCash;
				delete this.DeductionGold;
				delete this.DeductionSilver;
				delete this.FinalBalanceCash;
				delete this.FinalBalanceGold;
				delete this.FinalBalanceSilver;

				var ovisibleSet = new JSONModel({
					set: true
				});
				this.setModel(ovisibleSet, "VisibleSet");
				//Clear Header Details
				var oHeader = this.getView().getModel('local').getProperty('/WSOrderHeader');
				var oHeaderT = this.getView().getModel('local').getProperty('/orderHeaderTemp');
				oHeaderT.CustomerName = "";
				oHeaderT.CustomerId = "";
				oHeader.OrderNo = "";
				oHeader.Customer = "";
				oHeaderT.TotalOrderValueCash = "0";
				oHeaderT.TotalOrderValueGold = "0";
				oHeaderT.TotalOrderValueSilver = "0";
				oHeaderT.DeductionCash = "0";
				oHeaderT.DeductionGold = "0";
				oHeaderT.DeductionSilver = "0";
				oHeaderT.FinalBalanceCash = "0";
				oHeaderT.FinalBalanceGold = "0";
				oHeaderT.FinalBalanceSilver = "0";
				oHeaderT.CombinedBalance = "";
				oHeaderT.BalanceSuffix = "";
				var postedEntryData = that.getView().getModel('local').getProperty('/EntryData');
				postedEntryData.Customer = "";
				postedEntryData.Date ="";
				postedEntryData.OrderNo ="";
				postedEntryData.OrderType ="";
				postedEntryData.Remarks ="";
				postedEntryData.id ="";
				postedEntryData.Cash ="";
				postedEntryData.ChangedBy="";
				postedEntryData.ChangedOn="";
				postedEntryData.CreatedBy="";
				postedEntryData.CreatedOn="";
				that.getView().getModel('local').setProperty('/EntryData',postedEntryData);
				this.getView().byId("WSHeaderFragment--RB-4").setSelected(true);
				this.getView().byId("WSHeaderFragment--custName").setText("");
				this.getView().getModel('local').setProperty('/orderHeaderTemp', oHeaderT);
				// oHeader.Date=new Date();
				this.getView().getModel('local').setProperty('/WSorderHeader', oHeader);
				// this.getView().getModel("local").setProperty("/WSorderHeader/Date", formatter.getFormattedDate(0));
				this.getView().byId("WSHeaderFragment--DateId").setDateValue(new Date());
				this.ODataHelper.callOData(that.getOwnerComponent().getModel(),
						"/CustomCalculations", "GET", {}, {}, that)
					.then(function(oData) {

						that.getView().getModel("local").setProperty("/CustomCalculations", oData);
						that.getView().getModel("local").setProperty("/WSOrderHeader/Goldbhav", oData.results[0].Gold1);
						that.getView().getModel("local").setProperty("/WSOrderHeader/GoldbhavK", oData.results[0].KacchaGold);
						that.getView().getModel("local").setProperty("/WSOrderHeader/SilverBhav", oData.results[0].Silver1);
						that.getView().getModel("local").setProperty("/WSOrderHeader/SilverBhavK", oData.results[0].KacchaSilver);
						that.gGBhav = oData.results[0].Gold1
						that.gGBhavK = oData.results[0].KacchaGold
						that.gSBhav = oData.results[0].Silver1
						that.gSBhavK = oData.results[0].KacchaSilver

					}).catch(function(oError) {

					});
				//Clear Item table
				this.orderItem(oEvent);
				this.materialPopupOrderItem(oEvent);
				this.orderReturn(oEvent);
			},
			onClear: function(oEvent) {

				var that = this;

				var saveStatus = this.getStatus();
				if (saveStatus == "red") {
					MessageBox.error("Are you sure you want to clear all entries? All unsaved changes will be lost!", {
						title: "Alert!",
						actions: ["Save & Clear", "Clear", MessageBox.Action.CANCEL],
						onClose: function(oAction) {
							if (oAction === "Clear") {
								that.clearScreen(oEvent);
								that.setStatus('green');
								MessageToast.show("Screen cleared successfully!");
							} else if (oAction === "Save & Clear") {

								var saveStatus = that.onSave(oEvent);
								if (saveStatus) {
									that.clearScreen(oEvent);
									MessageToast.show("Data has been Saved! Screen cleared successfully!");
								}

							}
						}
					});
				} else if (saveStatus == "green") {
					// MessageBox.error("Are you sure you want to clear all entries?", {
					// 	title: "Alert!",
					// 	actions: ["Clear", MessageBox.Action.CANCEL],
					// 	onClose: function(oAction) {
					// 		if (oAction === "Clear") {
					that.clearScreen(oEvent);
					that.setStatus('green');
					// 			MessageToast.show("Screen cleared successfully!");
					// 		}
					// 	}
					// });
				}
			},
			onDelete: function(oEvent) {
				debugger;
				var that = this;
				var viewId = oEvent.getSource().getParent().getParent().getId().split('---')[1].split('--')[0];
				var oSourceCall = oEvent.getSource().getParent().getParent().getId().split('---')[1].split('--')[1];
				var oLocale = new sap.ui.core.Locale("en-US");
				var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
				// Correcting source call as there's a fragment id defined for items table
				if (oSourceCall !== "OrderReturn") {
					oSourceCall = "WSItemFragment--orderItemBases";
				};
				var selIdxs = that.getView().byId(oSourceCall).getSelectedIndices();
				if (selIdxs.length && selIdxs.length !== 0) {
					MessageBox.error("Are you sure you want to delete the selected entries", {
						title: "Alert",
						actions: ["Delete selected entries", sap.m.MessageBox.Action.CLOSE],
						onClose: function(sButton) {

							if (sButton === "Delete selected entries") {
								// var selIdxs = that.getView().byId("WSItemFragment--orderItemBases").getSelectedIndices();
								for (var i = selIdxs.length - 1; i >= 0; --i) {
									if (oSourceCall === 'WSItemFragment--orderItemBases') {
										var id = that.getView().getModel("orderItems").getProperty("/itemData")[i].itemNo;
										var pid = that.getView().getModel("orderItems").getProperty("/itemData")[selIdxs].Material;
										var orderId = that.getView().getModel("orderItems").getProperty("/itemData")[selIdxs].OrderNo;
										var date = that.getView().byId("WSHeaderFragment--DateId").getDateValue();
										// TotalOrderValueCash: 0,
										// TotalOrderValueGold: 0,
										// TotalOrderValueSilver: 0,
										var itemDetail = that.getView().getModel("orderItems").getProperty("/itemData")[selIdxs];
										var subtotalItem = oFloatFormat.parse(itemDetail.SubTotal);
										if (subtotalItem) {
											that.TotalOrderValueCash = that.TotalOrderValueCash - subtotalItem;
											var TotalOrderValueCash = that.getIndianCurr(that.TotalOrderValueCash);
											that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueCash', TotalOrderValueCash);
										}
										var subtotalItemS = oFloatFormat.parse(itemDetail.SubTotalS);
										if (subtotalItemS) {
											that.TotalOrderValueSilver = that.TotalOrderValueSilver - subtotalItemS;
											var TotalOrderValueSilver = that.getIndianCurr(that.TotalOrderValueSilver);
											that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueSilver', TotalOrderValueSilver);
										}
										var subtotalItemG = oFloatFormat.parse(itemDetail.SubTotalG);
										if (subtotalItemG) {
											that.TotalOrderValueGold = that.TotalOrderValueGold - subtotalItemG;
											var TotalOrderValueGold = that.getIndianCurr(that.TotalOrderValueGold);
											that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueGold', TotalOrderValueGold);
										}
										that.FinalBalanceCash = that.TotalOrderValueCash - that.DeductionCash;
										that.FinalBalanceGold = that.TotalOrderValueGold - that.DeductionGold;
										that.FinalBalanceSilver = that.TotalOrderValueSilver - that.DeductionSilver;
										if (that.FinalBalanceCash === 0) {
											var FinalBalanceCash = 0;
										} else {
											var FinalBalanceCash = that.getIndianCurr(that.FinalBalanceCash);
										}
										that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceCash', FinalBalanceCash);

										if (that.FinalBalanceGold === 0) {
											var FinalBalanceGold = 0;
										} else {
											var FinalBalanceGold = that.getIndianCurr(that.FinalBalanceGold);
										}
										that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceGold', FinalBalanceGold);

										if (that.FinalBalanceSilver === 0) {
											var FinalBalanceSilver = 0;
										} else {
											var FinalBalanceSilver = that.getIndianCurr(that.FinalBalanceSilver);
										}
										that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceSilver', FinalBalanceSilver);
										// If row contains id(which means it has been saved in DB)
										if (id) {

											var stockData = that.getView().getModel('local').getProperty('/stockMaint')
											stockData.Product = pid;
											stockData.OrderItemId = id;
											stockData.Date = date;
											stockData.Weight = that.getView().getModel("orderItems").getProperty("/itemData")[selIdxs].Weight;
											stockData.Quantity = that.getView().getModel("orderItems").getProperty("/itemData")[selIdxs].Qty;
											var myUrl = "/WSOrderItems('" + id + "')"
											that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,
												"DELETE", {}, {}, that)
												$.post("/StockDelete",{Stock: stockData})
									      .then(function(result){
									        debugger;
									        var stockId = result.id;
									        that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
									                                  "/stockMaints('" + stockId + "')",
									                                      "DELETE", {}, {}, that)
									      });
										} else {
											that.setStatus("red");
										};
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
										sap.m.MessageToast.show("Selected lines are deleted");
									} //sourcecallCheck
									else if (oSourceCall === 'OrderReturn') {

										that.deleteReturnValues(oEvent, i, selIdxs[i], viewId, oTableData);
									} //order return else part
								} //for i loop
								if (oSourceCall === 'WSItemFragment--orderItemBases') {
									that.getView().byId('WSItemFragment--orderItemBases').clearSelection();
								} else {
									that.getView().byId('OrderReturn').clearSelection();
								}
							} //sButton
							// sap.m.MessageToast.show("Selected lines are deleted");
						} //onclose
					}); //Messagebox
				} // if selindx length check
				else { // if selindx length check
					MessageBox.show(
						"Please Select the entry to be deleted", {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							actions: [MessageBox.Action.OK],
							onClose: function(oAction) {}
						});
				} // if selindx length check
			},
			//on order create Button
			orderCreate: function(oEvent) {

				var that = this;
				if (this.getView().getModel('local').getProperty('/WSOrderHeader').OrderNo) {
					var id = oEvent.getSource().getParent().getParent().getParent().getId().split('---')[1].split('--')[0];
					MessageBox.confirm("Are you sure you want to create a new Order? All unsaved changes will be lost!", {
						title: "Confirm", // default
						onClose: function(sButton) {
							if (sButton === MessageBox.Action.OK) {

								var orderdate = that.getView().getModel('local').getProperty('/WSOrderHeader').Date;
								var customerNo = that.getView().getModel('local').getProperty('/WSOrderHeader').Customer;
								var customerId = that.getView().getModel('local').getProperty('/orderHeaderTemp').CustomerId;
								var customerName = that.getView().getModel('local').getProperty('/orderHeaderTemp').CustomerName;
								var order = that.getView().getModel('local').getProperty('/WSOrderHeader')
								that.clearScreen(oEvent);
								that.getView().getModel('local').setProperty('/orderHeaderTemp/CustomerId', customerId);
								that.getView().byId("WSHeaderFragment--custName").setText(customerName);
								that.getView().getModel('local').setProperty('/WSOrderHeader/Customer', customerNo);
								if (that.getView().byId("WSHeaderFragment--RB-1").getSelected()) {
									var SummaryMode = "C";
								} else if (that.getView().byId("WSHeaderFragment--RB-2").getSelected()) {
									var SummaryMode = "G";
								} else if (that.getView().byId("WSHeaderFragment--RB-3").getSelected()) {
									var SummaryMode = "S";
								} else if (that.getView().byId("WSHeaderFragment--RB-4").getSelected()) {
									var SummaryMode = "O";
								}
								that.getView().getModel('local').setProperty('/WSOrderHeader/SummaryMode', SummaryMode);
								// that.clearScreen(oEvent);
								that.newOrderCreate();
							} //Sbutton if condition
						} //onClose
					});
				} else {
					that.newOrderCreate();
				}
			},
			newOrderCreate: function() {
				var that = this;
				that.getView().setBusy(true);
				// get the data from screen in local model

				var orderData = this.getView().getModel('local').getProperty("/WSOrderHeader");
				if (orderData.Customer === "") {
					this.getView().byId("WSHeaderFragment--customerId").setValueState("Error").setValueStateText("Please choose Customer before creating Order");
					that.getView().setBusy(false);
				} else {

					if (orderData) {
						orderData.id = "";
						orderData.CreatedBy = "";
						orderData.ChangedBy = "";
						orderData.CreatedOn = "";
						orderData.CreatedBy = "";
						delete orderData.ToWSOrderItem;
						delete orderData.ToCustomers;
						delete orderData.ToWSOrderReturns;
						// that.orderCustomCalculations();
					}
					//call the odata promise method to post the data
					orderData.Date = this.getView().byId("WSHeaderFragment--DateId").getValue();
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/WSOrderHeaders",
							"POST", {}, orderData, this)
						.then(function(oData) {
							that.getView().setBusy(false);

							//create the new json model and get the order id no generated
							var oOrderId = that.getView().getModel('local').getProperty('/OrderId');
							oOrderId.OrderId = oData.id;
							oOrderId.OrderNo = oData.OrderNo;
							that.getView().getModel('local').setProperty('/OrderId', oOrderId);
							//assign the no on ui
							that.getView().getModel("local").setProperty("/WSOrderHeader/OrderNo", oData.OrderNo);
						})
						.catch(function(oError) {

							if (oError.responseText.includes("last order already empty use same")) {
								var id = oError.responseText.split(':')[2];
								if (id) {
									that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
											"/WSOrderHeaders(" + id + ")",
											"GET", {}, {}, that)
										.then(function(oData) {

											that.getView().setBusy(false);
											//create the new json model and get the order id no generated
											var oOrderHeader = that.getView().getModel('local').getProperty('/WSOrderHeader');
											oOrderHeader.OrderId = oData.id;
											oOrderHeader.OrderNo = oData.OrderNo;

											var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("WSOrderCheckMsg");
											that.getView().getModel('local').setProperty('/WSOrderHeader', oOrderHeader);
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
				}
			},
			onValidation: function() {
				var that = this;
				//---all validation true
				var retVal = true;
				//header validations
				var oHeader = this.getView().getModel('local').getProperty('/WSOrderHeader');
				if (oHeader.OrderNo === 0 ||
					oHeader.OrderNo === "") {
					retVal = false;
					MessageBox.show(
						"Please create Order Number first", {
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
				var oOrderDetail = that.getView().getModel('local').getProperty('/WSOrderItem');
				var oTableDetails = that.getView().byId("WSItemFragment--orderItemBases");
				var tableBinding = oTableDetails.getBinding("rows");
				//---all errors are false
				var returnError = false;
				// WeightD cannot be bigger than Weight
				if ((data.Weight) && (data.WeightD) &&
					(data.WeightD > data.Weight)) {
					oTableDetails.getRows()[i].getCells()[4].setValueState("Error");
				} else {
					oTableDetails.getRows()[i].getCells()[4].setValueState("None");
				}
				//Quantity
				if ((data.Type === 'GS') ||
					((data.Type === 'Gold' && data.Category === "pcs") ||
						(data.Type === 'Silver' && data.Category === "pcs"))) {
					if (data.Qty === "" || data.Qty === 0) {
						this.getView().setBusy(false);
						oTableDetails.getRows()[i].getCells()[2].setValueState("Error");
						oTableDetails.getRows()[i].getCells()[4].setValueState("None");
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
					if (data.Weight === "" || data.Weight === 0) {
						this.getView().setBusy(false);
						oTableDetails.getRows()[i].getCells()[4].setValueState("Error");
						oTableDetails.getRows()[i].getCells()[2].setValueState("None");
						returnError = true;
						return;
					} else {
						oOrderDetail.Weight = data.Weight;
						oTableDetails.getRows()[i].getCells()[4].setValueState("None");
						this.getView().setBusy(false);
						// returnError = false;
					}
				} //Gold/Silver check
				return returnError;
			},
			onReturnSave: function(oEvent, oId, oCommit) {
				var returnTable = this.getView().getModel('local').getProperty('/WSOrderReturn');
				var oReturnTable = this.getView().byId('OrderReturn');
				var oBindingR = oReturnTable.getBinding("rows");
				for (var i = 0; i < oBindingR.getLength(); i++) {
					var that = this;
					var data = oBindingR.oList[i];
					if (data.Key != "") {
						returnTable.Key = data.Key;
						//Type
						if (data.Type === "" || data.Type === 0) {
							returnTable.Type = 0;
						} else {
							returnTable.Type = data.Type;
							//OrderId
							if (oId) {
								returnTable.OrderNo = oId;
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
							//SubTotal
							if (data.SubTotal === "" || data.SubTotal === 0) {
								returnTable.SubTotal = 0;
							} else {
								returnTable.SubTotal = data.SubTotal;
							}
							// SubTotalGold
							if (data.SubTotalG === "" || data.SubTotalG === 0) {
								returnTable.SubTotalG = 0;
							} else {
								returnTable.SubTotalG = data.SubTotalG;
							}
							//SubTotalSilver
							if (data.SubTotalS === "" || data.SubTotalS === 0) {
								returnTable.SubTotalS = 0;
							} else {
								returnTable.SubTotalS = data.SubTotalS;
							}

							var oReturnOrderClone = JSON.parse(JSON.stringify(returnTable));
							//return data save
							if (data.ReturnId == false) {
								that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
										"/WSOrderReturns", "POST", {}, oReturnOrderClone, this)
									.then(function(oData) {

										that.getView().setBusy(false);
										//loop the detaisl
										var allItems = that.getView().getModel("returnModel").getProperty("/TransData");
										for (var i = 0; i < allItems.length; i++) {
											if (allItems[i].Type === oData.Type) {
												allItems[i].ReturnId = oData.id;
												allItems[i].orderNo = oId;
												oCommit = true;
												break;
											} //material compare if condition
										} //for loop
										that.getView().getModel("returnModel").setProperty("/TransData", allItems);
										that.getView().setBusy(false);
										sap.m.MessageToast.show("Data Saved Successfully");
									})
									.catch(function(oError) {
										that.getView().setBusy(false);
										var oPopover = that.getErrorMessage(oError);
									});
							}
						} //type check
					} //key check
				} //forloop
				return oCommit;
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
						var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + '.' + decimal[1];
					} else {
						var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
					}
					return res;
				}
			},
			onSave: function(oEvent) {
				var that = this;
				//if header check pass
				if (this.onValidation() === true) {
					//Item and value check
					var oOrderDetail = this.getView().getModel('local').getProperty('/WSOrderItem')
					var oTableDetails = this.getView().byId('WSItemFragment--orderItemBases');
					var oBinding = oTableDetails.getBinding("rows");
					var itemError = false;
					var valueCheck = false;
					var returnCheck = false;
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
						this.setStatus("green");
						MessageToast.show("Data Saved Successfully");
					}

					//error if no valid entry
					if (valueCheck === false) {
						sap.m.MessageBox.error("Please Enter Valid entries before save", {
							title: "Error", // default
							styleClass: "", // default
							initialFocus: null, // default
							textDirection: sap.ui.core.TextDirection.Inherit, // default
							onClose: function(sButton) {}
						});
					}
				}

				if (valueCheck === true && returnCheck === true && itemError === false) {
					var statusGreen = true;
					return statusGreen;
				}
			},
			commitRecords: function(oEvent) {
				if (this.getStatus() === 'red') {
					var that = this;
					var oHeader = that.getView().getModel('local').getProperty('/WSOrderHeader');
					var oId = that.getView().getModel('local').getProperty('/OrderId').OrderId;
					//order header put
					that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							"/WSOrderHeaders('" + oId + "')", "PUT", {}, oHeader, this)
						.then(function(oData) {

							message.show("Order Saved");
							that.getView().setBusy(false);
						})
						.catch(function(oError) {

							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);
						});

					var oOrderDetail = this.getView().getModel('local').getProperty('/WSOrderItem')
					var oTableDetails = this.getView().byId('WSItemFragment--orderItemBases');
					var oBinding = oTableDetails.getBinding("rows");
					var itemError = false;
					var oCommit = false;
					for (var i = 0; i < oBinding.getLength(); i++) {
						var that = this;
						var data = oBinding.oList[i];
						if (data.Material !== "") {
							oOrderDetail.OrderNo = oId; //orderno // ID
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

							//making
							if (data.Tunch === "" || data.Tunch === 0) {
								oOrderDetail.Tunch = 0;
							} else {
								oOrderDetail.Tunch = data.Tunch;
							}

							oOrderDetail.Remarks = data.Remarks;
							// oOrderDetail.SubTotal = data.SubTot;
							var oOrderDetailsClone = JSON.parse(JSON.stringify(oOrderDetail));
							//Item data save

							if (data.itemNo == false) {
								that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
										"/WSOrderItems", "POST", {}, oOrderDetailsClone, this)
									.then(function(oData) {

										//loop the detaisl
										var allItems = that.getView().getModel("orderItems").getProperty("/itemData");
										that.getView().setBusy(false);
										for (var i = 0; i < allItems.length; i++) {
											if (allItems[i].Material === oData.Material) {
												allItems[i].itemNo = oData.id;
												allItems[i].OrderNo = oId;
												that.stockTransfer(allItems[i]);
												// if (oCommit === false) {
												// 	that.onReturnSave(oEvent, oId, oCommit);
												// }
												// that.setStatus('green');
												break;
											} //material compare if condition
										} //for loop
										that.getView().getModel("orderItems").setProperty("/itemData", allItems);
										that.getView().setBusy(false);
										sap.m.MessageToast.show("Data Saved Successfully");
									})
									.catch(function(oError) {
										that.getView().setBusy(false);
										var oPopover = that.getErrorMessage(oError);
									});
									that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
											"/Products('" + oOrderDetailsClone.Material + "')",
											"PUT", {}, {
												"CustomerTunch": oOrderDetailsClone.Tunch
											}, that)
										.then(function(oData) {})
										.catch(function(oError) {
											that.getView().setBusy(false);
											var oPopover = that.getErrorMessage(oError);
										});
							}
						}
					}
					//Return values save
					if (oCommit === false) {
						that.onReturnSave(oEvent, oId, oCommit);
					}
					that.setStatus('green');
				} else {
					sap.m.MessageBox.error("No change in data records", {
						title: "Error",
						onClose: function(sButton) {}
					});
				}
			},
			stockTransfer: function(allItems) {
				var that = this;
				var orderNo = this.getView().getModel('local').getProperty('/WSOrderHeader/OrderNo');
				// var orderId = this.getView().getModel('local').getProperty('/orderHeaderTemp/OrderId');
				var orderDate = this.getView().getModel('local').getProperty('/WSOrderHeader/Date');
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
				stockData.OrderType = 'W';
				stockData.Date = orderDate;
				stockData.Remarks = "[Auto-Entry]Wholesale Sales Stock " + "for order" + " " + orderNo;

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
			toggleFullScreen: function() {

				var btnId = "WSItemFragment--idFullScreenBtn";
				var headerId = "WSHeaderFragment--WSOrderHeader";
				this.toggleUiTable(btnId, headerId)
			},
			finalCalculation: function(category, data, tablePath, cells) {

				var that = this;
				var oLocale = new sap.ui.core.Locale("en-US");
				var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
				if ((data.SubTotal) && (data.SubTotal != "")) {
					var oldSubTot = oFloatFormat.parse(data.SubTotal);
				} else {
					var oldSubTot = 0;
				}

				if ((data.SubTotalG) && (data.SubTotalG != "")) {
					var oldSubTotG = oFloatFormat.parse(data.SubTotalG);
				} else {
					var oldSubTotG = 0;
				}

				if ((data.SubTotalS) && (data.SubTotalS != "")) {
					var oldSubTotS = oFloatFormat.parse(data.SubTotalS);
				} else {
					var oldSubTotS = 0;
				}

				if ((category.Type === 'Gold' && category.Category === "gm") ||
					(category.Type === 'Silver' && category.Category === "gm")) {

					//get the final weight // X=Weight - WeightD
					if (data.WeightD !== "" ||
						data.WeightD !== 0) {
						var weightF = data.Weight - data.WeightD;
					} else {
						var weightF = data.Weight;
					};

					//Making charges
					var makingCharges = data.Making * weightF;
					var stonevalue = data.QtyD * data.MakingD;


					if ((makingCharges || stonevalue) ||
						(makingCharges === 0 || stonevalue === 0)) {
						var subTot = makingCharges + stonevalue;
						subTot = parseFloat(subTot).toFixed(0);
						var subTotF = this.getIndianCurr(subTot);
						if (tablePath) {

							category.SubTotal = subTotF;
							// this.setStatus('red');
							this.getView().byId("WSItemFragment--orderItemBases").getModel("orderItems").setProperty(tablePath, category);
						} else {
							cells[cells.length - 1].setText(subTotF);
						}
					} else {
						cells[cells.length - 1].setText(0);
					};


				} else if ((category.Type === 'Gold' && category.Category === "pcs") ||
					(category.Type === 'Silver' && category.Category === "pcs")) {

					//get the final weight // X=Weight - WeightD
					if (data.WeightD !== "" ||
						data.WeightD !== 0) {
						var weightF = data.Weight - data.WeightD;
					} else {
						var weightF = data.Weight;
					};

					//Making charges
					var makingCharges = data.Making * data.Qty;

					var stonevalue = data.QtyD * data.MakingD;


					if ((makingCharges || stonevalue) ||
						(makingCharges === 0 || stonevalue === 0)) {
						var subTot = makingCharges + stonevalue;
						subTot = parseFloat(subTot).toFixed(0);
						var subTotF = this.getIndianCurr(subTot);
						if (tablePath) {

							category.SubTotal = subTotF;
							// this.setStatus('red');
							this.getView().byId("WSItemFragment--orderItemBases").getModel("orderItems").setProperty(tablePath, category);
						} else {
							cells[cells.length - 1].setText(subTotF);
						}
					} else {
						cells[cells.length - 1].setText(0);
					};

				} else if (category.Type === 'GS') {
					//german silver//ignore Weight//Quantity Check

					//charges of german silver
					var charges = data.Qty * data.Making;

					var chargesD = data.QtyD * data.MakingD;
					//final charges on GS
					if (charges) {
						var subTot = charges + chargesD;
						subTot = parseFloat(subTot).toFixed(0);
						var subTotF = this.getIndianCurr(subTot);
						if (tablePath) {

							category.SubTotal = subTotF;
							// this.setStatus('red');
							this.getView().byId("WSItemFragment--orderItemBases").getModel("orderItems").setProperty(tablePath, category);
						} else {
							cells[cells.length - 1].setText(subTotF);
						}
					} else {
						cells[cells.length - 1].setText(0);
					}
				};

				if (category.Type === "Silver") {
					var SubTotalS = weightF * data.Tunch / 100;
					SubTotalS = parseFloat(SubTotalS).toFixed(2);
					var SubTotalG = 0;
					SubTotalG = parseFloat(SubTotalG).toFixed(3);
					// var FSubTotalS = this.getIndianCurr(SubTotalS);
					if (tablePath) {

						category.SubTotalS = SubTotalS;
						category.SubTotalG = SubTotalG;
						// this.setStatus('red');
						this.getView().byId("WSItemFragment--orderItemBases").getModel("orderItems").setProperty(tablePath, category);
					} else {
						cells[cells.length - 3].setText(SubTotalS);
						cells[cells.length - 2].setText(SubTotalG);
					}

				} else if (category.Type === "Gold") {

					var SubTotalG = weightF * data.Tunch / 100;
					SubTotalG = parseFloat(SubTotalG).toFixed(3);
					var SubTotalS = 0;
					SubTotalS = parseFloat(SubTotalS).toFixed(2);
					// var FSubTotalG = this.getIndianCurr(SubTotalG);
					if (tablePath) {

						category.SubTotalG = SubTotalG;
						category.SubTotalS = SubTotalS;
						// this.setStatus('red');
						this.getView().byId("WSItemFragment--orderItemBases").getModel("orderItems").setProperty(tablePath, category);
					} else {
						cells[cells.length - 2].setText(SubTotalG);
						cells[cells.length - 3].setText(SubTotalS);
					}
				};

				if ((data.SubTotal) && (data.SubTotal != "")) {
					var currentSubTot = oFloatFormat.parse(data.SubTotal);
					this.TotalOrderValueCash = currentSubTot + this.TotalOrderValueCash - oldSubTot;
				}
				var orderAmountCash = this.TotalOrderValueCash.toString();
				orderAmountCash = parseFloat(orderAmountCash).toFixed(0);
				orderAmountCash = this.getIndianCurr(orderAmountCash);

				this.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueCash', orderAmountCash);

				if ((data.SubTotalG) && (data.SubTotalG != "")) {
					var currentSubTotG = oFloatFormat.parse(data.SubTotalG);
					this.TotalOrderValueGold = currentSubTotG + this.TotalOrderValueGold - oldSubTotG;
				}
				var orderGold = this.TotalOrderValueGold.toString();
				orderGold = parseFloat(orderGold).toFixed(3);
				orderGold = this.getIndianCurr(orderGold);
				this.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueGold', orderGold);

				if ((data.SubTotalS) && (data.SubTotalS != "")) {
					var currentSubTotS = oFloatFormat.parse(data.SubTotalS);
					this.TotalOrderValueSilver = currentSubTotS + this.TotalOrderValueSilver - oldSubTotS;
				}
				var orderSilver = this.TotalOrderValueSilver.toString();
				orderSilver = parseFloat(orderSilver).toFixed(2);
				orderSilver = this.getIndianCurr(orderSilver);
				this.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueSilver', orderSilver);
			},
			PreCalc: function(data, fieldId, newValue, oFloatFormat) {

				var that = this;
				that.setNewValue(data, fieldId, newValue);
				that.getFloatValue(data, oFloatFormat);
			},
			setNewValue: function(data, fieldId, newValue) {
				var that = this;
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
						that.onTunchMakingChange(data, fieldId, newValue);
					}
				}
				//making D
				if (fieldId === "IdMakingD") {
					if (data.MakingD !== newValue) {
						data.MakingD = newValue;
					}
				}

				// quantity
				if (fieldId === "IdQty") {
					if (data.Qty !== newValue) {
						data.Qty = newValue;
					}
				}

				// quantity of stone / quantityD
				if (fieldId === "IdQtyD") {
					if (data.QtyD !== newValue) {
						data.QtyD = newValue;
					}
				}

				//Tunch
				if (fieldId === "IdTunch") {
					if (data.Tunch !== newValue) {
						data.Tunch = newValue;
						that.onTunchMakingChange(data, fieldId, newValue);
					}
				}

			},
			getFloatValue: function(data, oFloatFormat) {
				if (data.Making === "") {
					data.Making = 0;
					// category.Making = 0;
				} else if (data.Making === 0) {
					data.Making = 0;
					// making = 0;
				} else {
					if(data.Making){
						var making = data.Making.toString();
						data.Making = oFloatFormat.parse(making);
				 }
				}

				//MakindD
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
				//weight
				if (data.Weight === "") {
					data.Weight = 0;
				} else
				if (data.Weight === 0) {
					data.Weight = 0;
				} else {
					var weight = data.Weight.toString();
					data.Weight = oFloatFormat.parse(weight);
				}
				//WeightD
				if (data.WeightD === "") {
					data.WeightD = 0;
				} else if (data.WeightD === 0) {
					data.WeightD = 0;
				} else {
					var weightD = data.WeightD.toString();
					data.WeightD = oFloatFormat.parse(weightD);
				}
				//Quantity
				if (data.Qty === "") {
					data.Qty = 0;
				} else if (data.Qty === 0) {
					data.Qty = 0;
				} else {
					var qty = data.Qty.toString();
					data.Qty = oFloatFormat.parse(qty);
				}
				//Quantity D
				if (data.QtyD === "") {
					data.QtyD = 0;
					// quantityOfStone = 0;
				} else if (data.QtyD === 0) {
					data.QtyD = 0;
					// quantityOfStone = 0;
				} else {
					var qtyD = data.QtyD.toString();
					data.QtyD = oFloatFormat.parse(qtyD);
					// quantityOfStone = data.QtyD;
				}

				// Tunch
				if (data.Tunch === "") {
					data.Tunch = 0;
					// var tunch = 0;
				} else if (data.Tunch === 0) {
					data.Tunch = 0;
					// var tunch = 0;
				} else {
					if(data.Tunch){
					var tunch = data.Tunch.toString();
					data.Tunch = oFloatFormat.parse(tunch);
				}
					// tunch = data.Tunch;
				}
			},
			Calculation: function(oEvent, tablePath, i) {

				var that = this;
				if ((oEvent.getId() === "orderReload") ||
					(oEvent.getSource().getBindingInfo('value').binding.getPath().split('/')[1] === 'orderHeader')) {
					if (tablePath) {
						var category = this.getView().byId("WSItemFragment--orderItemBases").getModel("orderItems").getProperty(tablePath);
						var path = tablePath;
						var cells = this.getView().byId("WSItemFragment--orderItemBases")._getVisibleColumns();
					}
				} else {
					var category = this.getView().byId("WSItemFragment--orderItemBases").getModel("orderItems").getProperty(oEvent.getSource().getParent().getBindingContext("orderItems").getPath());
					var path = this.getView().byId("WSItemFragment--orderItemBases").getBinding().getPath() + '/' + oEvent.getSource().getParent().getIndex();
					var oCurrentRow = oEvent.getSource().getParent();
					var cells = oCurrentRow.getCells();
					var i = oEvent.getSource().getParent().getIndex();
				}
				var data = this.getView().getModel('orderItems').getProperty(path);
				if (oEvent.getId() != "orderReload") {
					var fieldId = oEvent.getSource().getId().split('---')[1].split('--')[2].split('-')[0];
					var newValue = oEvent.getParameters().newValue;
				}
				var quantityOfStone = 0;
				var oLocale = new sap.ui.core.Locale("en-US");
				var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
				if ((!category.Category) || (!category.Type)) {
					if (category.Material !== "") {
						that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
								"/Products('" + category.Material + "')", "GET", {}, {}, that)
							.then(function(oData) {

								category.Category = oData.Category;
								if(!category.Making || category.Making === 0){
				          category.Making = oData.Making;
				        }
								if(!category.Tunch || category.Tunch === 0){
				          category.Tunch = oData.Tunch;
				        }
								category.Type = oData.Type;
								// category.Karat = oData.Karat;
								that.PreCalc(data, fieldId, newValue, oFloatFormat);
								that.finalCalculation(category, data, tablePath, cells);
								that.getFinalBalance();
								that.onRadioButtonSelect();
							})
							.catch(function(oError) {

								that.getView().setBusy(false);
								var oPopover = that.getErrorMessage(oError);
							});
					}
				}
				that.PreCalc(data, fieldId, newValue, oFloatFormat);
				that.finalCalculation(category, data, tablePath, cells);
				that.getFinalBalance();
				that.onRadioButtonSelect();
				this.byId("IdMaking");
				this.byId("IdMakingD");
				this.byId("IdWeightD");
				this.byId("IdWeight");
				this.byId("IdQty");
				this.byId("IdQtyD");
				this.byId("sbhavid");
			},
			onTunchMakingChange: function(data, fieldId, newValue) {
				debugger;
				var that = this;
				// var path = this.getView().byId("WSItemFragment--orderItemBases").getBinding().getPath() + '/' + oEvent.getSource().getParent().getIndex();
				// var data = this.getView().getModel('orderItems').getProperty(path);
				// var fieldId = oEvent.getSource().getId().split('---')[1].split('--')[2].split('-')[0];
				// var newValue = oEvent.getParameters().newValue;
				var oLocale = new sap.ui.core.Locale("en-US");
				var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
				var TunchData = this.getView().getModel('local').getProperty("/WSTunch");
				TunchData.Customer = this.getView().getModel('local').getProperty('/WSOrderHeader').Customer;
				TunchData.Product = data.Material;
				if (TunchData.Customer && TunchData.Product) {
					if (fieldId === "IdTunch") {
						if (data.Tunch !== newValue) {
							TunchData.Tunch = oFloatFormat.parse(newValue);
						} else {
							TunchData.Tunch = data.Tunch;
						}
					}

					if (fieldId === "IdMaking") {
						if (data.Making !== newValue) {
							TunchData.Making = oFloatFormat.parse(newValue);
						} else {
							TunchData.Making = data.Making;
						}
					}

					if (TunchData.Making === 0) {
						TunchData.Making = data.Making;
					}

					if (TunchData.Tunch === 0) {
						TunchData.Tunch = data.Tunch;
					}
				}
				// if (orderData.Customer === "")
				//call the odata promise method to post the data
				debugger;
				if (TunchData.Tunch || TunchData.Making) {
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/WSTunchs",
							"POST", {}, TunchData, this)
						.then(function(oData) {
							debugger;
							that.getView().setBusy(false);
						})
						.catch(function(oError) {
							debugger;
						})
				}
			},
			getFinalBalance: function() {
				debugger;
				var that = this;
				that.FinalBalanceCash = that.TotalOrderValueCash - that.DeductionCash;
				if (that.FinalBalanceCash === 0) {
					var FinalBalanceCash = 0;
				} else {
					var FinalBalanceCash = parseFloat(that.FinalBalanceCash).toFixed(0);
					FinalBalanceCash = that.getIndianCurr(FinalBalanceCash);

				}
				that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceCash', FinalBalanceCash);

				that.FinalBalanceGold = that.TotalOrderValueGold - that.DeductionGold;
				if (that.FinalBalanceGold === 0) {
					var FinalBalanceGold = parseFloat(0).toFixed(3);
					FinalBalanceGold = that.getIndianCurr(FinalBalanceGold);
				} else {
					var FinalBalanceGold = parseFloat(that.FinalBalanceGold).toFixed(3);
					FinalBalanceGold = that.getIndianCurr(FinalBalanceGold);

				}
				that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceGold', FinalBalanceGold);

				that.FinalBalanceSilver = that.TotalOrderValueSilver - that.DeductionSilver;
				if (that.FinalBalanceSilver === 0) {
					var FinalBalanceSilver = parseFloat(0).toFixed(2);
					FinalBalanceSilver = that.getIndianCurr(FinalBalanceSilver);
				} else {
					var FinalBalanceSilver = parseFloat(that.FinalBalanceSilver).toFixed(2);
					FinalBalanceSilver = that.getIndianCurr(FinalBalanceSilver);

				}
				that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceSilver', FinalBalanceSilver);
			},
			onReturnChange: function(oEvent) {
				debugger;
				if (oEvent.getSource().getId().split('---')[1].split('--')[0] == 'idsales') {
					this.byId("Sales--idSaveIcon").setColor('red');
				} else if (oEvent.getSource().getId().split('---')[1].split('--')[0] == 'idsalesws') {
					this.byId("WSHeaderFragment--idSaveIcon").setColor('red');
				};
				var path = oEvent.getSource().getParent().getBindingContext("returnModel").getPath();
				var seletedLine = this.getView().getModel('returnModel').getProperty(path);
				var sourceId = oEvent.getSource().getId().split('---')[1].split('--')[0];
				if (sourceId === 'idsales') {
					//retail sales detail
					var orderHeader = this.getView().getModel('local').getProperty('/orderHeader');
				} else {
					//WS order details
				}
				this.returnCalculation(oEvent, orderHeader, seletedLine);
				this.getFinalBalance();
				that.onRadioButtonSelect();
			},
			returnCalculation: function(oEvent, orderHeader, data) {
				debugger;
				if (oEvent.getId() === 'orderReload') {
					var seletedLine = this.getView().getModel('returnModel').getProperty(data);
					// var category = this.getView().byId("OrderReturn").getModel("returnModel").getProperty(data);
					var path = data;
					var cells = this.getView().byId("OrderReturn")._getVisibleColumns();
					viewId = oEvent.viewId;
				} else {
					var seletedLine = data;
					var newValue = oEvent.getParameters().newValue;
					var fieldId = oEvent.getParameters().id.split('---')[1].split('--')[1].split('-')[0];
					var viewId = oEvent.getSource().getId().split('---')[1].split('--')[0];
					var oCurrentRow = oEvent.getSource().getParent();
					var cells = oCurrentRow.getCells();
					// this.getView().getModel('local').setProperty('/OrderReturn',seletedLine);
				}
				var oLocale = new sap.ui.core.Locale("en-US");
				var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
				if (newValue) {
					this.setReturnNewValue(seletedLine, fieldId, newValue);
				}
				this.getReturnFloatValue(seletedLine, oFloatFormat);

				if ((seletedLine.SubTotal) && (seletedLine.SubTotal != "")) {
					var oldSubTot = oFloatFormat.parse(seletedLine.SubTotal);
				} else {
					var oldSubTot = 0;
				}

				if ((seletedLine.SubTotalG) && (seletedLine.SubTotalG != "")) {
					var oldSubTotG = oFloatFormat.parse(seletedLine.SubTotalG);
				} else {
					var oldSubTotG = 0;
				}

				if ((seletedLine.SubTotalS) && (seletedLine.SubTotalS != "")) {
					var oldSubTotS = oFloatFormat.parse(seletedLine.SubTotalS);
				} else {
					var oldSubTotS = 0;
				}
				if (seletedLine.Key === 'OG' ||
					seletedLine.Key === 'KG' ||
					seletedLine.Key === 'BG') {
					if (seletedLine.Key === 'BG') {
						seletedLine.Tunch = 100;
					}
					var bhavF = seletedLine.Bhav / 10;
					var weightF = seletedLine.Weight - seletedLine.KWeight;
					var fineGold = (seletedLine.Tunch * weightF) / 100;
					var subtotGold = parseFloat(fineGold).toFixed(3);
					var subTotal = fineGold * bhavF;
					var subTotalNoDecimal = parseFloat(subTotal).toFixed(0);
					subTotalNoDecimal = this.getIndianCurr(subTotalNoDecimal);
					var subTotF = this.getIndianCurr(subTotal)

					if (path) {
						seletedLine.SubTotal = subTotF;
						if (viewId == 'idsalesws') {
							seletedLine.SubTotal = subTotalNoDecimal;

							if (subTotal) {
								seletedLine.SubTotalG = 0
								seletedLine.SubTotalS = 0;
							} else {
								seletedLine.SubTotal = 0.
								seletedLine.SubTotalG = subtotGold;
								seletedLine.SubTotalS = 0;
							}
						}
						this.getView().byId("OrderReturn").getModel("returnModel").setProperty(path, seletedLine);
					} else {
						cells[cells.length - 1].setText(subTotF);
						if (viewId == 'idsalesws') {
							cells[cells.length - 1].setText(subTotalNoDecimal);
							if (subTotF) {
								cells[cells.length - 2].setText(0);
							} else {
								cells[cells.length - 2].setText(subtotGold);
								cells[cells.length - 3].setText(0);
							}
						}
					} //path check
				} else if (seletedLine.Key === 'OS' ||
					seletedLine.Key === 'KS' ||
					seletedLine.Key === 'BS') {
					if (seletedLine.Key === 'BS') {
						seletedLine.Tunch = 100;
					}
					var bhavF = seletedLine.Bhav / 1000;
					var weightF = seletedLine.Weight - seletedLine.KWeight;
					var fineSilver = (seletedLine.Tunch * weightF) / 100;
					var subtotSilver = parseFloat(fineSilver).toFixed(2);
					var subTotal = fineSilver * bhavF;
					var subTotalNoDecimal = parseFloat(subTotal).toFixed(0);
					subTotalNoDecimal = this.getIndianCurr(subTotalNoDecimal);
					var subTotF = this.getIndianCurr(subTotal)
					if (path) {
						seletedLine.SubTotal = subTotF;
						if (viewId == 'idsalesws') {
							seletedLine.SubTotal = subTotalNoDecimal;
							if (subTotal) {
								seletedLine.SubTotalG = 0
								seletedLine.SubTotalS = 0;
							} else {
								seletedLine.SubTotalS = subtotSilver;
								seletedLine.SubTotalG = 0;
								seletedLine.SubTotal = 0;
							}
						}

						this.getView().byId("OrderReturn").getModel("returnModel").setProperty(path, seletedLine);
					} else {
						cells[cells.length - 1].setText(subTotF);

						if (viewId == 'idsalesws') {
							cells[cells.length - 1].setText(subTotalNoDecimal);
							if (subTotal) {
								cells[cells.length - 3].setText(0);
								cells[cells.length - 2].setText(0);
							} else {
								cells[cells.length - 3].setText(subtotSilver);
								cells[cells.length - 2].setText(0);
								cells[cells.length - 1].setText(0);
							}
						}
					}
				} else if (seletedLine.Key === 'CASH') {
					var subTotF = this.getIndianCurr(seletedLine.Bhav)
					var wsSubTotF = parseFloat(seletedLine.Bhav).toFixed(0);
					wsSubTotF = this.getIndianCurr(wsSubTotF);
					if (path) {
						seletedLine.SubTotal = subTotF;
						if (viewId == 'idsalesws') {
							seletedLine.SubTotal = wsSubTotF;
						}
						this.getView().byId("OrderReturn").getModel("returnModel").setProperty(path, seletedLine);
					} else {
						cells[cells.length - 1].setText(subTotF);
						if (viewId == 'idsalesws') {
							cells[cells.length - 1].setText(wsSubTotF);
						}
					}
				}
				debugger;
				if ((seletedLine.SubTotal) && (seletedLine.SubTotal !== "") &&
					(seletedLine.SubTotal !== "0")) {
					var currentSubTot = oFloatFormat.parse(seletedLine.SubTotal);
					this.DeductionCash = currentSubTot + this.DeductionCash - oldSubTot;
					this.DeductionGold = this.DeductionGold - oldSubTotG;
					this.DeductionSilver = this.DeductionSilver - oldSubTotS;
				} else {
					this.DeductionCash = this.DeductionCash - oldSubTot;

					if ((seletedLine.SubTotalG) && (seletedLine.SubTotalG !== "")) {
						var currentSubTotG = oFloatFormat.parse(seletedLine.SubTotalG);
						this.DeductionGold = currentSubTotG + this.DeductionGold - oldSubTotG;
					}

					if ((seletedLine.SubTotalS) && (seletedLine.SubTotalS !== "")) {
						var currentSubTotS = oFloatFormat.parse(seletedLine.SubTotalS);
						this.DeductionSilver = currentSubTotS + this.DeductionSilver - oldSubTotS;
					}
				}
				var deduction = this.DeductionCash;
				deduction = parseFloat(deduction).toFixed(0);
				var deductionF = this.getIndianCurr(deduction);
				this.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionCash', deductionF);

				var deductionG = this.DeductionGold;
				deductionG = parseFloat(deductionG).toFixed(3);
				var deductionGF = this.getIndianCurr(deductionG);
				this.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionGold', deductionGF);

				var deductionS = this.DeductionSilver;
				deductionS = parseFloat(deductionS).toFixed(2);
				var deductionSF = this.getIndianCurr(deductionS);
				this.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionSilver', deductionSF);
			},
			ValueChangeMaterial: function(oEvent) {
				debugger;
				var that = this;
				var id = oEvent.getSource().getId().split('---')[1];
				if(id !== undefined){
					if (id.split('--')[0] === 'idsalesws') {
						this.byId("WSHeaderFragment--idSaveIcon").setColor('red');
					}
				}
				var fragIndicator =	sap.ui.core.Fragment.byId("fr2", "idSaveIndicator");
				if(fragIndicator){
						fragIndicator.setColor("red");
				}
				var oModel= oEvent.getSource().getParent().getBindingContext("orderItems");
				var oHeader = this.getView().getModel('local').getProperty('/WSOrderHeader');
				var orderId = null;
				if(!oModel){
					debugger;
					oModel = oEvent.getSource().getParent().getBindingContext("materialPopupOrderItems");
					orderId = oHeader.id;
					var orderNoPath = oEvent.getSource().mBindingInfos.value.binding.oContext.sPath;
					if(!orderId){
						var oFilter = new sap.ui.model.Filter("OrderNo","EQ", oHeader.OrderNo);
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
										"/WSOrderHeaders",
										"GET", {filters: [oFilter]}, {}, that)
										.then(function(oData) {
												debugger;
												orderId =  oData.results[oData.results.length - 1].id;
												orderNoPath = orderNoPath + "/OrderNo";
												that.getView().getModel("materialPopupOrderItems").setProperty(orderNoPath, orderId);
										})
						}
					else{
						orderNoPath = orderNoPath + "/OrderNo";
						that.getView().getModel("materialPopupOrderItems").setProperty(orderNoPath, orderId);
					}
				}
				var oModelForRow= oModel.getModel('local');
				var sBinding = oEvent.getSource().getParent().getBindingContext("orderItems");
				if(!sBinding){
					 sBinding = oEvent.getSource().getParent().getBindingContext("materialPopupOrderItems");
				}
				var sRowPath =  sBinding.getPath();
				var selData =  oModelForRow.getProperty(sRowPath + "/MaterialCode");
			  var oFilter = new sap.ui.model.Filter("ProductCode","EQ", selData.toUpperCase());
				var currentBoxId = oEvent.getSource().getId();
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				"/Products", "GET", {filters: [oFilter]}, {}, this)
				 .then(function(oData) {
					 console.log(oData.results[0]);
					 if(oData.results[0]){
						 debugger;
						 	if(currentBoxId.includes("fr2")){
								 that.focusAndSelectNextInput(currentBoxId, "input[id*='fr2--id']");
						 }
						 else{
							 that.focusAndSelectNextInput(currentBoxId, "input[id*='idsalesws--WSItemFragment']");
						 }
					 }

					 var selectedMatData = oData.results[0];
					 oModelForRow.setProperty(sRowPath + "/Material", selectedMatData.id);
					 if(selectedMatData.HindiName){
	 					oModelForRow.setProperty(sRowPath + "/Description", selectedMatData.HindiName);
	 				}
	 				else{
	 						oModelForRow.setProperty(sRowPath + "/Description", selectedMatData.ProductName);
	 				}
					 oModelForRow.setProperty(sRowPath + "/MaterialCode", selectedMatData.ProductCode);
					 //Making
					 if (selectedMatData.Making) {
						 oModelForRow.setProperty(sRowPath + "/Making", selectedMatData.Making);
					 } else {
						 oModelForRow.setProperty(sRowPath + "/Making", 0);
					 }

					if (selectedMatData.PricePerUnit) {
	 					oModelForRow.setProperty(sRowPath + "/MakingD", selectedMatData.PricePerUnit);
	 				} else {
	 					oModelForRow.setProperty(sRowPath + "/MakingD", 0);
	 				}

	 				oModelForRow.setProperty(sRowPath + "/Category", selectedMatData.Category);
	 				oModelForRow.setProperty(sRowPath + "/Type", selectedMatData.Type);
	 				oModelForRow.setProperty(sRowPath + "/Karat", selectedMatData.Karat);

					if(id !== undefined){
						if (id.split('--')[0] === 'idsalesws') {
						var Customer = that.getView().getModel('local').getProperty('/WSOrderHeader').Customer;
						var oFilter1 = new sap.ui.model.Filter('Customer', sap.ui.model.FilterOperator.EQ, "'" + Customer + "'");
						var oFilter2 = new sap.ui.model.Filter('Product', sap.ui.model.FilterOperator.EQ, "'" + selectedMatData.id + "'");
						var oFilter = new sap.ui.model.Filter({
							filters: [oFilter1, oFilter2],
							and: true
						})
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
								// "/WSTunchs('" + '5d4b195896718d126c49f7f1' + "')" , "GET",
								"/WSTunchs", "GET", {
									filters: [oFilter1, oFilter2]
								}, null, that)
							.then(function(oData) {
								debugger;
								if (oData.results.length > 0) {
									selectedMatData.Making = oData.results[0].Making;
									selectedMatData.Tunch = oData.results[0].Tunch;
								}

								if (selectedMatData.Tunch) {
									oModelForRow.setProperty(sRowPath + "/Tunch", selectedMatData.Tunch);
								}
								if (selectedMatData.Making) {
									oModelForRow.setProperty(sRowPath + "/Making", selectedMatData.Making);
								}
							})
							.catch(function(oError) {
								debugger;
								if (selectedMatData.Tunch) {
									oModelForRow.setProperty(sRowPath + "/Tunch", selectedMatData.Tunch);
								} else {
									oModelForRow.setProperty(sRowPath + "/Tunch", 0);
								}
							});

						}
					}
				 }).catch(function(oError) {
						 // MessageToast.show("cannot fetch the data");
				 });

			},
			onDialogClose: function(oEvent){
				this.wsMaterialPopup.close();
			 },

			 onDialogSave: function(oEvent){
						debugger;
						var that = this;
						var oTableDetails = sap.ui.core.Fragment.byId("fr2", "materialPopupTable");
						var oBinding = oTableDetails.getBinding("rows");
						var arr = [];
						var allItems = that.getView().getModel("materialPopupOrderItems").getProperty("/popupItemsData");

						var flag =  false;
						var fragIndicator =	sap.ui.core.Fragment.byId("fr2", "idSaveIndicator");

						for (let i = 0; i < oBinding.getLength(); i++) {
						 var that = this;
						 var data = oBinding.oList[i];
						 if (data.id === "") {
								if (data.MaterialCode !== "") {
									if(fragIndicator){
											fragIndicator.setColor("red");
									}
									if(data.Qty > 0){

									}
									else{
										flag = true;
										break;
									}
								}
							}
						}

						if(flag === true){
							sap.m.MessageBox.error("Can't Save! Quantity should be greater than 0");
							oEvent.getSource().setEnabled(false);
						}
						else{
							for (let i = 0; i < oBinding.getLength(); i++) {
							 var that = this;
							 var data = oBinding.oList[i];
									if (data.id === "") {
										if (data.MaterialCode !== "") {
												if(data.Qty > 0){
													var payload = {...data};
													payload.Qty =  Math.abs(payload.Qty) * -1;
													this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/StockItems",
																										"POST", {}, payload, this)
													.then(function(oData) {
														that.getView().setBusy(false);
														debugger;
														allItems[i].id = oData.id;
														sap.m.MessageToast.show("Data Saved Successfully");
														if(fragIndicator){
																fragIndicator.setColor("green");
														}
														that.getView().getModel("materialPopupOrderItems").setProperty("/popupItemsData", allItems);
													}).catch(function(oError) {
														that.getView().setBusy(false);
														var oPopover = that.getErrorMessage(oError);
													});
												}
										}
									}
								}
						}
				},

			wsMaterialPopup :  null,
			onFindMaterial: function(){
				debugger;
				var that = this;
				var oHeader = this.getView().getModel('local').getProperty('/WSOrderHeader');
				if(oHeader.OrderNo !== 0 &&
					 oHeader.OrderNo !== ""){
							if(!this.wsMaterialPopup){
								this.wsMaterialPopup=new sap.ui.xmlfragment("fr2", "victoria.fragments.tableSelectDialog",this);
								this.getView().addDependent(this.wsMaterialPopup);
							}
							that.clearPopupScreen();
							var orderId = oHeader.id;;
							var oFilter =  null;
							if(!orderId){
								var oFilter = new sap.ui.model.Filter("OrderNo","EQ", oHeader.OrderNo);
								that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
												"/WSOrderHeaders",
												"GET", {filters: [oFilter]}, {}, that)
												.then(function(oData) {
														debugger;
														orderId =  oData.results[oData.results.length - 1].id;
														orderId = "'" + orderId + "'";
														oFilter = new sap.ui.model.Filter("OrderNo","EQ", orderId);
										});
							}
							else{
								orderId = "'" + orderId + "'";
								oFilter = new sap.ui.model.Filter("OrderNo","EQ", orderId);
							}
							setTimeout(
								function(){
									that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
											"/StockItems",
											"GET", {filters: [oFilter]}, {}, that)
							.then(function(oData) {
									debugger;
									if (oData.results.length > 0) {
											var allItems = that.getView().getModel("materialPopupOrderItems").getProperty("/popupItemsData");
											for (var i = 0; i < oData.results.length; i++) {
												var MaterialData = that.allMasterData.materials[oData.results[i].Material];
												allItems[i].MaterialCode = MaterialData.ProductCode;
												allItems[i].Qty = Math.abs(oData.results[i].Qty);
												allItems[i].id = oData.results[i].id;
												allItems[i].Description = MaterialData.HindiName || MaterialData.ProductName;
												allItems[i].OrderNo = oData.results[i].OrderNo;
											}
											that.getView().getModel("materialPopupOrderItems").setProperty("/popupItemsData", allItems);
									}

									var fragIndicator =	sap.ui.core.Fragment.byId("fr2", "idSaveIndicator");
									if(fragIndicator){
											fragIndicator.setColor("green");
									}
							})
						}, 1000)
							this.wsMaterialPopup.open();
							setTimeout(function(){
								$("input[type='Number']").focus(function () {
									$(this).select();
								});}, 300);
						}
						else{
							var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("orderValidation");
							MessageBox.show(
								oBundle, {
									icon: MessageBox.Icon.ERROR,
									title: "Error",
									actions: [MessageBox.Action.OK],
									onClose: function(oAction) { }
								}
							);
						}
				},

			onMaterialSelect: function(oEvent) {
				debugger;
				var that = this;
				var id = oEvent.getSource().getId().split('---')[1];
				if(id !== undefined){
					if (id.split('--')[0] === 'idsales') {
						this.byId("Sales--idSaveIcon").setColor('red');
					}
				}

				var fragIndicator =	sap.ui.core.Fragment.byId("fr2", "idSaveIndicator");
				if(fragIndicator){
						fragIndicator.setColor("red");
				}
				var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
				// var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
				var oModel = oEvent.getSource().getParent().getBindingContext("orderItems");

				var orderId = null;
				var oHeader = this.getView().getModel('local').getProperty('/WSOrderHeader');
				if(!oModel){
					debugger;
					oModel = oEvent.getSource().getParent().getBindingContext("materialPopupOrderItems");
					orderId = oHeader.id;
					var orderNoPath = oEvent.getSource().mBindingInfos.value.binding.oContext.sPath;
					if(!orderId){
						var oFilter = new sap.ui.model.Filter("OrderNo","EQ", oHeader.OrderNo);
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
										"/WSOrderHeaders",
										"GET", {filters: [oFilter]}, {}, that)
										.then(function(oData) {
												debugger;
												orderId =  oData.results[oData.results.length - 1].id;
												orderNoPath = orderNoPath + "/OrderNo";
												that.getView().getModel("materialPopupOrderItems").setProperty(orderNoPath, orderId);
										})
						}
					else{
						orderNoPath = orderNoPath + "/OrderNo";
						that.getView().getModel("materialPopupOrderItems").setProperty(orderNoPath, orderId);
					}
				}
				var oModelForRow = oModel.getModel();
				var sBinding = oEvent.getSource().getParent().getBindingContext("orderItems");
				if(!sBinding){
				 sBinding = oEvent.getSource().getParent().getBindingContext("materialPopupOrderItems");
				}

				var sRowPath = sBinding.getPath();

				oModelForRow.setProperty(sRowPath + "/Material", selectedMatData.id);
				if(selectedMatData.HindiName){
					oModelForRow.setProperty(sRowPath + "/Description", selectedMatData.HindiName);
				}
				else{
						oModelForRow.setProperty(sRowPath + "/Description", selectedMatData.ProductName);
				}
				//Making
				if (selectedMatData.Making) {
					oModelForRow.setProperty(sRowPath + "/Making", selectedMatData.Making);
				} else {
					oModelForRow.setProperty(sRowPath + "/Making", 0);
				}
				//Makind D field
				if (selectedMatData.PricePerUnit) {
					oModelForRow.setProperty(sRowPath + "/MakingD", selectedMatData.PricePerUnit);
				} else {
					oModelForRow.setProperty(sRowPath + "/MakingD", 0);
				}

				oModelForRow.setProperty(sRowPath + "/Category", selectedMatData.Category);
				oModelForRow.setProperty(sRowPath + "/Type", selectedMatData.Type);
				oModelForRow.setProperty(sRowPath + "/Karat", selectedMatData.Karat);
				debugger;
				if(id !== undefined){
					if (id.split('--')[0] === 'idsalesws') {
					var Customer = this.getView().getModel('local').getProperty('/WSOrderHeader').Customer;
					var oFilter1 = new sap.ui.model.Filter('Customer', sap.ui.model.FilterOperator.EQ, "'" + Customer + "'");
					var oFilter2 = new sap.ui.model.Filter('Product', sap.ui.model.FilterOperator.EQ, "'" + selectedMatData.id + "'");
					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1, oFilter2],
						and: true
					})
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							// "/WSTunchs('" + '5d4b195896718d126c49f7f1' + "')" , "GET",
							"/WSTunchs", "GET", {
								filters: [oFilter1, oFilter2]
							}, null, this)
						.then(function(oData) {
							debugger;
							if (oData.results.length > 0) {
								selectedMatData.Making = oData.results[0].Making;
								selectedMatData.Tunch = oData.results[0].Tunch;
							}

							if (selectedMatData.Tunch) {
								oModelForRow.setProperty(sRowPath + "/Tunch", selectedMatData.Tunch);
							}
							if (selectedMatData.Making) {
								oModelForRow.setProperty(sRowPath + "/Making", selectedMatData.Making);
							}
						})
						.catch(function(oError) {
							debugger;
							if (selectedMatData.Tunch) {
								oModelForRow.setProperty(sRowPath + "/Tunch", selectedMatData.Tunch);
							} else {
								oModelForRow.setProperty(sRowPath + "/Tunch", 0);
							}
						});

				}
			  }

				// if (selectedMatData.Tunch) {
				// 	oModelForRow.setProperty(sRowPath + "/Tunch", selectedMatData.Tunch);
				// } else {
				// 	oModelForRow.setProperty(sRowPath + "/Tunch", 0);
				// }

				if(id !== undefined){
					if (id.split('--')[0] === 'idsalesws') {
						this.byId("WSHeaderFragment--idSaveIcon").setColor('red');
					}
				}

				var currentBoxId = oEvent.getSource().getId();
				if(currentBoxId.includes("fr2")){
						that.focusAndSelectNextInput(currentBoxId, "input[id*='fr2--id']");
				}
				else{
						that.focusAndSelectNextInput(currentBoxId, "input[id*='idsalesws--WSItemFragment']");
				}
			},
			previousOrder: function(oEvent) {
				debugger;
				var that = this;
				var myData = this.getView().getModel("local").getProperty("/WSOrderHeader");
				$.post("/previousWSOrder", {
						OrderDetails: myData
					})
					.then(function(result) {
						// that.byId("idRetailTransfer").setEnabled(true);
						console.log(result);
						if (result) {
							debugger;
							delete that.TotalOrderValueCash;
							delete that.TotalOrderValueGold;
							delete that.TotalOrderValueSilver;
							delete that.DeductionCash;
							delete that.DeductionGold;
							delete that.DeductionSilver;
							delete that.FinalBalanceCash;
							delete that.FinalBalanceGold;
							delete that.FinalBalanceSilver;

							var oHeaderT = that.getView().getModel('local').getProperty('/orderHeaderTemp');
							oHeaderT.TotalOrderValueCash = "0";
							oHeaderT.TotalOrderValueGold = "0";
							oHeaderT.TotalOrderValueSilver = "0";
							oHeaderT.DeductionCash = "0";
							oHeaderT.DeductionGold = "0";
							oHeaderT.DeductionSilver = "0";
							oHeaderT.FinalBalanceCash = "0";
							oHeaderT.FinalBalanceGold = "0";
							oHeaderT.FinalBalanceSilver = "0";
							oHeaderT.CombinedBalance = "";
							oHeaderT.BalanceSuffix = "";
							that.getView().getModel('local').setProperty('/orderHeaderTemp', oHeaderT);
							var orderId = result.id;
							// that.byId("Sales--idSaveIcon").setColor('green');
							if (result.Customer) {
								var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, result.Customer);
							} else {
								var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, "");
							}
							var id = 'WSsales';
							//Clear Item table
							that.orderItem(oEvent, id);
							//return table
							that.orderReturn(oEvent, id);
							oEvent.sId = "orderReload";
							that.getOrderDetails(oEvent, orderId, oFilter);
						}
					});
			},
			nextOrder: function(oEvent) {
				var selectedDate = this.getView().byId("__component0---idsalesws--WSHeaderFragment--DateId").getDateValue();
				debugger;
				var dateFrom = new Date(selectedDate);
				dateFrom.setDate(selectedDate.getDate() - 1);
				dateFrom.setHours(0, 0, 0, 1)
				var dateTo = new Date(selectedDate);
				dateTo.setDate(selectedDate.getDate() - 1);
				dateTo.setHours(23, 59, 59, 59)
				var oFilter1 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, dateFrom);
				var oFilter2 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, dateTo);
				var orFilter = new sap.ui.model.Filter({
					filters: [oFilter1, oFilter2],
					and: true
				});
				var that = this;
				var myData = this.getView().getModel("local").getProperty("/WSOrderHeader");
				var oFilter = new sap.ui.model.Filter("OrderNo","EQ", "251");
			  if(!myData.OrderNo&&false){
			    that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                    "/WSOrderHeaders",
                    "GET", {filters: [oFilter]}, {}, that)
                    .then(function(oData) {
                      debugger;
                      var n = oData.results.length;
                      var lastRecord = oData.results[n-1];
                      var lastRecordDate = lastRecord.Date;
                      var formattedLastRecordDate = lastRecordDate.getDate() + '-' + lastRecordDate.getMonth() + 1 + '-' + lastRecordDate.getFullYear();
                      var currentDate = new Date();
                      var formattedDate = currentDate.getDate() - 1 + '-' + currentDate.getMonth() + 1 + '-' + currentDate.getFullYear();
                      var orderId = lastRecord.id;
                      that.getView().getModel('local').setProperty('/orderHeaderTemp/OrderId', orderId);
                      oEvent.sId = "orderReload";
                      if(formattedDate === formattedLastRecordDate){
                        that.getOrderDetails(oEvent,orderId,oFilter);
                      }
                      else{
                        sap.m.MessageToast.show("No orders generated for today yet");
                      }
              })
			  }
			  else{
					this.getView().setBusy(true);
				$.post("/nextWSOrder", {
						OrderDetails: myData
					})
					.then(function(result) {
						console.log(result);
						that.getView().setBusy(false);
						// that.byId("idRetailTransfer").setEnabled(true);
						debugger;
						if (result) {
							var id = 'WSsales';

							delete that.TotalOrderValueCash;
							delete that.TotalOrderValueGold;
							delete that.TotalOrderValueSilver;
							delete that.DeductionCash;
							delete that.DeductionGold;
							delete that.DeductionSilver;
							delete that.FinalBalanceCash;
							delete that.FinalBalanceGold;
							delete that.FinalBalanceSilver;

							var oHeaderT = that.getView().getModel('local').getProperty('/orderHeaderTemp');
							oHeaderT.TotalOrderValueCash = "0";
							oHeaderT.TotalOrderValueGold = "0";
							oHeaderT.TotalOrderValueSilver = "0";
							oHeaderT.DeductionCash = "0";
							oHeaderT.DeductionGold = "0";
							oHeaderT.DeductionSilver = "0";
							oHeaderT.FinalBalanceCash = "0";
							oHeaderT.FinalBalanceGold = "0";
							oHeaderT.FinalBalanceSilver = "0";
							oHeaderT.CombinedBalance = "";
							oHeaderT.BalanceSuffix = "";
							that.getView().getModel('local').setProperty('/orderHeaderTemp', oHeaderT);
							//Clear Item table
							that.orderItem(oEvent, id);
							//return table
							that.orderReturn(oEvent, id);
							var orderId = result.id;
							// that.byId("Sales--idSaveIcon").setColor('green');
							if (result.Customer) {
								var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, result.Customer);
							} else {
								var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, "");
							}
							oEvent.sId = "orderReload";
							that.getOrderDetails(oEvent, orderId, oFilter);
						}
						if(!myData.OrderNo){
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
						}
					}).catch(function(){
						that.getView().setBusy(false);
					});
				}
			},
			onRadioButtonSelect: function() {
				var that = this;
				debugger;
				var oLocale = new sap.ui.core.Locale("en-US");
				var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
				var WSHeader = this.getView().getModel('local').getProperty('/WSOrderHeader');
				if (this.getView().byId("WSHeaderFragment--RB-1").getSelected()) { //Cash RadioButton

					//Conversion to required mode (Cash/Gold/Silver)
					var TotalOrderValueSilver = that.TotalOrderValueSilver * WSHeader.SilverBhav / 1000;
					var TotalOrderValueGold = that.TotalOrderValueGold * WSHeader.Goldbhav / 10;
					var DeductionGold = that.DeductionGold * WSHeader.Goldbhav / 10;
					var DeductionSilver = that.DeductionSilver * WSHeader.SilverBhav / 1000;
					var FinalBalanceGold = that.FinalBalanceGold * WSHeader.Goldbhav / 10;
					var FinalBalanceSilver = that.FinalBalanceSilver * WSHeader.SilverBhav / 1000;;
					var TotalOrderValueCash = that.TotalOrderValueCash;
					var DeductionCash = that.DeductionCash;
					var FinalBalanceCash = that.FinalBalanceCash;

					// Adding all cash together
					TotalOrderValueCash = TotalOrderValueCash + TotalOrderValueSilver + TotalOrderValueGold;
					TotalOrderValueSilver = 0;
					TotalOrderValueGold = 0;

					DeductionCash = DeductionCash + DeductionGold + DeductionSilver;
					DeductionSilver = 0;
					DeductionGold = 0;

					FinalBalanceCash = FinalBalanceGold + FinalBalanceSilver + FinalBalanceCash;
					FinalBalanceSilver = 0;
					FinalBalanceGold = 0;

					var CombinedBalance = FinalBalanceCash;
					var BalanceSuffix = "Rupees of Cash";

					FinalBalanceGold = parseFloat(FinalBalanceGold).toFixed(0);
					FinalBalanceGold = that.getIndianCurr(FinalBalanceGold);
					FinalBalanceSilver = parseFloat(FinalBalanceSilver).toFixed(0);
					FinalBalanceSilver = that.getIndianCurr(FinalBalanceSilver);
					FinalBalanceCash = parseFloat(FinalBalanceCash).toFixed(0);
					FinalBalanceCash = that.getIndianCurr(FinalBalanceCash);
					TotalOrderValueSilver = parseFloat(TotalOrderValueSilver).toFixed(0);
					TotalOrderValueSilver = that.getIndianCurr(TotalOrderValueSilver);
					TotalOrderValueCash = parseFloat(TotalOrderValueCash).toFixed(0);
					TotalOrderValueCash = that.getIndianCurr(TotalOrderValueCash);
					TotalOrderValueGold = parseFloat(TotalOrderValueGold).toFixed(0);
					TotalOrderValueGold = that.getIndianCurr(TotalOrderValueGold);
					DeductionGold = parseFloat(DeductionGold).toFixed(0);
					DeductionGold = that.getIndianCurr(DeductionGold);
					DeductionSilver = parseFloat(DeductionSilver).toFixed(0);
					DeductionSilver = that.getIndianCurr(DeductionSilver);
					DeductionCash = parseFloat(DeductionCash).toFixed(0);
					DeductionCash = that.getIndianCurr(DeductionCash);
					CombinedBalance = parseFloat(CombinedBalance).toFixed(0);
					CombinedBalance = that.getIndianCurr(CombinedBalance);

					that.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionSilver', DeductionSilver);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionGold', DeductionGold);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionCash', DeductionCash);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueSilver', TotalOrderValueSilver);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueGold', TotalOrderValueGold);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueCash', TotalOrderValueCash);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceGold', FinalBalanceGold);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceSilver', FinalBalanceSilver);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceCash', FinalBalanceCash);

				} else if (this.getView().byId("WSHeaderFragment--RB-2").getSelected()) { //Gold RadioButton
					debugger;
					var TotalOrderValueSilver = that.TotalOrderValueSilver * WSHeader.SilverBhav / (100 * WSHeader.Goldbhav);
					var TotalOrderValueGold = that.TotalOrderValueGold;
					var TotalOrderValueCash = that.TotalOrderValueCash * 10 / WSHeader.Goldbhav;
					var DeductionGold = that.DeductionGold;
					var DeductionSilver = that.DeductionSilver * WSHeader.SilverBhav / (100 * WSHeader.Goldbhav);
					var DeductionCash = that.DeductionCash * 10 / WSHeader.Goldbhav;
					var FinalBalanceGold = that.FinalBalanceGold;
					var FinalBalanceSilver = that.FinalBalanceSilver * WSHeader.SilverBhav / (100 * WSHeader.Goldbhav);
					var FinalBalanceCash = that.FinalBalanceCash * 10 / WSHeader.Goldbhav;

					TotalOrderValueGold = TotalOrderValueCash + TotalOrderValueSilver + TotalOrderValueGold;
					TotalOrderValueSilver = 0;
					TotalOrderValueCash = 0;

					DeductionGold = DeductionCash + DeductionGold + DeductionSilver;
					DeductionSilver = 0;
					DeductionCash = 0;

					FinalBalanceGold = FinalBalanceGold + FinalBalanceSilver + FinalBalanceCash;
					FinalBalanceSilver = 0;
					FinalBalanceCash = 0;

					var CombinedBalance = FinalBalanceGold;
					var BalanceSuffix = "grams of Gold";

					FinalBalanceGold = parseFloat(FinalBalanceGold).toFixed(3);
					FinalBalanceGold = that.getIndianCurr(FinalBalanceGold);
					FinalBalanceSilver = parseFloat(FinalBalanceSilver).toFixed(3);
					FinalBalanceSilver = that.getIndianCurr(FinalBalanceSilver);
					FinalBalanceCash = parseFloat(FinalBalanceCash).toFixed(3);
					FinalBalanceCash = that.getIndianCurr(FinalBalanceCash);
					TotalOrderValueSilver = parseFloat(TotalOrderValueSilver).toFixed(3);
					TotalOrderValueSilver = that.getIndianCurr(TotalOrderValueSilver);
					TotalOrderValueGold = parseFloat(TotalOrderValueGold).toFixed(3);
					TotalOrderValueGold = that.getIndianCurr(TotalOrderValueGold);
					TotalOrderValueCash = parseFloat(TotalOrderValueCash).toFixed(3);
					TotalOrderValueCash = that.getIndianCurr(TotalOrderValueCash);
					DeductionGold = parseFloat(DeductionGold).toFixed(3);
					DeductionGold = that.getIndianCurr(DeductionGold);
					DeductionSilver = parseFloat(DeductionSilver).toFixed(3);
					DeductionSilver = that.getIndianCurr(DeductionSilver);
					DeductionCash = parseFloat(DeductionCash).toFixed(3);
					DeductionCash = that.getIndianCurr(DeductionCash);
					CombinedBalance = parseFloat(CombinedBalance).toFixed(3);
					CombinedBalance = that.getIndianCurr(CombinedBalance);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionSilver', DeductionSilver);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionGold', DeductionGold);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionCash', DeductionCash);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueSilver', TotalOrderValueSilver);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueGold', TotalOrderValueGold);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueCash', TotalOrderValueCash);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceGold', FinalBalanceGold);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceSilver', FinalBalanceSilver);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceCash', FinalBalanceCash);

				} else if (this.getView().byId("WSHeaderFragment--RB-3").getSelected()) { //Silver RadioButton
					debugger;
					var TotalOrderValueSilver = that.TotalOrderValueSilver;
					var TotalOrderValueGold = that.TotalOrderValueGold * 100 * WSHeader.Goldbhav / (WSHeader.SilverBhav);
					var TotalOrderValueCash = 100 * that.TotalOrderValueCash / WSHeader.SilverBhav;
					var DeductionGold = that.DeductionGold * 100 * WSHeader.Goldbhav / (WSHeader.SilverBhav);
					var DeductionSilver = that.DeductionSilver;
					var DeductionCash = 100 * that.DeductionCash / WSHeader.SilverBhav;
					var FinalBalanceGold = that.FinalBalanceGold * 100 * WSHeader.Goldbhav / (WSHeader.SilverBhav);
					var FinalBalanceSilver = that.FinalBalanceSilver;
					var FinalBalanceCash = 100 * that.FinalBalanceCash / WSHeader.SilverBhav;
					var CombinedBalance = FinalBalanceGold + FinalBalanceSilver + FinalBalanceCash;
					var BalanceSuffix = "grams of Silver";


					TotalOrderValueSilver = TotalOrderValueCash + TotalOrderValueSilver + TotalOrderValueGold;
					TotalOrderValueGold = 0;
					TotalOrderValueCash = 0;

					DeductionSilver = DeductionCash + DeductionGold + DeductionSilver;
					DeductionGold = 0;
					DeductionCash = 0;

					FinalBalanceSilver = FinalBalanceGold + FinalBalanceSilver + FinalBalanceCash;
					FinalBalanceGold = 0;
					FinalBalanceCash = 0;

					FinalBalanceGold = parseFloat(FinalBalanceGold).toFixed(2);
					FinalBalanceGold = that.getIndianCurr(FinalBalanceGold);
					FinalBalanceSilver = parseFloat(FinalBalanceSilver).toFixed(2);
					FinalBalanceSilver = that.getIndianCurr(FinalBalanceSilver);
					FinalBalanceCash = parseFloat(FinalBalanceCash).toFixed(2);
					FinalBalanceCash = that.getIndianCurr(FinalBalanceCash);
					TotalOrderValueSilver = parseFloat(TotalOrderValueSilver).toFixed(2);
					TotalOrderValueSilver = that.getIndianCurr(TotalOrderValueSilver);
					TotalOrderValueGold = parseFloat(TotalOrderValueGold).toFixed(2);
					TotalOrderValueGold = that.getIndianCurr(TotalOrderValueGold);
					TotalOrderValueCash = parseFloat(TotalOrderValueCash).toFixed(2);
					TotalOrderValueCash = that.getIndianCurr(TotalOrderValueCash);
					DeductionGold = parseFloat(DeductionGold).toFixed(2);
					DeductionGold = that.getIndianCurr(DeductionGold);
					DeductionSilver = parseFloat(DeductionSilver).toFixed(2);
					DeductionSilver = that.getIndianCurr(DeductionSilver);
					DeductionCash = parseFloat(DeductionCash).toFixed(2);
					DeductionCash = that.getIndianCurr(DeductionCash);
					CombinedBalance = parseFloat(CombinedBalance).toFixed(2);
					CombinedBalance = that.getIndianCurr(CombinedBalance);

					that.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionSilver', DeductionSilver);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionGold', DeductionGold);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionCash', DeductionCash);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueSilver', TotalOrderValueSilver);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueGold', TotalOrderValueGold);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueCash', TotalOrderValueCash);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceGold', FinalBalanceGold);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceSilver', FinalBalanceSilver);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceCash', FinalBalanceCash);

				} else if (this.getView().byId("WSHeaderFragment--RB-4").getSelected()) {
					debugger;
					var TotalOrderValueSilver = that.TotalOrderValueSilver;
					var TotalOrderValueGold = that.TotalOrderValueGold;
					var TotalOrderValueCash = that.TotalOrderValueCash;
					var DeductionGold = that.DeductionGold;
					var DeductionSilver = that.DeductionSilver;
					var DeductionCash = that.DeductionCash;
					var FinalBalanceGold = that.FinalBalanceGold;
					var FinalBalanceSilver = that.FinalBalanceSilver;
					var FinalBalanceCash = that.FinalBalanceCash;
					var CombinedBalance = "*Click on Gold, Silver or Cash";
					var BalanceSuffix = "buttons for Combined Balance";
					FinalBalanceGold = parseFloat(FinalBalanceGold).toFixed(3);
					FinalBalanceGold = that.getIndianCurr(FinalBalanceGold);
					FinalBalanceSilver = parseFloat(FinalBalanceSilver).toFixed(2);
					FinalBalanceSilver = that.getIndianCurr(FinalBalanceSilver);
					FinalBalanceCash = parseFloat(FinalBalanceCash).toFixed(0);
					FinalBalanceCash = that.getIndianCurr(FinalBalanceCash);
					TotalOrderValueSilver = parseFloat(TotalOrderValueSilver).toFixed(2);
					TotalOrderValueSilver = that.getIndianCurr(TotalOrderValueSilver);
					TotalOrderValueGold = parseFloat(TotalOrderValueGold).toFixed(3);
					TotalOrderValueGold = that.getIndianCurr(TotalOrderValueGold);
					TotalOrderValueCash = parseFloat(TotalOrderValueCash).toFixed(0);
					TotalOrderValueCash = that.getIndianCurr(TotalOrderValueCash);
					DeductionGold = parseFloat(DeductionGold).toFixed(3);
					DeductionGold = that.getIndianCurr(DeductionGold);
					DeductionSilver = parseFloat(DeductionSilver).toFixed(2);
					DeductionSilver = that.getIndianCurr(DeductionSilver);
					DeductionCash = parseFloat(DeductionCash).toFixed(0);
					DeductionCash = that.getIndianCurr(DeductionCash);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionSilver', DeductionSilver);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionGold', DeductionGold);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/DeductionCash', DeductionCash);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueSilver', TotalOrderValueSilver);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueGold', TotalOrderValueGold);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/TotalOrderValueCash', TotalOrderValueCash);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceGold', FinalBalanceGold);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceSilver', FinalBalanceSilver);
					that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceCash', FinalBalanceCash);
				}
				that.getView().getModel('local').setProperty('/orderHeaderTemp/CombinedBalance', CombinedBalance);
				that.getView().getModel('local').setProperty('/orderHeaderTemp/BalanceSuffix', BalanceSuffix);

			},
			onExit: function() {

				if (this.searchPopup) {
					this.searchPopup.destroy();
				}
			},
			onTransfer: function(oEvent) {
				debugger;
				var that = this;
				var oLocale = new sap.ui.core.Locale("en-US");
				var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
				var orderDetail = this.getView().getModel('local').getProperty('/WSOrderHeader');
				var orderHeaderT = this.getView().getModel('local').getProperty('/orderHeaderTemp');
				var finalAmount = oFloatFormat.parse(orderHeaderT.CombinedBalance);
				var finalCash = oFloatFormat.parse(orderHeaderT.FinalBalanceCash);
				var finalGold = oFloatFormat.parse(orderHeaderT.FinalBalanceGold);
				var finalSilver = oFloatFormat.parse(orderHeaderT.FinalBalanceSilver);
				var date = new Date(orderDetail.Date);
				var postedEntryData = that.getView().getModel('local').getProperty('/EntryData');


				// if ((that.getStatus() === 'green') &&
				// 	(finalAmount) && (finalAmount !== "" || finalAmount !== 0)) {
				// 	that.getView().setBusy(true);
				// 	var entryData = this.getView().getModel("local").getProperty("/EntryData");
				// 	entryData.Date = orderDetail.Date;
				// 	entryData.OrderNo = orderDetail.OrderNo;
				// 	entryData.OrderType = 'W';
				// 	var date = this.getView().byId("WSHeaderFragment--DateId").getDateValue();
				// 	entryData.Remarks = "[Auto-Entry] Wholesale Transfer for Order" + " " +
				// 		orderDetail.OrderNo + " " + date;
				// 	if (that.getView().byId("WSHeaderFragment--RB-1").getSelected()) {
				// 		entryData.Cash = 0 - finalAmount;
				// 	} else if (that.getView().byId("WSHeaderFragment--RB-2").getSelected()) {
				// 		entryData.Gold = 0 - finalAmount;
				// 	} else if (that.getView().byId("WSHeaderFragment--RB-3").getSelected()) {
				// 		entryData.Silver = 0 - finalAmount;
				// 	} else if (that.getView().byId("WSHeaderFragment--RB-4").getSelected()) {
				// 		entryData.Cash = 0 - finalAmount;
				// 		entryData.Gold = 0 - finalAmount;
				// 		entryData.Silver = 0 - finalAmount;
				//
				// 	}
				// 	entryData.Customer = orderDetail.Customer;
				// 	this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Entrys",
				// 			"POST", {}, entryData, this)
				// 		.then(function(oData) {
				// 			that.getView().setBusy(false);
				// 			sap.m.MessageToast.show("Data Transferred Successfully");
				// 		}).catch(function(oError) {
				// 			that.getView().setBusy(false);
				// 			var oPopover = that.getErrorMessage(oError);
				// 		});
				//
				// } else if ((!finalAmount) && (finalAmount === "" || finalAmount === 0)) {
				// 	var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("noAmountToTransfer");
				// 	MessageBox.show(
				// 		oBundle, {
				// 			icon: MessageBox.Icon.ERROR,
				// 			title: "Error",
				// 			actions: [MessageBox.Action.OK],
				// 			onClose: function(oAction) {}
				// 		}
				// 	);
				// } else {
				// 	var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("saveBeforeTransfer");
				// 	MessageBox.show(
				// 		oBundle, {
				// 			icon: MessageBox.Icon.ERROR,
				// 			title: "Error",
				// 			actions: [MessageBox.Action.OK],
				// 			onClose: function(oAction) {}
				// 		}
				// 	);
				//
				// }


				if (postedEntryData.Cash === finalAmount) {
				  var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("noAmountToTransfer");
				      MessageBox.show(
				      oBundle, {
				      icon: MessageBox.Icon.ERROR,
				      title: "Error",
				      actions: [MessageBox.Action.OK],
				      onClose: function(oAction) { }
				          }
				      );
				}else if (((postedEntryData.Cash !== "")&&
				          (postedEntryData.Cash !== "0")&&
				          (postedEntryData.Cash !== 0))&&
				          (finalAmount) &&
				          (finalAmount !== "" || finalAmount !== 0)&&
				          (that.getStatus() === 'green') &&
				          (postedEntryData.Cash !== finalAmount))
				{
				debugger;
				var entryData = this.getView().getModel("local").getProperty("/EntryData");
				entryData.Date = new Date(orderDetail.Date);
				entryData.OrderNo = orderHeaderT.OrderId;
				entryData.OrderType = 'W';
				var date = this.getView().byId("WSHeaderFragment--DateId").getDateValue();
				entryData.Remarks = "[Auto-Entry] Wholesale Transfer for Order"  + "" +
				                  orderDetail.OrderNo+ " " + date;
				var id = postedEntryData.id;
					if (that.getView().byId("WSHeaderFragment--RB-1").getSelected()) {
						entryData.Cash = 0 - finalAmount;
					} else if (that.getView().byId("WSHeaderFragment--RB-2").getSelected()) {
						entryData.Gold = 0 - finalGold;
					} else if (that.getView().byId("WSHeaderFragment--RB-3").getSelected()) {
						entryData.Silver = 0 - finalSilver;
					} else if (that.getView().byId("WSHeaderFragment--RB-4").getSelected()) {
						entryData.Cash = 0 - finalAmount;
						entryData.Gold = 0 - finalGold;
						entryData.Silver = 0 - finalSilver;
					}
				entryData.Customer = orderDetail.Customer;
				entryData.ChangedBy = "";
				entryData.ChangedOn = "";
				entryData.CreatedBy = "";
				entryData.CreatedOn = "";
				//change in final amount
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				                          "/Entrys('"+ id + "')",
				                          "PUT", {}, entryData, this)
				.then(function(oData) {
				var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("TransferAmountUpdated");
				 MessageToast.show(oBundle);
				})
				}else
				  if ((postedEntryData.Cash === "" ||
				       postedEntryData.Cash === "0" ||
				       postedEntryData.Cash === 0)&&
				      (that.getStatus() === 'green') &&
				      (finalAmount) && (finalAmount !== "" || finalAmount !== 0))
				  {
				  that.getView().setBusy(true);
				  var entryData = this.getView().getModel("local").getProperty("/EntryData");
				  entryData.Date = orderDetail.Date;
				  // entryData.OrderNo = orderDetail.OrderNo;
				  entryData.OrderNo = orderHeaderT.OrderId;
				  entryData.OrderType = 'W';
				  var date = this.getView().byId("WSHeaderFragment--DateId").getDateValue();
				  entryData.Remarks = "[Auto-Entry] Wholesale Transfer for Order" + "" +
				                      orderDetail.OrderNo+ " " + date;
				  //orderDetail.Date;
					if (that.getView().byId("WSHeaderFragment--RB-1").getSelected()) {
						entryData.Cash = 0 - finalAmount;
					} else if (that.getView().byId("WSHeaderFragment--RB-2").getSelected()) {
						entryData.Gold = 0 - finalGold;
					} else if (that.getView().byId("WSHeaderFragment--RB-3").getSelected()) {
						entryData.Silver = 0 - finalSilver;
					} else if (that.getView().byId("WSHeaderFragment--RB-4").getSelected()) {
						entryData.Cash = 0 - finalAmount;
						entryData.Gold = 0 - finalGold;
						entryData.Silver = 0 - finalSilver;
					}
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

				  }else if ((!finalAmount) && (finalAmount === "" || finalAmount === 0)) {
				    var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("noAmountToTransfer");
				        MessageBox.show(
				        oBundle, {
				        icon: MessageBox.Icon.ERROR,
				        title: "Error",
				        actions: [MessageBox.Action.OK],
				        onClose: function(oAction) { }
				            }
				        );
				  }else {
				var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("saveBeforeTransfer");
				    MessageBox.show(
				    oBundle, {
				    icon: MessageBox.Icon.ERROR,
				    title: "Error",
				    actions: [MessageBox.Action.OK],
				    onClose: function(oAction) { }
				        }
				    );
				  }
			},
			getEntryData: function(oEvent, custId, orderNo, date, postedEntryData) {
				debugger;
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
						debugger;
						postedEntryData.Customer = result.Customer;
						postedEntryData.Cash = result.Cash;
						postedEntryData.OrderNo = result.OrderNo;
						postedEntryData.id = result.id;
						retVal = true;
					})
				return retVal;
			},
			getPrintCustHeaderData: function() {
				var that = this;
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/prints", "GET", {}, {}, this)
					.then(function(oData) {
						debugger;
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
			onPrintWs: function() {
				debugger;
				var that = this;

				// var allItems = this.getView().getModel("local").getProperty("/printCustomizingData");
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/prints", "GET", {}, {}, this)
					.then(function(oData) {
						debugger;
						that.wholesalePrint(oData);
						// that.getView().getModel("local").setProperty("/printCustomizingData",oData);

					}).catch(function(oError) {});
			},
			wholesalePrint: function(oData) {
				debugger;
				var arrayRemoveFromPrint = [];
				var hideHeaderContents = [];
				var orderHeader = this.getView().getModel("local").getProperty("/orderHeaderTemp"); // Cust Id/Name
				var orderDetails = this.getView().getModel('local').getProperty("/WSOrderHeader"); //order no/date/Gold/Silver Bhav
				var printCustHeadVal = this.getView().getModel("local").getProperty("/printCustomizing"); //print cust view header details
				if (orderDetails.Date) {
					var orderLocDate = orderDetails.Date

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



					// var orderDate = orderLocDate.replace(/\-/g, '.');
					// formatter.getDateDDMMYYYYFormat(orderLocDate);
				}
				if (orderDetails.Customer) {
					var custId = orderDetails.Customer;
					var cusData = this.allMasterData.customers[custId];
				}
				var printDate = formatter.getFormattedDate(0);
				var rCompName, rAddress, rContNumber, rGSTNumber, rEstimate, rWeight, rBhav, rSubtotal, title, rTnC, rMarking;
				for (var i = 0; i < oData.results.length; i++) {
					switch (oData.results[i].Name) {
						case "__component0---idPrint--idWCompName":
							if (oData.results[i].Value === "true") {
								rCompName = printCustHeadVal.CompName;
							} else {
								arrayRemoveFromPrint.push('idWCompName');
							}
							break;
						case "__component0---idPrint--idWAddress":
							if (oData.results[i].Value === "true") {
								rAddress = printCustHeadVal.Address;
							} else {
								arrayRemoveFromPrint.push('idWAddress');
							}
							break;
						case "__component0---idPrint--idContNo":
							if (oData.results[i].Value === "true") {
								rContNumber = printCustHeadVal.ContNumber;
							} else {
								arrayRemoveFromPrint.push('idWPhoneNumber');
							}
							break;
						case "__component0---idPrint--idWGSTN":
							if (oData.results[i].Value === "true") {
								rGSTNumber = printCustHeadVal.GSTNumber;
							} else {
								arrayRemoveFromPrint.push('idWGSTN');
							}
							break;
						case "__component0---idPrint--idWWeight":
							debugger;
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWWeight');
							}
							break;
						case "__component0---idPrint--idWEstimate":
							if (oData.results[i].Value === "true") {
								title = "Estimate";
							} else {
								title = "Invoice";
							}
							break;
						case "__component0---idPrint--idWSubTotal":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWSubTotal');
							}
							break;
						case "__component0---idPrint--idWSubTotalS":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWSubTotalS');
							}
							break;
						case "__component0---idPrint--idWSubTotalG":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWSubTotalG');
							}
							break;
						case "__component0---idPrint--idWBhav":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWBhav');
							}
							break;
						case "__component0---idPrint--idWMakingCharge":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWMakingCharge');
							}
							break;
						case "__component0---idPrint--idWTnC":
							if (oData.results[i].Value === "true") {
								rTnC = printCustHeadVal.TnC;
							} else {
								arrayRemoveFromPrint.push('idWTnC');
							}
							break;
						case "__component0---idPrint--idWMarking":
							if (oData.results[i].Value === "true") {
								rMarking = printCustHeadVal.Marking;
							} else {
								arrayRemoveFromPrint.push('idWMarking');
							}
							break;
						case "__component0---idPrint--idWQuantity":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWQuantity');
							}
							break;
						case "__component0---idPrint--idWReturnWeight":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWReturnWeight');
							}
							break;
						case "__component0---idPrint--idWReturnBhav":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWReturnBhav');
							}
							break;
						case "__component0---idPrint--idWWeightD":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWWeightD');
							}
							break;
						case "__component0---idPrint--idWQuantityD":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWQuantityD');
							}
							break;
						case "__component0---idPrint--idWMakingChargeD":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWMakingChargeD');
							}
							break;
						case "__component0---idPrint--idWRemarks":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWRemarks');
							}
							break;
						case "__component0---idPrint--idWReturnRemarks":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWReturnRemarks');
							}
							break;
						case "__component0---idPrint--idWReturnKattaWeight":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWReturnKattaWeight');
							}
							break;
						case "__component0---idPrint--idWReturnTunch":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWReturnTunch');
							}
							break;
						case "__component0---idPrint--idWReturnSubTotal":
							if (oData.results[i].Value === "false") {
								arrayRemoveFromPrint.push('idWReturnSubTotal');
							}
							default:
					}
				}
				var header = '<h2 style="text-align: center;"><strong>' + title + '</strong></h2><hr />' +
					'<table style="display: inline-block; float: left; width: 450px; height: 100px;">' +
					'<tbody>' +
					'<tr>' +
					'<td class="idWCompName" style="width: 150px; height: 13.5px;"><strong>Company Name</strong></td>' +
					'<td class="idWCompName" style="width: 300px; height: 13.5px;">' + rCompName + '</td>' +
					'</tr>' +
					'<tr>' +
					'<td class="idWAddress" style="width: 150px; height: 13px;"><strong>Address</strong></td>' +
					'<td class="idWAddress" style="width: 300px; height: 13px;">' + rAddress + '</td>' +
					'</tr>' +
					'<tr>' +
					'<td class="idWPhoneNumber" style="width: 150px; height: 13px;"><strong>Ph No</strong></td>' +
					'<td class="idWPhoneNumber" style="width: 300px; height: 13px;">' + rContNumber + '</td>' +
					'</tr>' +
					'<tr>' +
					'<td class="idWGSTN" style="width: 150px; height: 13px;"><strong>GSTN</strong></td>' +
					'<td class="idWGSTN" style="width: 300px; height: 13px;">' + rGSTNumber + '</td>' +
					'</tr>' +
					'</tbody>' +
					'</table>' +
					'<table style="display: inline-block; width: 450px; height: 100px;">' +
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
				var table = "<table style='border-collapse: collapse;border:1px solid black;'width='95%'';'text-align:center';'border-spacing: 5px';>" +
					// '<tbody>'+
					'<tr>' +
					'<th style=" border: 1px solid black;"><h4 style="text-align: center;">&nbsp;Material</h4></th>' +
					// '<th style=" border: 1px solid black;"><h4 style="text-align: center;">&nbsp;Description</h4></th>'+
					'<th class="idWQuantity" style=" border: 1px solid black;"><h4 style="text-align: center;">&nbsp;Qty</h4></th>' +
					'<th class="idWQuantityD" style=" border: 1px solid black;"><h4 style="text-align: center;">&nbsp;QtyD</h4></th>' +
					'<th class="idWWeight" style=" border: 1px solid black;"><h4 style="text-align: center;">Weight</h4></th>' +
					'<th class="idWWeightD" style=" border: 1px solid black;"><h4 style="text-align: center;">WeightD</h4></th>' +
					'<th class="idWMakingCharge" style=" border: 1px solid black;"><h4 style="text-align: center;">Making</h4></th>' +
					'<th class="idWMakingChargeD" style=" border: 1px solid black;"><h4 style="text-align: center;">MakingD</h4></th>' +
					'<th class="idWTunch" style=" border: 1px solid black;"><h4 style="text-align: center;">Tunch</h4></th>' +
					'<th class="idWRemarks" style=" border: 1px solid black"><h4 style="text-align: center;">Remarks</h4></th>' +
					'<th class="idWSubTotalS" style=" border: 1px solid black"><h4 style="text-align: center;">Sub Total Silver</h4></th>' +
					'<th class="idWSubTotalG" style=" border: 1px solid black"><h4 style="text-align: center;">Sub Total Gold</h4></th>' +
					'<th class="idWSubTotal" style=" border: 1px solid black"><h4 style="text-align: center;">Sub Total</h4></th>' +
					'</tr>';
				// '</tbody>';
				// Order Table Line Items
				var oTableDetails = this.getView().byId('WSItemFragment--orderItemBases');
				var oBinding = oTableDetails.getBinding("rows");
				var totalQuantity = 0;
				var totalWeight = 0;
				var sumOfSubTotal = 0.00;
				for (var i = 0; i < oBinding.getLength(); i++) {
					if (oBinding.oList[i].MaterialCode) {
						totalQuantity = totalQuantity + oBinding.oList[i].Qty;
						totalWeight = totalWeight + oBinding.oList[i].Weight;
						var matDesc = oBinding.oList[i].MaterialCode.concat('-', oBinding.oList[i].Description);
						if (!oBinding.oList[i].Remarks) {
							oBinding.oList[i].Remarks = "";
						}
						table += '<tr>';
						table += '<td style=" border: 1px solid black;">&nbsp;' + matDesc + '</td>' +
							// '<td style=" border: 1px solid black;">&nbsp;'+oBinding.oList[i].Description+'</td>'+
							'<td class="idWQuantity" style=" border: 1px solid black;">&nbsp;' + oBinding.oList[i].Qty + '</td>' +
							'<td class="idWQuantityD" style=" border: 1px solid black;">&nbsp;' + oBinding.oList[i].QtyD + '</td>' +
							'<td class="idWWeight" style=" border: 1px solid black;">&nbsp;' + oBinding.oList[i].Weight + '</td>' +
							'<td class="idWWeightD" style=" border: 1px solid black;">&nbsp;' + oBinding.oList[i].WeightD + '</td>' +
							'<td class="idWMakingCharge" style=" border: 1px solid black;">&nbsp;' + oBinding.oList[i].Making + '</td>' +
							'<td class="idWMakingChargeD" style=" border: 1px solid black;">&nbsp;' + oBinding.oList[i].MakingD + '</td>' +
							'<td class="idWTunch" style=" border: 1px solid black;">&nbsp;' + oBinding.oList[i].Tunch + '</td>' +
							'<td class="idWRemarks" style=" border: 1px solid black;">&nbsp;' + oBinding.oList[i].Remarks + '</td>' +
							'<td class="idWSubTotalS" style=" border: 1px solid black;s">&nbsp;' + oBinding.oList[i].SubTotalS + '</td>' +
							'<td class="idWSubTotalG" style=" border: 1px solid black;s">&nbsp;' + oBinding.oList[i].SubTotalG + '</td>' +
							'<td class="idWSubTotal" style=" border: 1px solid black;s">&nbsp;' + oBinding.oList[i].SubTotal + '</td></tr>';
					}
				}
				// table for order totals
				table += '<tr>' + '<td style=" ">&nbsp;</td>' +
					// '<td style=" ">&nbsp;</td>'+
					'<td class="idWQuantity" style=" "><strong>&nbsp;' + totalQuantity + '</strong></td>' +
					'<td class="idWQuantityD" style=" ">&nbsp;</td>' +
					'<td class="idWWeight" style=" "><strong>&nbsp;' + totalWeight + '</strong></td>' +
					'<td class="idWWeightD" style=" ">&nbsp;</td>' +
					'<td class="idWMakingCharge" style=" ">&nbsp;</td>' +
					'<td class="idWMakingChargeD" style=" ">&nbsp;</td>' +
					'<td class="idWTunch" style=" ">&nbsp;</td>' +
					'<td class="idWRemarks" style=" ">&nbsp;</td>' +
					'<td class="idWSubTotalS" style=" "><strong>&nbsp;' + orderHeader.TotalOrderValueSilver + '</strong></td>' +
					'<td class="idWSubTotalG" style=" "><strong>&nbsp;' + orderHeader.TotalOrderValueGold + '</strong></td>' +
					'<td class="idWSubTotal" style=" "><strong>&nbsp;' + orderHeader.TotalOrderValueCash + '</strong></td></tr>';

				// Return table
				var oReturns = this.getView().getModel("returnModel").getProperty("/TransData");
				if (oReturns[0].Type) {
					table += "<table style='border-collapse: collapse;border:1px solid black;'width='95%'';'text-align:center';'border-spacing: 5px';>" +
						'<tr>' +
						'<th style="width: 80px;border:1px solid black"><h4 style="text-align: center;">&nbsp;Product Type</h4></th>' +
						'<th class="idWReturnQuantity" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">&nbsp;Quantity</h4></th>' +
						'<th class="idWReturnWeight"   style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Weight</h4></th>' +
						'<th class="idWReturnKattaWeight"   style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Katta Weight</h4></th>' +
						'<th class="idWReturnTunch"   style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Tunch(%)</h4></th>' +
						'<th class="idWReturnBhav" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Return Bhav</h4></th>' +
						'<th class="idWReturnRemarks" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Return Remarks</h4></th>' +
						'<th class="idWSubTotalS" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Sub Total Silver</h4></th>' +
						'<th class="idWSubTotalG" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Sub Total Gold</h4></th>' +
						'<th class="idWSubTotal" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Sub Total</h4></th>' +
						'</tr>' +
						'<p><h3>Returns:</h3></p>';
					for (var i = 0; i < oReturns.length; i++) {
						if (oReturns[i].Type) {
							var retTotQuant = retTotQuant + oReturns[i].Qty;
							var retTotWeight = retTotWeight + oReturns[i].Weight;
							if (!oReturns[i].Remarks) {
								oReturns[i].Remarks = "";
							}
							table += '<tr>';
							table += '<td  style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].Type + '</td>' +
								'<td  class="idWReturnQuantity" style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].Qty + '</td>' +
								'<td  class="idWReturnWeight"   style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].Weight + '</td>' +
								'<td  class="idWReturnKattaWeight"   style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].KWeight + '</td>' +
								'<td  class="idWReturnTunch"   style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].Tunch + '</td>' +
								'<td  class="idWReturnBhav"     style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].Bhav + '</td>' +
								'<td  class="idWReturnRemarks"     style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].Remarks + '</td>' +
								'<td  class="idWSubTotalS" style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].SubTotalS + '</td>' +
								'<td  class="idWSubTotalG" style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].SubTotalG + '</td>' +
								'<td  class="idWSubTotal" style="width: 80px;border:1px solid black">&nbsp;' + oReturns[i].SubTotal + '</td></tr>';
						}
					}

					table += '<tr>' + '<td style="width: 80px;"><strong>&nbsp;Final Balance</strong></td>' +
						'<td class="idWReturnQuantity" style="width: 80px;">&nbsp;' + '</td>' +
						'<td class="idWReturnWeight" style="width: 80px;">&nbsp;</td>' +
						'<td class="idWReturnKattaWeight" style="width: 80px;">&nbsp;</td>' +
						'<td class="idWReturnTunch" style="width: 80px;">&nbsp;</td>' +
						'<td class="idWReturnBhav" style="width: 80px;">&nbsp;</td>' +
						'<td class="idWReturnRemarks" style="width: 80px;">&nbsp;</td>' +
						'<td class="idWSubTotalS" style="width: 80px;"><strong>&nbsp;' + orderHeader.FinalBalanceSilver + '</strong></td>' +
						'<td class="idWSubTotalG" style="width: 80px;"><strong>&nbsp;' + orderHeader.FinalBalanceGold + '</strong></td>' +
						'<td class="idWSubTotal" style="width: 80px;"><strong>&nbsp;' + orderHeader.FinalBalanceCash + '</strong></td></tr>';

				}
				table += '</table>';
				var footer = '<table style="height: 40px; width: 950px;">' +
					'<tbody>' +
					'<tr>' +
					'<td class="idWTnC" style="width: 150px;"><strong>Terms &amp; Conditions:</strong></td>' +
					'<td class="idWTnC" style="width: 800px;">&nbsp;' + rTnC + '</td>' +
					'</tr>' +
					'<tr>' +
					'<td class="idWMarking" style="width: 150px;">&nbsp;<strong>Marking:</strong></td>' +
					'<td class="idWMarking" style="width: 800px;">&nbsp;' + rMarking + '</td>' +
					'</tr>' +
					'</tbody></table>';
				debugger;
				var random = Math.floor(Math.random()*10000);
				var myWindow = window.open("", "PrintWindow" + random, "width=1200,height=800");
				myWindow.document.write(header + table + footer);
				for (var i = 0; i < arrayRemoveFromPrint.length; i++) {
					var coll = myWindow.document.getElementsByClassName(arrayRemoveFromPrint[i]);
					for (var j = 0; j < coll.length; j++) {
						coll[j].style.display = "none";
					}
				}
				myWindow.document.close();
				myWindow.focus();
				setTimeout(function() {
					myWindow.print();
				}, 1000);

				myWindow.stop();

			}
		});

	});
