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
			},
			_onRouteMatched: function(oEvent) {

				var that = this;
				this.clearScreen(oEvent);
			},
			valueHelpCustomer: function(oEvent) {

				this.getCustomerPopup(oEvent);
			},
			setStatus: function(color) {
				this.byId("WSHeaderFragment--idSaveIcon").setColor(color);
			},
			getStatus: function() {
				var currStatus = this.byId("WSHeaderFragment--idSaveIcon").getColor();
				return currStatus;
			},
			onConfirm: function(oEvent) {

				if (oEvent.getParameter('id') === 'orderNo') {
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
					this.getOrderDetails(oEvent, orderId, oFilter);
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
			getOrderDetails: function(oEvent, orderId, oFilter) {

				var that = this;
				that.orderItem(oEvent);
				that.orderReturn(oEvent);
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/WSOrderHeaders('" + orderId + "')", "GET", {
							filters: [oFilter]
						}, {}, this)
					.then(function(oData) {

						that.getView().setBusy(false);
						var custId = oData.Customer;
						var customerData = that.allMasterData.customers[custId];

						that.getView().getModel("local").setProperty("/WSOrderHeader", oData);
						that.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerId", customerData.CustomerCode);
						that.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerName", customerData.Name + " - " + customerData.City);
						that.getView().byId("WSHeaderFragment--custName").setText(customerData.Name + " - " + customerData.City);

						// var oFilter = new sap.ui.model.Filter("Customer","EQ", "'" + myData.Customer + "'");
						// assign the details on ui
						//   var that2 = this;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
								"/WSOrderHeaders('" + orderId + "')/ToWSOrderItem",
								"GET", {}, {}, that)
							.then(function(oData) {

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
										// allItems[i].SubTotal = oData.results[i].SubTotal;
										// allItems[i].SubTotalG = oData.results[i].SubTotalG;
										// allItems[i].SubTotalS = oData.results[i].SubTotalS;
										allItems[i].Weight = oData.results[i].Weight;
										allItems[i].WeightD = oData.results[i].WeightD;
										allItems[i].Remarks = oData.results[i].Remarks;
										var MaterialData = that.allMasterData.materials[oData.results[i].Material];
										allItems[i].Material = oData.results[i].Material;
										allItems[i].Description = MaterialData.ProductName;
										allItems[i].MaterialCode = MaterialData.ProductCode;
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
				this.orderSearchPopup.sId = 'orderNo';
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
				this.onTunchChange(oEvent);
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

				var that = this;
				var viewId = oEvent.getSource().getParent().getParent().getId().split('---')[1].split('--')[0];
				var oSourceCall = oEvent.getSource().getParent().getParent().getId().split('---')[1].split('--')[1];
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
										// If row contains id(which means it has been saved in DB)
										if (id) {
											var myUrl = "/WSOrderItems('" + id + "')"
											that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,
												"DELETE", {}, {}, that);
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
					// var FSubTotalS = this.getIndianCurr(SubTotalS);
					if (tablePath) {

						category.SubTotalS = SubTotalS;
						category.SubTotalG = 0
						// this.setStatus('red');
						this.getView().byId("WSItemFragment--orderItemBases").getModel("orderItems").setProperty(tablePath, category);
					} else {
						cells[cells.length - 3].setText(SubTotalS);
						cells[cells.length - 2].setText(0);
					}

				} else if (category.Type === "Gold") {

					var SubTotalG = weightF * data.Tunch / 100;
					SubTotalG = parseFloat(SubTotalG).toFixed(3);
					// var FSubTotalG = this.getIndianCurr(SubTotalG);
					if (tablePath) {

						category.SubTotalG = SubTotalG;
						category.SubTotalS = 0
						// this.setStatus('red');
						this.getView().byId("WSItemFragment--orderItemBases").getModel("orderItems").setProperty(tablePath, category);
					} else {
						cells[cells.length - 2].setText(SubTotalG);
						cells[cells.length - 3].setText(0);
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
					var making = data.Making.toString();
					data.Making = oFloatFormat.parse(making);
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
					var tunch = data.Tunch.toString();
					data.Tunch = oFloatFormat.parse(tunch);
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
								category.Making = oData.Making;
								category.Tunch = oData.Tunch;
								category.Type = oData.Type;
								// category.Karat = oData.Karat;
								that.PreCalc(data, fieldId, newValue, oFloatFormat);
								that.finalCalculation(category, data, tablePath, cells);
								that.getFinalBalance();
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

				this.byId("IdMaking");
				this.byId("IdMakingD");
				this.byId("IdWeightD");
				this.byId("IdWeight");
				this.byId("IdQty");
				this.byId("IdQtyD");
				this.byId("sbhavid");
			},
			onTunchChange: function(oEvent) {
				debugger;
				var that = this;
				var path = this.getView().byId("WSItemFragment--orderItemBases").getBinding().getPath() + '/' + oEvent.getSource().getParent().getIndex();
				var data = this.getView().getModel('orderItems').getProperty(path);
				var fieldId = oEvent.getSource().getId().split('---')[1].split('--')[2].split('-')[0];
				var newValue = oEvent.getParameters().newValue;
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
					var FinalBalanceGold = 0;
				} else {
					var FinalBalanceGold = parseFloat(that.FinalBalanceGold).toFixed(3);
					FinalBalanceGold = that.getIndianCurr(FinalBalanceGold);

				}
				that.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalanceGold', FinalBalanceGold);

				that.FinalBalanceSilver = that.TotalOrderValueSilver - that.DeductionSilver;
				if (that.FinalBalanceSilver === 0) {
					var FinalBalanceSilver = 0;
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
			onMaterialSelect: function(oEvent) {
				debugger;
				if (oEvent.getSource().getId().split('---')[1].split('--')[0] === 'idsales') {
					this.byId("Sales--idSaveIcon").setColor('red');
				}
				var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
				// var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
				var oModelForRow = oEvent.getSource().getParent().getBindingContext("orderItems").getModel();
				var sRowPath = oEvent.getSource().getParent().getBindingContext("orderItems").getPath();
				oModelForRow.setProperty(sRowPath + "/Material", selectedMatData.id);
				oModelForRow.setProperty(sRowPath + "/Description", selectedMatData.ProductName);
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
				if (oEvent.getSource().getId().split('---')[1].split('--')[0] === 'idsalesws') {
					var Customer = this.getView().getModel('local').getProperty('/WSOrderHeader').Customer;
					var oFilter1 = new sap.ui.model.Filter("Product", sap.ui.model.FilterOperator.EQ, Customer);
					var oFilter2 = new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, selectedMatData.id);
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							// "/WSTunchs('" + '5d4b195896718d126c49f7f1' + "')" , "GET",
							"/WSTunchs", "GET", {
								filters: [oFilter1, oFilter2]
							}, {}, this)
						.then(function(oData) {
							debugger;
							selectedMatData.Making = oData.Making;
							selectedMatData.Tunch = oData.Tunch;
							if (selectedMatData.Tunch) {
								oModelForRow.setProperty(sRowPath + "/Tunch", selectedMatData.Tunch);
							} else {
								oModelForRow.setProperty(sRowPath + "/Tunch", 0);
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

				// if (selectedMatData.Tunch) {
				// 	oModelForRow.setProperty(sRowPath + "/Tunch", selectedMatData.Tunch);
				// } else {
				// 	oModelForRow.setProperty(sRowPath + "/Tunch", 0);
				// }

				if (oEvent.getSource().getId().split('---')[1].split('--')[0] === 'idsalesws') {
					this.byId("WSHeaderFragment--idSaveIcon").setColor('red');
				}
			},
			onExit: function() {

				if (this.searchPopup) {
					this.searchPopup.destroy();
				}
			},
			getPrintCustHeaderData: function(){
			  var that = this;
			  this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			      "/prints", "GET", {}, {}, this)
			    .then(function(oData) {
			      debugger;
			      var printHeadData = that.getView().getModel("local").getProperty("/printCustomizing");
			      for(var i = 0; i < oData.results.length ; i++){
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

			    }).catch(function(oError) {
			  });
			},
			onPrintWs:function(){
				debugger;
				var that = this;

				// var allItems = this.getView().getModel("local").getProperty("/printCustomizingData");
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/prints", "GET", {}, {}, this)
					.then(function(oData) {
						debugger;
						that.wholesalePrint(oData);
						// that.getView().getModel("local").setProperty("/printCustomizingData",oData);

					}).catch(function(oError) {
				});
			},
			wholesalePrint:function(oData){
				debugger;
				var arrayRemoveFromPrint = [];
				var hideHeaderContents = [];
				var orderHeader = this.getView().getModel("local").getProperty("/orderHeaderTemp"); // Cust Id/Name
				var orderDetails = this.getView().getModel('local').getProperty("/WSOrderHeader"); //order no/date/Gold/Silver Bhav
				var printCustHeadVal = this.getView().getModel("local").getProperty("/printCustomizing"); //print cust view header details
				if(orderDetails.Date){
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
				if(orderDetails.Customer){
					var custId = orderDetails.Customer;
					var cusData = this.allMasterData.customers[custId];
				}
				var printDate = formatter.getFormattedDate(0);
				var rCompName,rAddress,rContNumber,rGSTNumber,rEstimate,rWeight,rBhav,rSubtotal,title,rTnC,rMarking;
				for(var i=0 ; i<oData.results.length ; i++){
					switch (oData.results[i].Name) {
						case "__component0---idPrint--idRCompName":
						 if(oData.results[i].Value === "true"){
								rCompName = printCustHeadVal.CompName;
						 }else{
									 arrayRemoveFromPrint.push('idRCompName');
						 }
							break;
						case "__component0---idPrint--idRAddress":
						 if(oData.results[i].Value === "true"){
								rAddress = printCustHeadVal.Address;
						 }else {
							 arrayRemoveFromPrint.push('idRAddress');
						 }
						 break;
						case "__component0---idPrint--idContNo":
							if(oData.results[i].Value === "true"){
								 rContNumber = printCustHeadVal.ContNumber;
							}else {
								arrayRemoveFromPrint.push('idRPhoneNumber');
							}
							break;
						case "__component0---idPrint--idRGSTN":
							if(oData.results[i].Value === "true"){
								 rGSTNumber = printCustHeadVal.GSTNumber;
							}else {
								arrayRemoveFromPrint.push('idRGSTN');
							}
							break;
							case "__component0---idPrint--idRWeight":
							debugger;
								if(oData.results[i].Value === "false"){
									arrayRemoveFromPrint.push('idRWeight');
								}
								break;
								case "__component0---idPrint--idREstimate":
									if(oData.results[i].Value === "true"){
										 title = "Estimate";
									}else {
											title = "Invoice";
									}
									break;
									case "__component0---idPrint--idRSubTotal":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRSubTotal');
									}
									break;
									case "__component0---idPrint--idRBhav":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRBhav');
									}
									break;
									case "__component0---idPrint--idRMakingCharge":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRMakingCharge');
									}
									break;
									case "__component0---idPrint--idRTnC":
									if(oData.results[i].Value === "true"){
										rTnC = printCustHeadVal.TnC;
									}else {
											arrayRemoveFromPrint.push('idRTnC');
									}
									break;
									case "__component0---idPrint--idRMarking":
										if(oData.results[i].Value === "true"){
											 rMarking = printCustHeadVal.Marking;
										}else {
											arrayRemoveFromPrint.push('idRMarking');
										}
										break;
									case "__component0---idPrint--idRQuantity":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRQuantity');
									}
									break;
									case "__component0---idPrint--idRReturnWeight":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRReturnWeight');
									}
									break;
									case "__component0---idPrint--idRReturnBhav":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRReturnBhav');
									}
									break;
									case "__component0---idPrint--idRWeightD":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRWeightD');
									}
									break;
									case "__component0---idPrint--idRQuantityD":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRQuantityD');
									}
									break;
									case "__component0---idPrint--idRMakingChargeD":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRMakingChargeD');
									}
									break;
									case "__component0---idPrint--idRRemarks":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRRemarks');
									}
									break;
									case "__component0---idPrint--idRReturnRemarks":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRReturnRemarks');
									}
									break;
									case "__component0---idPrint--idRReturnKattaWeight":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRReturnKattaWeight');
									}
									break;
									case "__component0---idPrint--idRReturnTunch":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRReturnTunch');
									}
									break;
									case "__component0---idPrint--idRReturnSubTotal":
									if(oData.results[i].Value === "false"){
										arrayRemoveFromPrint.push('idRReturnSubTotal');
									}
						default:
					}
				}
			var header = '<h2 style="text-align: center;"><strong>'+title+'</strong></h2><hr />'+
			'<table style="display: inline-block; float: left; width: 450px; height: 100px;">'+
			'<tbody>'+
			'<tr>'+
			'<td class="idRCompName" style="width: 150px; height: 13.5px;"><strong>Company Name</strong></td>'+
			'<td class="idRCompName" style="width: 300px; height: 13.5px;">'+rCompName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td class="idRAddress" style="width: 150px; height: 13px;"><strong>Address</strong></td>'+
			'<td class="idRAddress" style="width: 300px; height: 13px;">'+rAddress+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td class="idRPhoneNumber" style="width: 150px; height: 13px;"><strong>Ph No</strong></td>'+
			'<td class="idRPhoneNumber" style="width: 300px; height: 13px;">'+rContNumber+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td class="idRGSTN" style="width: 150px; height: 13px;"><strong>GSTN</strong></td>'+
			'<td class="idRGSTN" style="width: 300px; height: 13px;">'+rGSTNumber+'</td>'+
			'</tr>'+
			'</tbody>'+
			'</table>'+
			'<table style="display: inline-block; width: 500px; height: 100px;">'+
			'<tbody>'+
			'<tr>'+
			'<td style="width: 150px;"><strong>Customer Name</strong></td>'+
			'<td style="width: 350px;">'+orderHeader.CustomerName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td style="width: 150px;"><strong>City</strong></td>'+
			'<td style="width: 350px;">'+cusData.City+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td style="width: 150px;"><strong>Customer Contact</strong></td>'+
			'<td style="width: 350px;">'+cusData.MobilePhone+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td style="width: 150px;"><strong>Print Date</strong></td>'+
			'<td style="width: 350px;">'+printDate+'</td>'+
			'</tr>'+
			'</tbody>'+
			'</table>'+
			'<hr />'+
			'<table style="width: 900px;">'+
			'<tbody>'+
			'<tr>'+
			'<td style="width: 160px;"><strong>Invoice Number</strong></td>'+
			'<td style="width: 300px;">&nbsp;'+orderDetails.OrderNo+'</td>'+
			'<td style="width: 150px;"><strong>Date</strong></td>'+
			'<td style="width: 270px;">&nbsp;'+orderDate+'</td>'+
			'</tr>'+
			'</tbody>'+
			'</table>'+
			'<hr />';

			// Prepare Order table header
			var table = "<table style='border-collapse: collapse;border:1px solid black;'width='95%'';'text-align:center';'border-spacing: 5px';>"+
			// '<tbody>'+
			'<tr>'+
			'<th style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">&nbsp;Material</h4></th>'+
			// '<th style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">&nbsp;Description</h4></th>'+
			'<th class="idRQuantity" style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">&nbsp;Qty</h4></th>'+
			'<th class="idRQuantityD" style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">&nbsp;QtyD</h4></th>'+
			'<th class="idRWeight" style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">Weight</h4></th>'+
			'<th class="idRWeightD" style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">WeightD</h4></th>'+
			'<th class="idRMakingCharge" style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">Making</h4></th>'+
			'<th class="idRMakingChargeD" style="width: 80px;border: 1px solid black;"><h4 style="text-align: center;">MakingD</h4></th>'+
			'<th class="idRRemarks" style="width: 80px;border: 1px solid black"><h4 style="text-align: center;">Remarks</h4></th>'+
			'<th class="idRSubTotal" style="width: 80px;border: 1px solid black"><h4 style="text-align: center;">Sub Total</h4></th>'+
			'</tr>';
			// '</tbody>';
			// Order Table Line Items
			var oTableDetails = this.getView().byId('WSItemFragment--orderItemBases');
			var oBinding = oTableDetails.getBinding("rows");
			var totalQuantity = 0;
			var totalWeight = 0;
			var sumOfSubTotal = 0.00;
			for (var i = 0; i < oBinding.getLength(); i++) {
				if(oBinding.oList[i].MaterialCode){
					totalQuantity = totalQuantity + oBinding.oList[i].Qty;
					totalWeight = totalWeight + oBinding.oList[i].Weight;
					var matDesc = oBinding.oList[i].MaterialCode.concat('-',oBinding.oList[i].Description);
					table += '<tr>';
				table += '<td style="width: 80px;border: 1px solid black;">&nbsp;'+matDesc+'</td>'+
								 // '<td style="width: 80px;border: 1px solid black;">&nbsp;'+oBinding.oList[i].Description+'</td>'+
								 '<td class="idRQuantity" style="width: 80px;border: 1px solid black;">&nbsp;'+oBinding.oList[i].Qty+'</td>'+
								 '<td class="idRQuantityD" style="width: 80px;border: 1px solid black;">&nbsp;'+oBinding.oList[i].QtyD+'</td>'+
								 '<td class="idRWeight" style="width: 80px;border: 1px solid black;">&nbsp;'+oBinding.oList[i].Weight+'</td>'+
								 '<td class="idRWeightD" style="width: 80px;border: 1px solid black;">&nbsp;'+oBinding.oList[i].WeightD+'</td>'+
								 '<td class="idRMakingCharge" style="width: 80px;border: 1px solid black;">&nbsp;'+oBinding.oList[i].Making+'</td>'+
								 '<td class="idRMakingChargeD" style="width: 80px;border: 1px solid black;">&nbsp;'+oBinding.oList[i].MakingD+'</td>'+
								 '<td class="idRRemarks" style="width: 80px;border: 1px solid black;">&nbsp;'+oBinding.oList[i].Remarks+'</td>'+
								 '<td class="idRSubTotal" style="width: 80px;border: 1px solid black;s">&nbsp;'+oBinding.oList[i].SubTotal+'</td></tr>';
							}
			}
			// table for order totals
			table += '<tr>'+'<td style="width: 80px;">&nbsp;</td>'+
							 // '<td style="width: 80px;">&nbsp;</td>'+
							 '<td class="idRQuantity" style="width: 80px;"><strong>&nbsp;'+totalQuantity+'</strong></td>'+
							 '<td class="idRQuantityD" style="width: 80px;">&nbsp;</td>'+
							 '<td class="idRWeight" style="width: 80px;"><strong>&nbsp;'+totalWeight+'</strong></td>'+
							 '<td class="idRWeightD" style="width: 80px;">&nbsp;</td>'+
							 '<td class="idRMakingCharge" style="width: 80px;">&nbsp;</td>'+
							 '<td class="idRMakingChargeD" style="width: 80px;">&nbsp;</td>'+
							 '<td class="idRRemarks" style="width: 80px;">&nbsp;</td>'+
							 '<td class="idRSubTotal" style="width: 80px;"><strong>&nbsp;'+orderHeader.TotalOrderValue+'</strong></td></tr>';

			// Return table
			var oReturns = this.getView().getModel("returnModel").getProperty("/TransData");
			if (oReturns[0].Type){
			 table += "<table style='border-collapse: collapse;border:1px solid black;'width='95%'';'text-align:center';'border-spacing: 5px';>"+
			 '<tr>'+
			 '<th style="width: 80px;border:1px solid black"><h4 style="text-align: center;">&nbsp;Product Type</h4></th>'+
			 '<th class="idRReturnQuantity" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">&nbsp;Quantity</h4></th>'+
			 '<th class="idRReturnWeight"   style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Weight</h4></th>'+
			 '<th class="idRReturnKattaWeight"   style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Katta Weight</h4></th>'+
			 '<th class="idRReturnTunch"   style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Tunch(%)</h4></th>'+
			 '<th class="idRReturnBhav" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Return Bhav</h4></th>'+
			 '<th class="idRReturnRemarks" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Return Remarks</h4></th>'+
			 '<th class="idRReturnSubTotal" style="width: 80px;border:1px solid black"><h4 style="text-align: center;">Sub Total</h4></th>'+
			 '</tr>'+
			 '<p><h3>Returns:</h3></p>';
			 for (var i = 0; i < oReturns.length; i++) {
				 if(oReturns[i].Type){
					 var retTotQuant = retTotQuant + oReturns[i].Qty;
					 var retTotWeight = retTotWeight + oReturns[i].Weight;
					 table += '<tr>';
					 table += '<td  style="width: 80px;border:1px solid black">&nbsp;'+oReturns[i].Type+'</td>'+
										'<td  class="idRReturnQuantity" style="width: 80px;border:1px solid black">&nbsp;'+oReturns[i].Qty+'</td>'+
										'<td  class="idRReturnWeight"   style="width: 80px;border:1px solid black">&nbsp;'+oReturns[i].Weight+'</td>'+
										'<td  class="idRReturnKattaWeight"   style="width: 80px;border:1px solid black">&nbsp;'+oReturns[i].KWeight+'</td>'+
										'<td  class="idRReturnTunch"   style="width: 80px;border:1px solid black">&nbsp;'+oReturns[i].Tunch+'</td>'+
										'<td  class="idRReturnBhav"     style="width: 80px;border:1px solid black">&nbsp;'+oReturns[i].Bhav+'</td>'+
										'<td  class="idRReturnRemarks"     style="width: 80px;border:1px solid black">&nbsp;'+oReturns[i].Remarks+'</td>'+
										'<td  class="idRReturnSubTotal" style="width: 80px;border:1px solid black">&nbsp;'+oReturns[i].SubTotal+'</td></tr>';
				 }
			 }

			 table += '<tr>'+'<td style="width: 80px;"><strong>&nbsp;Final Balance</strong></td>'+
								'<td class="idRReturnQuantity" style="width: 80px;">&nbsp;'+'</td>'+
								'<td class="idRReturnWeight" style="width: 80px;">&nbsp;</td>'+
								'<td class="idRReturnKattaWeight" style="width: 80px;">&nbsp;</td>'+
								'<td class="idRReturnTunch" style="width: 80px;">&nbsp;</td>'+
								'<td class="idRReturnBhav" style="width: 80px;">&nbsp;</td>'+
								'<td class="idRReturnRemarks" style="width: 80px;">&nbsp;</td>'+
								'<td class="idRReturnSubTotal" style="width: 80px;"><strong>&nbsp;'+orderHeader.FinalBalance+'</strong></td></tr>';

			}
			table += '</table>';
			var footer = '<table style="height: 40px; width: 950px;">'+
									 '<tbody>'+
									 '<tr>'+
									 '<td class="idRTnC" style="width: 150px;"><strong>Terms &amp; Conditions:</strong></td>'+
									 '<td class="idRTnC" style="width: 800px;">&nbsp;'+rTnC+'</td>'+
									 '</tr>'+
									 '<tr>'+
									 '<td class="idRMarking" style="width: 150px;">&nbsp;<strong>Marking:</strong></td>'+
									 '<td class="idRMarking" style="width: 800px;">&nbsp;'+rMarking+'</td>'+
									 '</tr>'+
									 '</tbody></table>';
			debugger;
				var myWindow = window.open("", "PrintWindow", "width=200,height=100");
						myWindow.document.write(header+table+footer);
						for (var i = 0; i < arrayRemoveFromPrint.length; i++){
							var coll = myWindow.document.getElementsByClassName(arrayRemoveFromPrint[i]);
							for(var j=0;j<coll.length;j++){
								coll[j].style.display = "none";
							}
						}
						myWindow.print();
						myWindow.stop();

			}
		});

	});
