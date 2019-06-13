/*global location*/
sap.ui.define(
	["victoria/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"victoria/models/formatter",
		"sap/m/MessageToast", "sap/ui/model/Filter"
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
				// Item Table as input table
				this.orderItem(oEvent);
				// Return Item Table as input table
				this.orderReturn();
			},
			_onRouteMatched: function(oEvent) {
				var that = this;
				var oHeaderDetail = that.getView().getModel('local').getProperty('/orderHeader');
				var oHeaderDetailT = that.getView().getModel('local').getProperty('/orderHeaderTemp');
				oHeaderDetail.OrderNo = 0;
				oHeaderDetail.Goldbhav1 = 0;
				oHeaderDetail.Goldbhav2 = 0;
				oHeaderDetail.SilverBhav = 0;
				this.getView().getModel('local').setProperty("/orderHeader", oHeaderDetail);
				that.getView().getModel("local").setProperty("/orderHeader/Date", formatter.getFormattedDate(0));
				oHeaderDetailT.CustomerId = "";
				oHeaderDetailT.CustomerName = "";
				this.getView().getModel('local').setProperty("/orderHeaderTemp", oHeaderDetailT);

				//item form set to initial stage
				var oOrderDetail = this.getView().getModel('local').getProperty('/WSOrderItem')
				var oTableDetails = this.getView().byId('orderItemBases');
				// var oBinding = oTableDetails.getBinding("rows");
				//
				// for (var i = 0; i < oBinding.getLength(); i++){
				//   oOrderDetail.Material="";
				//   oOrderDetail.Qty="";
				//   oOrderDetail.QtyD="";
				//   oOrderDetail.Making="";
				//   oOrderDetail.MakingD="";
				//   oOrderDetail.Weight="";
				//   oOrderDetail.WeightD="";
				//   oOrderDetail.Remarks="";
				//   oOrderDetail.SubTotal="";
				// this.getView().getModel('local').getProperty('/WSOrderItem',oOrderDetail);
			// }
			},
			valueHelpCustomer: function(oEvent) {
				this.getCustomerPopup(oEvent);
			},
			onConfirm: function(oEvent) {
				debugger;
				//whatever customer id selected push that in local model
				var myData = this.getView().getModel("local").getProperty("/orderHeader");
				myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
				this.getView().getModel("local").setProperty("/demoData", myData);
				var selCust = oEvent.getParameter("selectedItem").getLabel();
				var selCustName = oEvent.getParameter("selectedItem").getValue();
				this.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerId", selCust);
				this.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerName", selCustName);
				var oCustDetail = this.getView().getModel('local').getProperty('/orderHeaderTemp');
				oCustDetail.customerId = selCust;
				oCustDetail.CustomerName = selCustName;
				// this.getView().byId("customerId").setValue(selCust);
				// this.getView().byId("custName").setText(selCustName);
				// if (this.searchPopup) {
				//   this.searchPopup.destroy();
				// }
			},
			ValueChange: function(oEvent) {
				debugger;
				var that = this;
				var orderHeader = this.getView().getModel('local').getProperty('/orderHeader');
			  var category = that.getView().byId("orderItemBases").getModel("orderItems").getProperty(oEvent.getSource().getParent().getBindingContext("orderItems").getPath());
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
			onClear: function() {
				// debugger;
				// this.byId("idOrderNo").setValue("");
				// this.byId("customerId").setValue("");
				// this.byId("Gbhav1Id").setValue("");
				// this.byId("Gbhav2Id").setValue("");
				// this.byId("sbhavid").setValue("");
				// this.byId("custName").setText("");
				// this.byId("DateId").setDateValue(new Date());
				// debugger;
				// var oOrderItem = new JSONModel();
				// //create array
				// var array = [];
				// //loop the array values
				// for (var i = 1; i <= 20; i++) {
				// 	var oItem = {
				// 		"material": "",
				// 		"description": "",
				// 		"qty": "0",
				// 		"qtyd": "0",
				// 		"weight": "0",
				// 		"weightd": "0",
				// 		"making": "0",
				// 		"makingd": "0",
				// 		"tunch": "0",
				// 		"remarks": "",
				// 		"subTot": "0",
				// 	};
				// 	array.push(oItem);
				// }
				// //set the Data
				// oOrderItem.setData({
				// 	"itemData": array
				// });
				// //set the model
				// this.setModel(oOrderItem, "orderItems");

			},
			//on order create Button
			orderCreate: function(oEvent) {
				var that = this;
				that.getView().setBusy(true);
				// get the data from screen in local model
				debugger;
				var orderData = this.getView().getModel('local').getProperty("/orderHeader");
				if (orderData.Customer === "") {
					this.getView().byId("customerId").setValueState("Error").setValueStateText("Mandatory Input");
					that.getView().setBusy(false);
				} else {
					debugger;
					var date = new Date();
					var dd = date.getDate();
					var mm = date.getMonth() + 1;
					var yyyy = date.getFullYear();
					orderData.Date = yyyy + '.' + mm + '.' + dd;
					//call the odata promise method to post the data
					orderData.Date = orderData.Date.replace(".", "-").replace(".", "-");
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
							that.getView().getModel("local").setProperty("/orderHeader/OrderNo", oData.OrderNo);
						})
						.catch(function(oError) {
							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);
						});
				}
			},
			onSave: function(oEvent) {
				var that = this;
				debugger;
				var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
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
				}
				debugger;
				if (oHeader.OrderNo !== "" &&
					oHeader.OrderNo !== 0) {
					debugger;
					var oId = that.getView().getModel('local').getProperty('/OrderId').OrderId;
				}
				var oOrderDetail = this.getView().getModel('local').getProperty('/WSOrderItem')
				var oTableDetails = this.getView().byId('orderItemBases');
				var oBinding = oTableDetails.getBinding("rows");

				for (var i = 0; i < oBinding.getLength(); i++) {
					var that = this;
					this.getView().setBusy(true);
					var data = oBinding.oList[i];
					if (data.Material !== "") {
						oOrderDetail.OrderNo = oId; //orderno // ID
						oOrderDetail.Material = data.Material;
						oOrderDetail.Qty = data.Qty;
						oOrderDetail.QtyD = data.QtyD;
						oOrderDetail.Making = data.Making;
						oOrderDetail.MakingD = data.MakingD;
						oOrderDetail.Tunch = data.Tunch;
						oOrderDetail.Weight = data.Weight;
						oOrderDetail.WeightD = data.WeightD;
						oOrderDetail.Remarks = data.Remarks;
						oOrderDetail.SubTotal = data.SubTot;
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
								debugger;
							})
							.catch(function(oError) {
								that.getView().setBusy(false);
								var oPopover = that.getErrorMessage(oError);
							});
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
