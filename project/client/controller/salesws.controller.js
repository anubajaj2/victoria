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
			onInit: function(oEvent) {
				debugger;
				BaseController.prototype.onInit.apply(this);
				var oRouter = this.getRouter();
				oRouter.getRoute("salesws").attachMatched(this._onRouteMatched, this);
			},
			_onRouteMatched: function(oEvent) {
				debugger;
				var that = this;
				this.clearScreen(oEvent);
			},
			valueHelpCustomer: function(oEvent) {
				debugger;
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
				debugger;
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

			},
			ValueChange: function(oEvent) {
				debugger;
				this.WSCalculation(oEvent);
				this.setStatus('red');
			},
			WSCalculation: function(oEvent) {
				debugger;

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



				// // X=Weight - WeightD
				// X = cells[4].getValue() - cells[5].getValue();
				// // Y = X * Making (if per gm) OR Qty * Making (if per pc)
				// if (category.Category === 'gm') {
				// 	Y = X * cells[6].getValue();
				// } else if (category.Category === 'pcs') {
				// 	var Y = cells[2].getValue() * cells[6].getValue();
				// };
				// // Z = QtyD * MakingD (if value there)
				// if (cells[3].getValue() &&
				// 	cells[7].getValue()) {
				// 	Z = cells[3].getValue() * cells[7].getValue();
				// };
				// // SubTotalSilver / SubTotalGold = X * Tunch / 100
				// if (category.Type === "Silver") {
				// 	cells[10].setValue(X * cells[8].getValue() / 100);
				// } else if (category.Type === "Gold") {
				// 	cells[11].setValue(X * cells[8].getValue() / 100);
				// };
				// // SubTotal = Y + Z
				// cells[12].setValue(Y + Z);
			},
			onSetting: function(oEvent) {
				this.hideDColumns(oEvent);
			},
			gGBhav: 0,
			gGBhavK: 0,
			gSBhav: 0,
			gSBhavK: 0,
			ValueChangeHeader: function(oEvent) {
				debugger;
				this.setStatus('red');
				// var that = this;
				// var field = oEvent.getSource().getId().split('---')[1].split('--')[2];
				// var newvalue = oEvent.getParameter('newValue');
				// if (field === "idGbhav") {
				// 	if (newvalue == this.gGBhav) {
				// 		this.setStatus('green');
				// 	} else {
				// 		this.setStatus('red');
				// 	}
				// }
				//
				// if (field === "idSBhav") {
				// 	if (newvalue == this.gSBhav) {
				// 		this.setStatus('green');
				// 	} else {
				// 		this.setStatus('red');
				// 	}
				// }
				//
				// if (field === "idGbhavK") {
				// 	if (newvalue == this.gGBhavK) {
				// 		this.setStatus('green');
				// 	} else {
				// 		this.setStatus('red');
				// 	}
				// }
				//
				// if (field === "idSBhavK") {
				// 	if (newvalue == this.gSBhavK) {
				// 		this.setStatus('green');
				// 	} else {
				// 		this.setStatus('red');
				// 	}
				// }
			},
			// onTableExpand: function(oEvent) {
			// 	var splitApp = sap.ui.getCore().byId("__xmlview0--idSplitApp");
			// 	var masterVisibility = splitApp.getMode();
			// 	if (masterVisibility == "ShowHideMode") {
			// 		debugger;
			// 		splitApp.setMode(sap.m.SplitAppMode.HideMode);
			// 	} else {
			// 		splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
			// 	}
			// },
			// Global variables for Header fields to manage save status

			clearScreen: function(oEvent) {
				var that = this;
				this.setStatus('green');
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
				this.getView().getModel('local').setProperty('/orderHeaderTemp', oHeaderT);
				// oHeader.Date=new Date();
				this.getView().getModel('local').setProperty('/WSorderHeader', oHeader);
				// this.getView().getModel("local").setProperty("/WSorderHeader/Date", formatter.getFormattedDate(0));
				this.getView().byId("WSHeaderFragment--DateId").setDateValue(new Date());
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/CustomCalculations", "GET", {}, {}, this)
					.then(function(oData) {
						debugger;
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
				debugger;
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
								debugger;
								var saveStatus = that.onSave(oEvent);
								if (saveStatus) {
									that.clearScreen(oEvent);
									MessageToast.show("Data has been Saved! Screen cleared successfully!");
								}

							}
						}
					});
				} else if (saveStatus == "green") {
					MessageBox.error("Are you sure you want to clear all entries?", {
						title: "Alert!",
						actions: ["Clear", MessageBox.Action.CANCEL],
						onClose: function(oAction) {
							if (oAction === "Clear") {
								that.clearScreen(oEvent);
								that.setStatus('green');
								MessageToast.show("Screen cleared successfully!");
							}
						}
					});
				}
			},
			onDelete: function(oEvent) {
				debugger;
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
							debugger;
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
										debugger;
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
				that.getView().setBusy(true);
				// get the data from screen in local model
				debugger;
				var orderData = this.getView().getModel('local').getProperty("/WSOrderHeader");
				if (orderData.Customer === "") {
					this.getView().byId("WSHeaderFragment--customerId").setValueState("Error").setValueStateText("Please choose Customer before creating Order");
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
						debugger;
						var oReturnOrderClone = JSON.parse(JSON.stringify(returnTable));
						//return data save
						that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
								"/WSOrderReturns", "POST", {}, oReturnOrderClone, this)
							.then(function(oData) {
								debugger;
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
					} //type check
				} //forloop
				return oCommit;
			},
			getIndianCurr: function(value) {
				debugger;
				if (value) {
					var x = value;
					x = x.toString();
					var lastThree = x.substring(x.length - 3);
					var otherNumbers = x.substring(0, x.length - 3);
					if (otherNumbers != '')
						lastThree = ',' + lastThree;
					var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
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
							debugger;
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
					//order header put
					var oId = that.getView().getModel('local').getProperty('/OrderId').OrderId;

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
							oOrderDetail.SubTotal = data.SubTot;
							var oOrderDetailsClone = JSON.parse(JSON.stringify(oOrderDetail));
							//Item data save
							that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
									"/WSOrderItems", "POST", {}, oOrderDetailsClone, this)
								.then(function(oData) {
									debugger;
									//loop the detaisl
									var allItems = that.getView().getModel("orderItems").getProperty("/itemData");
									that.getView().setBusy(false);
									for (var i = 0; i < allItems.length; i++) {
										if (allItems[i].Material === oData.Material) {
											allItems[i].itemNo = oData.id;
											allItems[i].OrderNo = oId;
											if (oCommit === false) {
												that.onReturnSave(oEvent, oId, oCommit);
											}
											that.setStatus('green');
											break;
										} //material compare if condition
									} //for loop
									that.getView().getModel("orderItems").setProperty("/itemData", allItems);
								})
								.catch(function(oError) {
									that.getView().setBusy(false);
									var oPopover = that.getErrorMessage(oError);
								});

						}
					}
				} else {
					sap.m.MessageBox.error("No change in data records", {
						title: "Error",
						onClose: function(sButton) {}
					});
				}
			},
			toggleFullScreen: function() {
				debugger;
				var btnId = "WSItemFragment--idFullScreenBtn";
				var headerId = "WSHeaderFragment--WSOrderHeader";
				this.toggleUiTable(btnId, headerId)
			},
			onExit: function() {
				debugger;
				if (this.searchPopup) {
					this.searchPopup.destroy();
				}
			}
		});

	});
