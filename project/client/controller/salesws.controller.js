/*global location*/
sap.ui.define(
		["victoria/controller/BaseController",
			"sap/ui/model/json/JSONModel",
			"sap/ui/core/routing/History",
			"victoria/models/formatter",
			"sap/m/MessageToast",
			"sap/ui/model/Filter"
		],
		function(BaseController, JSONModel, History, formatter,
			MessageToast, Filter) {
			"use strict";

			return BaseController.extend("victoria.controller.salesws", {
						formatter: formatter,
						onInit: function(oEvent) {
							debugger;
							BaseController.prototype.onInit.apply(this);
							var oRouter = this.getRouter();
							oRouter.getRoute("salesws").attachMatched(this._onRouteMatched, this);
						},
						_onRouteMatched: function(oEvent) {
							debugger;
							var that = this;
							this.onClear(oEvent);
						},
						valueHelpCustomer: function(oEvent) {
							debugger;
							this.getCustomerPopup(oEvent);
						},
						onConfirm: function(oEvent) {
							debugger;
							var oId = oEvent.getParameter('selectedItem').getId();
							var oCustDetail = this.getView().getModel('local').getProperty('/orderHeaderTemp');
							var oSource = oId.split("-" [0])

							var selCust = oEvent.getParameter("selectedItem").getLabel();
							var selCustName = oEvent.getParameter("selectedItem").getValue();
							oCustDetail.customerId = selCust;
							oCustDetail.CustomerName = selCustName;
							// this.getView().byId("customerId").setValue(selCust);
							// this.getView().byId("custName").setText(selCustName);
							this.getView().getModel("local").setProperty("/WSOrderHeader/Customer",
								oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
							this.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerId",
								selCust);
						},
						ValueChange: function(oEvent) {
							debugger;
							var that = this;
							var orderHeader = this.getView().getModel('local').getProperty('/WSOrderHeader');
							var category = this.getView().byId("WSItemFragment--orderItemBases").getModel("orderItems").getProperty(oEvent.getSource().getParent().getBindingContext("orderItems").getPath());
							var oCurrentRow = oEvent.getSource().getParent();
							var cells = oCurrentRow.getCells();
							var X = cells[4].getValue() - cells[5].getValue();
							if (category.Category === 'gm') {
								var Y = X * cells[6].getValue();
							} else if (category.Category === 'pcs') {
								var Y = cells[2].getValue() * cells[6].getValue();
							};
							if (cells[3].getValue() &&
								cells[7].getValue()) {
								var Z = cells[3].getValue() * cells[7].getValue();
							};
							if (category.Type === "Silver") {
								cells[10].setValue(X * cells[8].getValue() / 100);
							} else if (category.Type === "Gold") {
								cells[11].setValue(X * cells[8].getValue() / 100);
							};
							cells[12].setValue(Y + Z);

						},
						onClear: function(oEvent) {
							debugger;
							var that = this;
							//Clear Header Details
							var oHeader = this.getView().getModel('local').getProperty('/WSOrderHeader');
							var oHeaderT = this.getView().getModel('local').getProperty('/orderHeaderTemp');
							oHeaderT.CustomerName = "";
							oHeaderT.CustomerId = "";
							oHeader.OrderNo = "";
							this.getView().getModel('local').setProperty('/orderHeaderTemp', oHeaderT);
							// oHeader.Date=new Date();
							this.getView().getModel('local').setProperty('/WSorderHeader', oHeader);
							// this.getView().getModel("local").setProperty("/WSorderHeader/Date", formatter.getFormattedDate(0));
							this.getView().byId("WSHeaderFragment--DateId").setDateValue(new Date());
							this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
									"/CustomCalculations", "GET", {}, {}, this)
								.then(function(oData) {
									debugger;
									that.getView().getModel("local").setProperty("/WSOrderHeader/Goldbhav", oData.results[0].Gold1);
									that.getView().getModel("local").setProperty("/WSOrderHeader/GoldbhavK", oData.results[0].KacchaGold);
									that.getView().getModel("local").setProperty("/WSOrderHeader/SilverBhav", oData.results[0].Silver1);
									that.getView().getModel("local").setProperty("/WSOrderHeader/SilverBhavK", oData.results[0].KacchaSilver);
								}).catch(function(oError) {
									debugger;
									MessageToast.show("cannot fetch the data");
								});
							//Clear Item table
							this.orderItem(oEvent);
							this.orderReturn();

						},
						//on order create Button
						orderCreate: function(oEvent) {
							var that = this;
							that.getView().setBusy(true);
							// get the data from screen in local model
							debugger;
							var orderData = this.getView().getModel('local').getProperty("/WSOrderHeader");
							if (orderData.Customer === "") {
								this.getView().byId("WSHeaderFragment--customerId").setValueState("Error").setValueStateText("Mandatory Input");
								that.getView().setBusy(false);
							} else {
								debugger;
								//call the odata promise method to post the data
								orderData.Date = this.getView().byId("WSHeaderFragment--DateId").getValue();
								this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/WSOrderHeaders",
										"POST", {}, orderData, this)
									.then(function(oData) {
										that.getView().setBusy(false);
										debugger;
										//create the new json model and get the order id no generated
										var oOrderId = that.getView().getModel('local').getProperty('/OrderId');
										oOrderId.OrderId = oData.id;
										oOrderId.OrderNo = oData.OrderNo;
										that.getView().getModel('local').setProperty('/OrderId', oOrderId);
										//assign the no on ui
										that.getView().getModel("local").setProperty("/WSOrderHeader/OrderNo", oData.OrderNo);
									})
									.catch(function(oError) {
										that.getView().setBusy(false);
										var oPopover = that.getErrorMessage(oError);
									});
							}
						},
						onSave: function(oEvent) {
							debugger;
							var that = this;

							var oHeader = this.getView().getModel('local').getProperty('/WSOrderHeader');
							if (oHeader.OrderNo === 0) {
								MessageBox.show(
									"Please create Order Number first", {
										icon: MessageBox.Icon.ERROR,
										title: "Error",
										actions: [MessageBox.Action.OK],
										onClose: function(oAction) {}
									}
								);
								that.getView().setBusy(false);
							} else {
								if (oHeader.OrderNo !== "" &&
									oHeader.OrderNo !== 0) {

									var oId = that.getView().getModel('local').getProperty('/OrderId').OrderId;
								}
								var oOrderDetail = this.getView().getModel('local').getProperty('/WSOrderItem')
								var oTableDetails = this.getView().byId('WSItemFragment--orderItemBases');
								var oBinding = oTableDetails.getBinding("rows");

								for (var i = 0; i < oBinding.getLength(); i++) {
									var that = this;
									this.getView().setBusy(true);
									var data = oBinding.oList[i];

									//posting the data
									if (data.Material !== "") {
										oOrderDetail.OrderNo = oId;
										oOrderDetail.Material = data.Material;
										if (data.Qty !== 0) {
											oOrderDetail.Qty = data.Qty;
										} else {
											oOrderDetail.Qty = 0.0;
										}
										//Making charges
										if (data.Making !== 0) {
											oOrderDetail.Making = data.Making;
										} else {
											// oOrderDetail.Making=0.0;
											debugger;
											// this.getView().byId("IdQty").setValue();
											// this.getView().byId("WSItemFragment--customerId").setValueState("Error").setValueStateText("Mandatory Input");
										}
										// oOrderDetail.Making=data.Making quantityD
										oOrderDetail.QtyD = data.QtyD;
										oOrderDetail.MakingD = data.MakingD;
										oOrderDetail.Weight = data.Weight;
										oOrderDetail.WeightD = data.WeightD;
										oOrderDetail.Remarks = data.Remarks;
										oOrderDetail.SubTotal = data.SubTot;
										oOrderDetail.Tunch = data.Tunch;
										oOrderDetail.SubTotalS = data.SubTotalS;
										oOrderDetail.SubTotalG = data.SubTotalG;

										var oOrderDetailsClone = JSON.parse(JSON.stringify(oOrderDetail));
										//Item data save
										this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
												"/WSOrderItems", "POST", {}, oOrderDetailsClone, this)
											.then(function(oData) {
												that.getView().setBusy(false);
												sap.m.MessageToast.show("Data Saved Successfully");
												var id = oData.id;
											})
											.catch(function(oError) {
												that.getView().setBusy(false);
												var oPopover = that.getErrorMessage(oError);
											});
										}
										}
										}
									},
									onExit: function() {
										debugger;
										if (this.searchPopup) {
											this.searchPopup.destroy();
										}
									}
								});

						});
