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
				this.WSCalculation(oEvent);
			},
			WSCalculation: function(oEvent) {
				debugger;

				var category = this.getView().byId("WSItemFragment--orderItemBases").getModel("orderItems").getProperty(oEvent.getSource().getParent().getBindingContext("orderItems").getPath());
				var oCurrentRow = oEvent.getSource().getParent();
				var cells = oCurrentRow.getCells();
				var fieldId = oEvent.getSource().getId().split('---')[1].split('--')[1].split('-')[0];
				var newValue = oEvent.getParameters().newValue;
				// Initializing the variables so we dont want to display NaN
				var X = 0;
				var Y = 0;
				var Z = 0;
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
							// category.SubTotalS = weightF * tunch / 100;
						} else if (category.Type === "Gold") {
							// cells[11].setText(weightF * tunch / 100);
							cells[cells.length - 2].setText(weightF * tunch / 100);
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
							  cells[cells.length - 1].setText(makingCharges + stonevalue);
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
						var weight = 0;
					} else
					if (category.WeightD === 0) {
						var weight = 0;
					} else {
						var weight = oFloatFormat.parse(category.WeightD);
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
					if (category.Qty === ""){
				    category.Qty = 0;
				    var quantity = 0;
				  }else if (category.Qty === 0 || category.Qty === "0") {
				    category.Qty = 0;
				    var quantity = 0;
				  }else {
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
					if (category.QtyD === ""){
				    category.QtyD = 0;
				    var quantityD = 0;
				    var quantityOfStone = 0;
				  }else if (category.QtyD === 0 || category.QtyD === "0") {
				    var quantityD = 0;
				    var quantityOfStone = 0;
				  }else {
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
						cells[cells.length - 2].setText(0)
					} else {
						if (category.Type === "Silver") {
							// cells[10].setText(weightF * tunch / 100);
							cells[cells.length - 3].setText(weightF * tunch / 100);
							// category.SubTotalS = weightF * tunch / 100;
						} else if (category.Type === "Gold") {
							// cells[11].setText(weightF * tunch / 100);
							cells[cells.length - 2].setText(weightF * tunch / 100);
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
							  cells[cells.length - 1].setText(makingCharges + stonevalue);
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
				    }}
				  if (category.Qty === ""){
				    category.Qty = 0;
				    var quantity = 0;
				  }else if (category.Qty === 0 || category.Qty === "0") {
				    category.Qty = 0;
				    var quantity = 0;
				  }else {
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
				    }else if (category.Making ===0) {
				    category.Making = 0;
				    var making = 0;
				    }else {
				      var making = oFloatFormat.parse(category.Making);
				    }
				//charges of german silver
				var charges = quantity * making ;

				//QuantityD
				if (fieldId === "IdQtyD") {
				  if (category.QtyD !== newValue) {
				    category.QtyD = newValue;
				  }
				}
				  if (category.QtyD === ""){
				    category.QtyD = 0;
				    var quantityD = 0;
				    var quantityOfStone = 0;
				  }else if (category.QtyD === 0 || category.QtyD === "0") {
				    var quantityD = 0;
				    var quantityOfStone = 0;
				  }else {
				    var quantityD = oFloatFormat.parse(category.QtyD);
				    var quantityOfStone = quantityD;
				  }

				// makingD charges
				if (fieldId === "IdMakingD") {
				  if (category.MakingD !== newValue) {
				    category.MakingD = newValue;
				  }
				}
				if (category.MakingD === "" ){
				   category.MakingD=0;
				  var makingD = 0;
				  }else if (category.MakingD === 0) {
				    category.MakingD=0;
				    var makingD = 0;
				  }else {
				    var makingD = oFloatFormat.parse(category.MakingD);
				  }
				var chargesD = quantityD * makingD;
				//final charges on GS
				if (charges) {
				cells[cells.length - 1].setText( charges + chargesD);
				}else {
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
			onClear: function(oEvent) {
				debugger;
				var that = this;
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

					});
				//Clear Item table
				this.orderItem(oEvent);
				this.orderReturn(oEvent);

			},
			onDelete: function(oEvent) {
				debugger;
				var that = this;
				MessageBox.error("Are you sure you want to delete the selected entries", {
					title: "Alert",
					actions: ["Delete selected entries", sap.m.MessageBox.Action.CLOSE],
					onClose: function(sButton) {
						debugger;
						if (sButton === "Delete selected entries") {
							var selIdxs = that.getView().byId("WSItemFragment--orderItemBases").getSelectedIndices();
							if (selIdxs.length) {
								for (var i = 0; i < selIdxs.length; i++) {
									var id = that.getView().getModel("orderItems").getProperty("/itemData")[i].itemNo;
									// If row contains id(which means it has been saved in DB)
									if (id) {
										var myUrl = "/WSOrderItems('" + id + "')"
										that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,
											"DELETE", {}, {}, that);
										var oTableData = that.getView().getModel("orderItems").getProperty("/itemData");
										oTableData.splice(i, 1);
										that.getView().getModel("orderItems").setProperty("/itemData", oTableData);
										that.getView().byId("WSItemFragment--orderItemBases").clearSelection();
										// If its there only in the local model
									} else {
										oTableData.splice(i, 1);
										that.getView().getModel("orderItems").setProperty("/itemData", oTableData);
										that.getView().byId("WSItemFragment--orderItemBases").clearSelection();
									};
								}
								sap.m.MessageToast.show("Selected lines are deleted");
							}
						}
					}
				});
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
									debugger;
									that.getView().setBusy(false);
									sap.m.MessageToast.show("Data Saved Successfully");
									var id = oData.id;
									var orderNo = oData.OrderNo;
									var allItems = that.getView().getModel("orderItems").getProperty("/itemData");
									for (var i = 0; i < allItems.length; i++) {
										if (allItems[i].Material == oData.Material) {
											allItems[i].itemNo = id;
											break;
										}
									}
									that.getView().getModel("orderItems").setProperty("/itemData", allItems);
								})
								.catch(function(oError) {
									that.getView().setBusy(false);
									var oPopover = that.getErrorMessage(oError);
								});
						}
					}
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
