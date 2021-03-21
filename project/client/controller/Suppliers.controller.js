/*global location*/
sap.ui.define([
	"victoria/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"victoria/models/formatter",
], function(
	BaseController,
	JSONModel,
	History,
	formatter,
) {
	"use strict";

	return BaseController.extend("victoria.controller.Suppliers", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});
			var oViewModel1 = new JSONModel({
				"items": [{
					"text": "Silver"
				}, {
					"text": "Gold"
				}]
			});
			this.setModel(oViewModel1, "fixed");
			debugger;
			BaseController.prototype.onInit.apply(this);
			var that = this;
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			loginUser = "Hey " + loginUser;
			this.getView().byId("idUser").setText(loginUser);
			var oRouter = this.getRouter();
			oRouter.getRoute("Suppliers").attachMatched(this._onRouteMatched, this);
			//				this.getRouter().getRoute("Products").attachPatternMatched(this._onObjectMatched, this);
			//
			//				// Store original busy indicator delay, so it can be restored later on
			//				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			//				this.setModel(oViewModel, "objectView");
			//				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
			//						// Restore original busy indicator delay for the object view
			//						oViewModel.setProperty("/delay", iOriginalBusyDelay);
			//					}
			//				);
		},
		valueHelpCustomer: function(oEvent) {
			this.getCustomerPopup(oEvent);
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
				// this.setStatus('red');
				var oId = oEvent.getParameter('selectedItem').getId();
				var oCustDetail = this.getView().getModel('local').getProperty('/BookingCustomer');
				var oSource = oId.split("-" [0])
				var selectedCustomer = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContextPath());
				// this.setCustomerIdAndCustomerName(selectedCustomer);
				this.getView().getModel("local").setProperty("/selectedCustomer", selectedCustomer);
				var selCust = oEvent.getParameter("selectedItem").getLabel();
				var selCustName = oEvent.getParameter("selectedItem").getValue();
				// oCustDetail.customerId = selCust;
				// oCustDetail.CustomerName = selCustName;
				this.getView().getModel("local").setProperty("/BookingDetail/Customer",
					oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
				this.getView().getModel("local").setProperty("/BookingCustomer/CustomerId",
					selCust);
				this.getView().getModel("local").setProperty("/BookingCustomer/CustomerName",
					selCustName);
				// this.getView().byId("idCustomerCode-SuggDescr").setText(selCustName);
				// Removing error notif. if value is entered
				this.getView().byId("idCustomerCode").setValueState("None");
			}
		},
		_onRouteMatched: function() {
			var that = this;
			that.getView().getModel("local").setProperty("/BookingDetail/BookingDate", new Date());
			this.getView().byId("DateId").setDateValue(new Date());

			var myData = this.getView().getModel("local").getProperty("/BookingDetail");
			if (this.getView().byId("idRb1").getSelected()) {
				myData.Type = "Silver";
			} else {
				myData.Type = "Gold";
			}
			var oFilter2 = new sap.ui.model.Filter("Type", "EQ", myData.Type);

			this.getView().byId("idTable").getBinding("items").filter(oFilter2);
			this.getView().byId("idBookingDlvTable").getBinding("items").filter(oFilter2);

		},
		onRadioButtonSelect: function(oEvent) {
			debugger;
			//var custid = this.getView().byId("idCustomerCode");
			//custid.setSelectedKey("");
			//custid.setValue("");
			//this.getView().byId("idCustName").setText("");
			this.getView().byId("idQnty").setValue("");
			this.getView().byId("idBhav").setValue("");
			this.getView().byId("idAdvance").setValue("");
			this.getView().byId("idBTQ").setText("");
			this.getView().byId("idBAP").setText("");
			this.getView().byId("idDTQ").setText("");
			this.getView().byId("idDAP").setText("");

			var myData = this.getView().getModel("local").getProperty("/BookingDetail");

			//	myData.Customer = this.getView().byId("idCustomerCode").getValue();
			if (this.getView().byId("idRb1").getSelected()) {
				myData.Type = "Silver";
			} else {
				myData.Type = "Gold";
			}
			if (myData.Customer === "") {

				//myData.Customer = this.getView().byId("idCustomerCode").getValue();
				var oFilter2 = new sap.ui.model.Filter("Type", "EQ", myData.Type);

				this.getView().byId("idTable").getBinding("items").filter(oFilter2);
				this.getView().byId("idBookingDlvTable").getBinding("items").filter(oFilter2);

			} else {
				//myData.Customer = myData.Customer.split("'");
				//myData.Customer = "'5de918a830313c26f47982ff'";
				//	var oFilter1 = new sap.ui.model.Filter("Customer","EQ", myData.Customer);
				var oFilter1 = new sap.ui.model.Filter("Customer", "EQ", "'" + myData.Customer.split("'") + "'");
				var oFilter2 = new sap.ui.model.Filter("Type", "EQ", myData.Type);

				var oFilter = new sap.ui.model.Filter({
					filters: [oFilter1, oFilter2],
					and: true
				});
				this.getView().byId("idTable").getBinding("items").filter([oFilter]);
				this.getView().byId("idBookingDlvTable").getBinding("items").filter([oFilter]);
				//Calculations
				var that = this;
				//Booked item
				$.post("/getTotalBookingCustomer", {
					myData
				}).then(function(result) {
					console.log(result);
					debugger;
					if (myData.Type = "Silver") {
						that.byId("idBTQ").setText(parseFloat(result.BookedQtyTotal.toFixed(3)));
					} else {
						that.byId("idBTQ").setText(parseFloat(result.BookedQtyTotal.toFixed(2)));
					}
					that.byId("idBTQ").getText();
					parseFloat(that.byId("idBTQ").getText());
					if (parseFloat(that.byId("idBTQ").getText()) > 0) {
						that.byId("idBTQ").setState('Success');
						debugger;
					} else {
						that.byId("idBTQ").setState('Warning');
					}

					that.byId("idBAP").setText(parseFloat(result.BookedAvgPriceTotal.toFixed(0)));
					// that.byId("idBAP").setText(parseFloat(result.BookedAvgPriceTotal));
					that.byId("idBAP").getText();
					parseFloat(that.byId("idBAP").getText());
					if (parseFloat(that.byId("idBAP").getText()) > 0) {
						that.byId("idBAP").setState('Success');
						debugger;
					} else {
						that.byId("idBAP").setState('Warning');
					}
				});
				//Delivered item
				var that2 = that;
				$.post("/getTotalDeliveredCustomer", {
					myData
				}).then(function(result) {
					console.log(result);
					debugger;
					if (myData.Type = "Silver") {
						that2.byId("idDTQ").setText(parseFloat(result.DeliveredQtyTotal.toFixed(3)));
					} else {
						that2.byId("idDTQ").setText(parseFloat(result.DeliveredQtyTotal.toFixed(2)));
					}
					that2.byId("idDTQ").getText();
					//parseFloat(that.byId("idBTQ").getText());
					if (parseFloat(that.byId("idDTQ").getText()) > 0) {
						that2.byId("idDTQ").setState('Success');
						debugger;
					} else {
						that2.byId("idDTQ").setState('Warning');
					}

					that2.byId("idDAP").setText(parseFloat(result.DeliveredAvgPriceTotal.toFixed(0)));
					//that2.byId("idDAP").setText(parseFloat(result.DeliveredAvgPriceTotal));
					that2.byId("idDAP").getText();
					if (parseFloat(that.byId("idDAP").getText()) > 0) {
						that2.byId("idDAP").setState('Success');
						debugger;
					} else {
						that2.byId("idDAP").setState('Warning');
					}
				});

			}

		},
		customerCodeCheck: function(oEvent) {
			$(function() {
				$('input:text:first').focus();
				var $inp = $('input:text');
				$inp.bind('keydown', function(e) {
					//var key = (e.keyCode ? e.keyCode : e.charCode);
					var key = e.which;
					if (key == 13) {
						e.preventDefault();
						var nxtIdx = $inp.index(this) + 1;
						$(":input:text:eq(" + nxtIdx + ")").focus();
					}
				});
			});

			var selectedItem = oEvent.getParameter("selectedItem");
			if (!selectedItem) {
				return;
			}
			var selectedCustData = selectedItem.getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
			var cName = selectedCustData.Name.toUpperCase();
			this.getView().byId("idCustName").setText(cName);

			var myData = this.getView().getModel("local").getProperty("/BookingDetail");
			myData.Customer = oEvent.getParameter("selectedItem").getBindingContext().sPath.split("'")[1];
			if (this.getView().byId("idRb1").getSelected()) {
				myData.Type = "Silver";
			} else {
				myData.Type = "Gold";
			}
			var oFilter1 = new sap.ui.model.Filter("Customer", "EQ", "'" + myData.Customer + "'");
			var oFilter2 = new sap.ui.model.Filter("Type", "EQ", myData.Type);

			var oFilter = new sap.ui.model.Filter({
				filters: [oFilter1, oFilter2],
				and: true
			});
			this.getView().byId("idTable").getBinding("items").filter([oFilter]);
			this.getView().byId("idBookingDlvTable").getBinding("items").filter([oFilter]);

			debugger;
			jQuery.sap.delayedCall(500, this, function() {
				this.getView().byId("idQnty").focus();
			});
			var that = this;
			//Booked item
			$.post("/getTotalBookingCustomer", {
				myData
			}).then(function(result) {
				console.log(result);
				debugger;
				if (myData.Type = "Silver") {
					that.byId("idBTQ").setText(parseFloat(result.BookedQtyTotal.toFixed(3)));
				} else {
					that.byId("idBTQ").setText(parseFloat(result.BookedQtyTotal.toFixed(2)));
				}
				that.byId("idBTQ").getText();
				parseFloat(that.byId("idBTQ").getText());
				if (parseFloat(that.byId("idBTQ").getText()) > 0) {
					that.byId("idBTQ").setState('Success');
					debugger;
				} else {
					that.byId("idBTQ").setState('Warning');
				}

				that.byId("idBAP").setText(parseFloat(result.BookedAvgPriceTotal.toFixed(0)));
				// that.byId("idBAP").setText(parseFloat(result.BookedAvgPriceTotal));
				that.byId("idBAP").getText();
				parseFloat(that.byId("idBAP").getText());
				if (parseFloat(that.byId("idBAP").getText()) > 0) {
					that.byId("idBAP").setState('Success');
					debugger;
				} else {
					that.byId("idBAP").setState('Warning');
				}
			});
			//Delivered item
			var that2 = that;
			$.post("/getTotalDeliveredCustomer", {
				myData
			}).then(function(result) {
				console.log(result);
				debugger;
				if (myData.Type = "Silver") {
					that2.byId("idDTQ").setText(parseFloat(result.DeliveredQtyTotal.toFixed(3)));
				} else {
					that2.byId("idDTQ").setText(parseFloat(result.DeliveredQtyTotal.toFixed(2)));
				}
				that2.byId("idDTQ").getText();
				//parseFloat(that.byId("idBTQ").getText());
				if (parseFloat(that.byId("idDTQ").getText()) > 0) {
					that2.byId("idDTQ").setState('Success');
					debugger;
				} else {
					that2.byId("idDTQ").setState('Warning');
				}

				that.byId("idDAP").setText(parseFloat(result.DeliveredAvgPriceTotal.toFixed(0)));
				//that2.byId("idDAP").setText(parseFloat(result.DeliveredAvgPriceTotal));
				that2.byId("idDAP").getText();
				if (parseFloat(that.byId("idDAP").getText()) > 0) {
					that2.byId("idDAP").setState('Success');
					debugger;
				} else {
					that2.byId("idDAP").setState('Warning');
				}
			});

		},
		onValueHelpRequest: function(oEvent) {
			this.getCustomerPopup(oEvent);
		},
		onClear: function() {
			debugger;
			var custid = this.getView().byId("idCustomerCode");
			custid.setSelectedKey("");
			custid.setValue("");
			this.getView().byId("idCustName").setText("");
			this.getView().byId("idQnty").setValue("");
			this.getView().byId("idBhav").setValue("");
			this.getView().byId("idAdvance").setValue("");
			// this.getView().byId("idRb1").setSelected(true);
			this.getView().byId("idBTQ").setText("");
			this.getView().byId("idBAP").setText("");
			this.getView().byId("idDTQ").setText("");
			this.getView().byId("idDAP").setText("");

			this.getView().byId("DateId").setDateValue(new Date());

			//var oFilter = new sap.ui.model.Filter("Customer","NE", "null");
			//this.getView().byId("idTable").getBinding("items").filter(oFilter);
			//this.getView().byId("idBookingDlvTable").getBinding("items").filter(oFilter);

			var oFilter = new sap.ui.model.Filter("Type", "EQ", "Silver");
			this.getView().byId("idTable").getBinding("items").filter(oFilter);
			this.getView().byId("idBookingDlvTable").getBinding("items").filter(oFilter);

		},
		_getDialog: function(oEvent) {

			if (!this.oEditDialog) {
				this.oEditDialog = sap.ui.xmlfragment("BookingDialog", "victoria.fragments.BookingDialog", this);
				this.getView().addDependent(this.oEditDialog);
			}
			this.oEditDialog.open();
			if (oEvent === "idTitle") {
				var tabName = "idTable";
				sap.ui.getCore().byId("BookingDialog--save1").setVisible(true);
				sap.ui.getCore().byId("BookingDialog--save2").setVisible(false);
			} else {
				var tabName = "idBookingDlvTable";
				sap.ui.getCore().byId("BookingDialog--save1").setVisible(false);
				sap.ui.getCore().byId("BookingDialog--save2").setVisible(true);
			}
			debugger;
			var title = this.getView().byId(tabName).getSelectedItem().mAggregations.cells[1].mProperties.text;
			sap.ui.getCore().byId("BookingDialog--idDialog-title").setText(title);
			var cell0 = this.getView().byId(tabName).getSelectedItem().mAggregations.cells[0].mProperties.text;
			sap.ui.getCore().byId("BookingDialog--idDialogDate").setValue(cell0);
			var cell2 = this.getView().byId(tabName).getSelectedItem().mAggregations.cells[1].mProperties.text;
			sap.ui.getCore().byId("BookingDialog--idDialogCust").setValue(cell2);
			var cell3 = this.getView().byId(tabName).getSelectedItem().mAggregations.cells[2].mProperties.text;
			sap.ui.getCore().byId("BookingDialog--idDialogQnty").setValue(cell3);
			var cell4 = this.getView().byId(tabName).getSelectedItem().mAggregations.cells[3].mProperties.text;
			sap.ui.getCore().byId("BookingDialog--idDialogBhav").setValue(cell4);
			var cell5 = this.getView().byId(tabName).getSelectedItem().mAggregations.cells[4].mProperties.text;
			sap.ui.getCore().byId("BookingDialog--idDialogAdv").setValue(cell5);
			//	var cell6 = this.getView().byId(tabName).getSelectedItem().mAggregations.cells[5].mProperties.text;
			//sap.ui.getCore().byId("BookingDialog--idDialogTyp").setSelectedKey(cell6);
		},
		//  _getDialogDlv: function (oEvent) {
		// 		 if(!this.oEditDlvDialog){
		// 			this.oEditDlvDialog= sap.ui.xmlfragment("BookingDialog","victoria.fragments.BookingDialog",this);
		// 			this.getView().addDependent(this.oEditDlvDialog);
		// 		}
		// 		this.oEditDlvDialog.open();
		// 		debugger;
		// 		var title = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[1].mProperties.text;
		// 		sap.ui.getCore().byId("BookingDialog--idDialog-title").setText(title);
		// 		var cell0 = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[0].mProperties.text;
		// 		sap.ui.getCore().byId("BookingDialog--idDialogDate").setValue(cell0);
		// 		var cell2 = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[1].mProperties.text;
		// 	 sap.ui.getCore().byId("BookingDialog--idDialogCust").setValue(cell2);
		// 		var cell3 = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[2].mProperties.text;
		// 		 sap.ui.getCore().byId("BookingDialog--idDialogQnty").setValue(cell3);
		// 		var cell4 = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[3].mProperties.text;
		// 		 sap.ui.getCore().byId("BookingDialog--idDialogBhav").setValue(cell4);
		// 		var cell5 = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[4].mProperties.text;
		// 		 sap.ui.getCore().byId("BookingDialog--idDialogAdv").setValue(cell5);
		//
		// },
		_getDialogMove: function(oEvent) {
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment("BookingDialogMove", "victoria.fragments.BookingDialogMove", this);
				this.getView().addDependent(this.oDialog);
			}

			debugger;

			var aSelectedItems = this.getOwnerComponent().byId("idSuppliers").byId("idTable").getSelectedItems();
			var oSelectedItem = aSelectedItems[0];
			if (!oSelectedItem) {
				sap.m.MessageToast.show(that.resourceBundle.getText("Please11"));
				that.getView().setBusy(false);
				return;
			}
			this.oDialog.open();
			sap.ui.getCore().byId("BookingDialogMove--cnf").setVisible(true);
			sap.ui.getCore().byId("BookingDialogMove--ret").setVisible(false);
			// var title = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[1].mProperties.text;
			// sap.ui.getCore().byId("BookingDialog--idDialog-title").setText("Confirm Delivery Quantity");
			var cell0 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[0].mProperties.text;
			sap.ui.getCore().byId("BookingDialogMove--idDialogDate").setValue(cell0).setVisible(false);
			var cell2 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[1].mProperties.text;
			sap.ui.getCore().byId("BookingDialogMove--idDialogCust").setValue(cell2).setVisible(false);
			var cell3 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[2].mProperties.text;
			sap.ui.getCore().byId("BookingDialogMove--idDialogQnty").setValue(cell3);
			var cell4 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[3].mProperties.text;
			sap.ui.getCore().byId("BookingDialogMove--idDialogBhav").setValue(cell4).setVisible(false);
			var cell5 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[4].mProperties.text;
			sap.ui.getCore().byId("BookingDialogMove--idDialogAdv").setValue(cell5).setVisible(false);
			var cell6 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[5].mProperties.text;
			sap.ui.getCore().byId("BookingDialogMove--idDialogTyp").setValue(cell6).setVisible(false);

		},
		_getDialogLeftMove: function(oEvent) {
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment("BookingDialogMove", "victoria.fragments.BookingDialogMove", this);
				this.getView().addDependent(this.oDialog);
			}
			var aSelectedItems = this.getOwnerComponent().byId("idSuppliers").byId("idBookingDlvTable").getSelectedItems();
			var oSelectedItem = aSelectedItems[0];
			if (!oSelectedItem) {
				sap.m.MessageToast.show(that.resourceBundle.getText("Please11"));
				that.getView().setBusy(false);
				return;
			}

			this.oDialog.open();
			debugger;
			sap.ui.getCore().byId("BookingDialogMove--cnf").setVisible(false);
			sap.ui.getCore().byId("BookingDialogMove--ret").setVisible(true);
			// var title = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[1].mProperties.text;
			// sap.ui.getCore().byId("BookingDialog--idDialog-title").setText("Confirm Delivery Quantity");
			var cell0 = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[0].mProperties.text;
			sap.ui.getCore().byId("BookingDialogMove--idDialogDate").setValue(cell0).setVisible(false);
			var cell2 = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[1].mProperties.text;
			sap.ui.getCore().byId("BookingDialogMove--idDialogCust").setValue(cell2).setVisible(false);
			var cell3 = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[2].mProperties.text;
			sap.ui.getCore().byId("BookingDialogMove--idDialogQnty").setValue(cell3);
			var cell4 = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[3].mProperties.text;
			sap.ui.getCore().byId("BookingDialogMove--idDialogBhav").setValue(cell4).setVisible(false);
			var cell5 = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[4].mProperties.text;
			sap.ui.getCore().byId("BookingDialogMove--idDialogAdv").setValue(cell5).setVisible(false);
			var cell6 = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[5].mProperties.text;
			sap.ui.getCore().byId("BookingDialogMove--idDialogTyp").setValue(cell6).setVisible(false);

		},
		onPressHandleDlvConfirmPopup: function(oEvent) {
			debugger;
			var that = this;
			that.getView().setBusy(true);
			// var myData = this.getView().getModel("local").getProperty("/BookingDetail");
			var id = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[1].mBindingInfos.text.binding.oContext.sPath.split(
				"'")[1]; //myData.Customer;
			var qnty = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[2].mProperties.text;
			var dlvQnty = sap.ui.getCore().byId("BookingDialogMove--idDialogQnty").getValue();

			// if (qnty === dlvQnty){
			//
			// 		var oSelected = this.getView().byId("idTable").getSelectedItem();
			// 		var myData1 = this.getView().getModel("local").getProperty("/BookingDlvDetail");
			// 		myData1.BookingDate = oSelected.getBindingContext().getObject().BookingDate;
			// 		myData1.Customer = oSelected.getBindingContext().getObject().Customer;
			// 		myData1.Quantity = oSelected.mAggregations.cells[2].mProperties.text;
			// 		myData1.Bhav = oSelected.mAggregations.cells[3].mProperties.text;
			// 		myData1.Advance = oSelected.mAggregations.cells[4].mProperties.text;
			// 		myData1.Recid = oSelected.getBindingContext().getObject().id;
			// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDlvDetails",
			// 															"POST", {}, myData1, this)
			// 		.then(function(oData) {
			// 			that.getView().setBusy(false);
			// 			sap.m.MessageToast.show("Delivery Quantity Confirmed Successfully");
			//
			// 			var x = that.getView().byId("idTable").getSelectedItems();
			// 		 	if(x.length){
			// 			 for(var i=0; i<x.length; i++){
			// 				 debugger;
			// 				 var myUrl = x[i].getBindingContext().sPath;
			// 				 that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,"DELETE",{},{},that);
			// 			 }
			// 		 }
			// 		 that.oDialog.close();
			// 		}).catch(function(oError) {
			// 			that.getView().setBusy(false);
			// 			var oPopover = that.getErrorMessage(oError);
			// 		});
			//
			// }else{
			debugger;
			if (parseInt(dlvQnty) > parseInt(qnty)) {
				sap.m.MessageToast.show(that.resourceBundle.getText("Delivery11"));
			} else {
				var oSelected = this.getView().byId("idTable").getSelectedItem();

				var recId = "'" + oSelected.getBindingContext().getObject().id + "'";
				var oFilter = new sap.ui.model.Filter("Recid", "EQ", recId);
				// filters: [oFilter]
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDlvDetails",
						"GET", {
							filters: [oFilter]
						}, {}, this)
					.then(function(oData) {
						debugger;
						if (oData.results.length > 0) {
							that.insertDlvDetails(oSelected, dlvQnty, qnty, oData);
						} else {

							var recId = oSelected.getBindingContext().getObject().Recid;
							var oFilter = new sap.ui.model.Filter("Recid", "EQ", recId);
							// filters: [oFilter]
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/BookingDlvDetails",
									"GET", {
										filters: [oFilter]
									}, {}, that)
								.then(function(oData) {
									debugger;
									if (oData.results.length > 0) {
										that.insertDlvDetails(oSelected, dlvQnty, qnty, oData);
									} else {
										that.appendDlvDetails(oSelected, dlvQnty, qnty);
									}
								}).catch(function(oError) {
									that.getView().setBusy(false);
									var oPopover = that.getErrorMessage(oError);
								});

						}
					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
					});
			}
			// }
		},

		insertDlvDetails: function(oSelected, dlvQnty, qnty, oData) {
			var that = this;
			var myData1 = this.getView().getModel("local").getProperty("/BookingDlvDetail");

			myData1.BookingDate = oSelected.getBindingContext().getObject().BookingDate;
			myData1.Customer = oSelected.getBindingContext().getObject().Customer;
			myData1.Quantity = parseInt(oData.results[0].Quantity) + parseInt(dlvQnty);
			myData1.Bhav = oSelected.mAggregations.cells[3].mProperties.text;
			myData1.Advance = oSelected.mAggregations.cells[4].mProperties.text;
			myData1.Type = oSelected.mAggregations.cells[5].mProperties.text;
			if (oSelected.getBindingContext().getObject().Recid != "null") {
				myData1.Recid = oSelected.getBindingContext().getObject().Recid;
			} else {
				myData1.Recid = "'" + oSelected.getBindingContext().getObject().id + "'";
			}
			var oId = oData.results[0].id;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDlvDetails('" + oId + "')",
					"PUT", {}, myData1, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show(that.resourceBundle.getText("Delivery12"));

					var myData2 = that.getView().getModel("local").getProperty("/BookingDetail");
					// var id = that.getView().byId("idTable").getSelectedItem().mAggregations.cells[1].mBindingInfos.text.binding.oContext.sPath.split("'")[1]; //myData.Customer;
					var id = oSelected.getBindingContext().getObject().id;
					var balQnty = parseInt(qnty) - parseInt(dlvQnty);
					if (balQnty > 0) {
						myData2.BookingDate = oSelected.getBindingContext().getObject().BookingDate;
						myData2.Quantity = parseInt(qnty) - parseInt(dlvQnty);
						myData2.Bhav = oSelected.mAggregations.cells[3].mProperties.text;
						myData2.Advance = oSelected.mAggregations.cells[4].mProperties.text;
						myData1.Type = oSelected.mAggregations.cells[5].mProperties.text;
						// myData.Customer = sap.ui.getCore().byId("BookingDialog--idDialogCust").getValue();
						myData2.Customer = oSelected.getBindingContext().getObject().Customer;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/BookingDetails('" + id + "')",
								"PUT", {}, myData2, that)
							.then(function(oData) {
								that.onClear();
								// that.getView().setBusy(false);
								// sap.m.MessageToast.show("Data updated Successfully");

							}).catch(function(oError) {
								that.getView().setBusy(false);
								var oPopover = that.getErrorMessage(oError);
							});
					} else {
						var x = oSelected;
						// that.getView().byId("idTable").getSelectedItems();
						debugger;
						var myUrl = x.getBindingContext().sPath;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl, "DELETE", {}, {}, that);

					}

					that.oDialog.close();
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},

		appendDlvDetails: function(oSelected, dlvQnty, qnty) {
			var that = this;
			var myData1 = this.getView().getModel("local").getProperty("/BookingDlvDetail");
			myData1.BookingDate = oSelected.getBindingContext().getObject().BookingDate;
			myData1.Customer = oSelected.getBindingContext().getObject().Customer;
			myData1.Quantity = dlvQnty;
			myData1.Bhav = oSelected.mAggregations.cells[3].mProperties.text;
			myData1.Advance = oSelected.mAggregations.cells[4].mProperties.text;
			myData1.Type = oSelected.mAggregations.cells[5].mProperties.text;
			if (oSelected.getBindingContext().getObject().Recid != "null") {
				myData1.Recid = oSelected.getBindingContext().getObject().Recid;
			} else {
				myData1.Recid = "'" + oSelected.getBindingContext().getObject().id + "'";
			}

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDlvDetails",
					"POST", {}, myData1, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show(that.resourceBundle.getText("Delivery12"));

					var myData2 = that.getView().getModel("local").getProperty("/BookingDetail");
					// var id = that.getView().byId("idTable").getSelectedItem().mAggregations.cells[1].mBindingInfos.text.binding.oContext.sPath.split("'")[1]; //myData.Customer;
					var id = oSelected.getBindingContext().getObject().id;
					var balQnty = parseInt(qnty) - parseInt(dlvQnty);
					if (balQnty > 0) {
						myData2.BookingDate = oSelected.getBindingContext().getObject().BookingDate;
						myData2.Quantity = parseInt(qnty) - parseInt(dlvQnty);
						myData2.Bhav = oSelected.mAggregations.cells[3].mProperties.text;
						myData2.Advance = oSelected.mAggregations.cells[4].mProperties.text;
						myData2.Type = oSelected.mAggregations.cells[5].mProperties.text;
						myData2.Recid = oSelected.getBindingContext().getObject().Recid;
						// myData.Customer = sap.ui.getCore().byId("BookingDialog--idDialogCust").getValue();
						myData2.Customer = oSelected.getBindingContext().getObject().Customer;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/BookingDetails('" + id + "')",
								"PUT", {}, myData2, that)
							.then(function(oData) {
								that.onClear();
								// that.getView().setBusy(false);
								// sap.m.MessageToast.show("Data updated Successfully");

							}).catch(function(oError) {
								that.getView().setBusy(false);
								var oPopover = that.getErrorMessage(oError);
							});
					} else {
						var x = oSelected;
						// that.getView().byId("idTable").getSelectedItems();
						debugger;
						var myUrl = x.getBindingContext().sPath;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl, "DELETE", {}, {}, that);
					}

					that.oDialog.close();
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},
		onPressHandleDlvReturnPopup: function(oEvent) {
			debugger;
			var that = this;
			that.getView().setBusy(true);
			// var myData = this.getView().getModel("local").getProperty("/BookingDlvDetail");

			var id = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[1].mBindingInfos.text.binding.oContext.sPath
				.split("'")[1]; //myData.Customer;
			var qnty = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[2].mProperties.text;
			var dlvQnty = sap.ui.getCore().byId("BookingDialogMove--idDialogQnty").getValue();

			// if (qnty === dlvQnty){
			//
			// 		var oSelected = this.getView().byId("idBookingDlvTable").getSelectedItem();
			// 		var myData1 = this.getView().getModel("local").getProperty("/BookingDetail");
			// 		myData1.BookingDate = oSelected.getBindingContext().getObject().BookingDate;
			// 		myData1.Customer = oSelected.getBindingContext().getObject().Customer;
			// 		myData1.Quantity = oSelected.mAggregations.cells[2].mProperties.text;
			// 		myData1.Bhav = oSelected.mAggregations.cells[3].mProperties.text;
			// 		myData1.Advance = oSelected.mAggregations.cells[4].mProperties.text;
			// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDetails",
			// 															"POST", {}, myData1, this)
			// 		.then(function(oData) {
			// 			that.getView().setBusy(false);
			// 			sap.m.MessageToast.show("Delivery Quantity Return Successfully");
			//
			// 			var x = that.getView().byId("idBookingDlvTable").getSelectedItems();
			// 		 	if(x.length){
			// 			 for(var i=0; i<x.length; i++){
			// 				 debugger;
			// 				 var myUrl = x[i].getBindingContext().sPath;
			// 				 that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,"DELETE",{},{},that);
			// 			 }
			// 		 }
			// 		 that.oDialog.close();
			// 		}).catch(function(oError) {
			// 			that.getView().setBusy(false);
			// 			var oPopover = that.getErrorMessage(oError);
			// 		});
			//
			// }else{
			debugger;
			if (parseInt(dlvQnty) > parseInt(qnty)) {
				sap.m.MessageToast.show(that.resourceBundle.getText("Delivery13"));
			} else {

				var oSelected = this.getView().byId("idBookingDlvTable").getSelectedItem();
				debugger;
				var recId = oSelected.getBindingContext().getObject().Recid;

				var oFilter = new sap.ui.model.Filter("id", "EQ", recId);
				// filters: [oFilter]
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDetails",
						"GET", {
							filters: [oFilter]
						}, {}, this)
					.then(function(oData) {
						debugger;
						if (oData.results.length > 0) {
							that.insertDetails(oSelected, dlvQnty, qnty, oData);
						} else {
							var oFilter = new sap.ui.model.Filter("Recid", "EQ", recId);
							// filters: [oFilter]
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/BookingDetails",
									"GET", {
										filters: [oFilter]
									}, {}, that)
								.then(function(oData) {
									debugger
									if (oData.results.length > 0) {
										that.insertDetails(oSelected, dlvQnty, qnty, oData);
									} else {
										that.appendDetails(oSelected, dlvQnty, qnty);
									}
								}).catch(function(oError) {
									that.getView().setBusy(false);
									var oPopover = that.getErrorMessage(oError);
								});
						}
					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
					});
			}
		},

		insertDetails: function(oSelected, dlvQnty, qnty, oData) {
			var that = this;
			var myData1 = this.getView().getModel("local").getProperty("/BookingDetail");

			myData1.BookingDate = oSelected.getBindingContext().getObject().BookingDate;
			myData1.Customer = oSelected.getBindingContext().getObject().Customer;
			myData1.Quantity = parseInt(oData.results[0].Quantity) + parseInt(dlvQnty);
			myData1.Bhav = oSelected.mAggregations.cells[3].mProperties.text;
			myData1.Advance = oSelected.mAggregations.cells[4].mProperties.text;
			myData1.Type = oSelected.mAggregations.cells[5].mProperties.text;
			myData1.Recid = oSelected.getBindingContext().getObject().Recid;
			var oId = oData.results[0].id;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDetails('" + oId + "')",
					"PUT", {}, myData1, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show(that.resourceBundle.getText("Delivery14"));

					var myData2 = that.getView().getModel("local").getProperty("/BookingDlvDetail");

					var id = that.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[1].mBindingInfos.text.binding.oContext.sPath
						.split("'")[1]; //myData.Customer;
					var balQnty = parseInt(qnty) - parseInt(dlvQnty);
					if (balQnty > 0) {
						myData2.BookingDate = oSelected.getBindingContext().getObject().BookingDate;
						myData2.Quantity = parseInt(qnty) - parseInt(dlvQnty);
						myData2.Bhav = oSelected.mAggregations.cells[3].mProperties.text;
						myData2.Advance = oSelected.mAggregations.cells[4].mProperties.text;
						myData2.Type = oSelected.mAggregations.cells[5].mProperties.text;
						// myData.Customer = sap.ui.getCore().byId("BookingDialog--idDialogCust").getValue();
						myData2.Customer = oSelected.getBindingContext().getObject().Customer;
						myData2.Recid = oSelected.getBindingContext().getObject().Recid;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/BookingDlvDetails('" + id + "')",
								"PUT", {}, myData2, that)
							.then(function(oData) {
								that.onClear();
								// that.getView().setBusy(false);
								// sap.m.MessageToast.show("Data updated Successfully");

							}).catch(function(oError) {
								that.getView().setBusy(false);
								var oPopover = that.getErrorMessage(oError);
							});
					} else {
						var x = oSelected;
						// that.getView().byId("idTable").getSelectedItems();
						debugger;
						var myUrl = x.getBindingContext().sPath;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl, "DELETE", {}, {}, that);
					}

					that.oDialog.close();
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});

		},
		appendDetails: function(oSelected, dlvQnty, qnty) {
			var that = this;
			var myData1 = this.getView().getModel("local").getProperty("/BookingDetail");

			myData1.BookingDate = oSelected.getBindingContext().getObject().BookingDate;
			myData1.Customer = oSelected.getBindingContext().getObject().Customer;
			myData1.Quantity = dlvQnty;
			myData1.Bhav = oSelected.mAggregations.cells[3].mProperties.text;
			myData1.Advance = oSelected.mAggregations.cells[4].mProperties.text;
			myData1.Type = oSelected.mAggregations.cells[5].mProperties.text;
			myData1.Recid = oSelected.getBindingContext().getObject().Recid;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDetails",
					"POST", {}, myData1, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show(that.resourceBundle.getText("Delivery14"));

					var myData2 = that.getView().getModel("local").getProperty("/BookingDlvDetail");

					var id = that.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[1].mBindingInfos.text.binding.oContext.sPath
						.split("'")[1]; //myData.Customer;
					var balQnty = parseInt(qnty) - parseInt(dlvQnty);
					if (balQnty > 0) {
						myData2.BookingDate = oSelected.getBindingContext().getObject().BookingDate;
						myData2.Quantity = parseInt(qnty) - parseInt(dlvQnty);
						myData2.Bhav = oSelected.mAggregations.cells[3].mProperties.text;
						myData2.Advance = oSelected.mAggregations.cells[4].mProperties.text;
						myData2.Type = oSelected.mAggregations.cells[5].mProperties.text;
						// myData.Customer = sap.ui.getCore().byId("BookingDialog--idDialogCust").getValue();
						myData2.Customer = oSelected.getBindingContext().getObject().Customer;
						myData2.Recid = oSelected.getBindingContext().getObject().Recid;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/BookingDlvDetails('" + id + "')",
								"PUT", {}, myData2, that)
							.then(function(oData) {
								that.onClear();
								// that.getView().setBusy(false);
								// sap.m.MessageToast.show("Data updated Successfully");

							}).catch(function(oError) {
								that.getView().setBusy(false);
								var oPopover = that.getErrorMessage(oError);
							});
					} else {
						var x = oSelected;
						// that.getView().byId("idTable").getSelectedItems();
						debugger;
						var myUrl = x.getBindingContext().sPath;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl, "DELETE", {}, {}, that);
					}

					that.oDialog.close();
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});

		},
		onPressHandleEntrySavePopup: function(oEvent) {
			debugger;
			var that = this;
			that.getView().setBusy(true);
			var myData = this.getView().getModel("local").getProperty("/BookingDetail");

			var id = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[1].mBindingInfos.text.binding.oContext.sPath.split(
				"'")[1]; //myData.Customer;

			myData.BookingDate = sap.ui.getCore().byId("BookingDialog--idDialogDate").getValue();
			myData.Quantity = sap.ui.getCore().byId("BookingDialog--idDialogQnty").getValue();
			myData.Bhav = sap.ui.getCore().byId("BookingDialog--idDialogBhav").getValue();
			myData.Advance = sap.ui.getCore().byId("BookingDialog--idDialogAdv").getValue();
			// myData.Type = sap.ui.getCore().byId("BookingDialog--idDialogTyp").getSelectedKey();
			// myData.Customer = sap.ui.getCore().byId("BookingDialog--idDialogCust").getValue();
			myData.Customer = this.getView().byId("idTable").getSelectedItems()[0].getBindingContext().getObject().Customer;

			myData.Recid = this.getView().byId("idTable").getSelectedItems()[0].getBindingContext().getObject().Recid;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDetails('" + id + "')",
					"PUT", {}, myData, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show(that.resourceBundle.getText("Update111"));
					that.oEditDialog.close();

				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},
		onPressHandleDlvEntrySavePopup: function(oEvent) {
			debugger;
			var that = this;
			that.getView().setBusy(true);
			var myData = this.getView().getModel("local").getProperty("/BookingDlvDetail");

			var id = this.getView().byId("idBookingDlvTable").getSelectedItem().mAggregations.cells[1].mBindingInfos.text.binding.oContext.sPath
				.split("'")[1]; //myData.Customer;

			myData.BookingDate = sap.ui.getCore().byId("BookingDialog--idDialogDate").getValue();
			myData.Quantity = sap.ui.getCore().byId("BookingDialog--idDialogQnty").getValue();
			myData.Bhav = sap.ui.getCore().byId("BookingDialog--idDialogBhav").getValue();
			myData.Advance = sap.ui.getCore().byId("BookingDialog--idDialogAdv").getValue();

			// myData.Customer = sap.ui.getCore().byId("BookingDialog--idDialogCust").getValue();
			myData.Customer = this.getView().byId("idBookingDlvTable").getSelectedItems()[0].getBindingContext().getObject().Customer;
			myData.Recid = this.getView().byId("idBookingDlvTable").getSelectedItems()[0].getBindingContext().getObject().Recid;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDlvDetails('" + id + "')",
					"PUT", {}, myData, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show(that.resourceBundle.getText("Update111"));
					that.oEditDialog.close();

				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},
		onPressHandleEntryCancelPopup: function() {
			this.oEditDialog.close();
		},
		onPressHandleCancelMovePopup: function() {
			this.oDialog.close();
		},

		onDelete: function() {
			var that = this;
			// debugger;
			sap.m.MessageBox.confirm(
				"Deleting Selected Records", {
					title: "Confirm",
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: "",
					onClose: function(sAction) {
						debugger;
						if (sAction === "OK") {
							debugger;
							var x = that.getView().byId("idTable").getSelectedItems();
							if (x.length) {
								for (var i = 0; i < x.length; i++) {
									debugger;
									var myUrl = x[i].getBindingContext().sPath;
									that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl, "DELETE", {}, {}, that);
								}

							}
							sap.m.MessageToast.show(that.resourceBundle.getText("SelectedData1"));
						}
					}
				}
			);
			// debugger;
		},

		onBookingDlvDelete: function(oEvent) {
			var that = this;
			// debugger;
			sap.m.MessageBox.confirm(
				that.resourceBundle.getText("DELETE11"), {
					title: "Confirm",
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: "",
					onClose: function(sAction) {
						debugger;
						if (sAction === "OK") {
							debugger;
							var x = that.getView().byId("idBookingDlvTable").getSelectedItems();
							if (x.length) {
								for (var i = 0; i < x.length; i++) {
									debugger;
									var myUrl = x[i].getBindingContext().sPath;
									that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl, "DELETE", {}, {}, that);
								}

							}
							sap.m.MessageToast.show(that.resourceBundle.getText("SelectedData1"));
						}
					}
				}
			);
			// debugger;
		},

		onNameChange: function(oEvent) {

			debugger;
			var cName = oEvent.getParameter("value");
			this.getView().byId("idCustName").setText(cName);

		},
		onSend: function() {
			debugger;

			var that = this;
			that.getView().setBusy(true);
			var myData = this.getView().getModel("local").getProperty("/BookingDetail");

			if (myData) {
				myData.id = "";
				myData.Recid = "null";
				myData.CreatedBy = "";
				myData.ChangedBy = "";
				myData.CreatedOn = "";
				myData.CreatedBy = "";
				delete myData.ToCustomers;
			}

			debugger;
			if (this.getView().byId("idRb1").getSelected()) {
				myData.Type = "Silver";
			} else if (this.getView().byId("idRb2").getSelected()) {
				myData.Type = "Gold";
			}
			myData.BookingDate = this.getView().byId("DateId").getDateValue();
			myData.Quantity = this.getView().byId("idQnty").getValue();
			myData.Bhav = this.getView().byId("idBhav").getValue();
			myData.Advance = this.getView().byId("idAdvance").getValue();

			if (myData.Customer === "" || myData.BookingDate === "" || myData.Quantity === "" ||
				myData.Bhav === "" || myData.Type === "") {
				sap.m.MessageToast.show(that.resourceBundle.getText("Fill11"));
				that.getView().setBusy(false);
			} else {
				if (myData.Type === "Silver" && (myData.Bhav < "25000" || myData.Bhav > "90000")) {
					sap.m.MessageToast.show(that.resourceBundle.getText("Fill12"));
					that.getView().setBusy(false);
				} else if (myData.Type === "Gold" && (myData.Bhav < "25000" || myData.Bhav > "70000")) {
					sap.m.MessageToast.show(that.resourceBundle.getText("Fill13"));
					that.getView().setBusy(false);
				} else {

					this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDetails",
							"POST", {}, myData, this)
						.then(function(oData) {
							that.getView().setBusy(false);
							sap.m.MessageToast.show(that.resourceBundle.getText("dataSave"));
							if (!that.getView().byId("idBCkBx").getSelected()) {
								that.onClear();
							} else {
								that.getView().byId("idQnty").setValue("");
								that.getView().byId("idBhav").setValue("");
								that.getView().byId("idAdvance").setValue("");
							}

						}).catch(function(oError) {
							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);
						});
				}
			}
		},
		onBookingReportDownload: function(){debugger;
			var test = this.getView().getModel("local").getProperty("/selectedCustomer");
      var reportType = "Booking_Summary";
      var custId = test.id;
      var custName = test.Name;
			window.open("/bookingDownload?type=Booking_Summary&id="+custId+"&name="+custName);
		},
		onUpdateFinished: function(oEvent) {
			debugger;
			var oTable = oEvent.getSource();
			var itemList = oTable.getItems();
			var noOfItems = itemList.length;
			var value1;
			var id;
			var cell;
			debugger;
			for (var i = 0; i < noOfItems; i++) {
				debugger;
				//Read the GUID from the Screen
				// var customerId = oTable.getItems()[i].getCells()[1].getText();
				var customerId = oTable.getItems()[i].getBindingContext().getObject().Customer;
				var customerData = this.allMasterData.customers[customerId];
				oTable.getItems()[i].getCells()[1].setText(customerData.CustomerCode + ' - ' + customerData.Name);
				//Find the customer data for that Guid in customer collection
				//Change the data on UI table with semantic information
			}
		},

		onEdit: function(oEvent) {
			debugger;
			var title = oEvent.getSource().getParent().getContent()[0].getId().split("--")[2];

			if (title === "idTitle") {
				var oNum = this.getView().byId("idTable").getSelectedItems().length;
				if (oNum > 1) {
					sap.m.MessageBox.alert(
						that.resourceBundle.getText("Selectoneentryonly"));
				} else {
					this._getDialog(title);
				}
			} else {
				var oNum = this.getView().byId("idBookingDlvTable").getSelectedItems().length;
				if (oNum > 1) {
					sap.m.MessageBox.alert(
						that.resourceBundle.getText("Selectoneentryonly"));
				} else {
					this._getDialog(title);
				}
			}

		},
		onBookingDlvEdit: function(oEvent) {
			debugger;
			var title = oEvent.getSource().getParent().getContent()[0].getId().split("--")[2];
			var oNum = this.getView().byId("idBookingDlvTable").getSelectedItems().length;
			if (oNum > 1) {
				sap.m.MessageBox.alert(
					that.resourceBundle.getText("Selectoneentryonly"));
			} else {
				this._getDialogDlv();
			}

		},
		onRightArrowPress: function(oEvent) {
			var oEvent = this.getView().byId("idTable").getSelectedItems().length;
			if (oEvent > 1) {
				sap.m.MessageBox.alert(
					that.resourceBundle.getText("Selectoneentryonly"));
			} else {
				this._getDialogMove();
			}

		},
		onLeftArrowPress: function(oEvent) {
			this._getDialogLeftMove();
		},
		onMaterialSelect: function(oEvent) {
			//whatever material id selected push that in local model
			debugger;
			var myData = this.getView().getModel("local").getProperty("/demoData");
			myData.Material = oEvent.getParameter("selectedItem").getKey();
			this.getView().getModel("local").setProperty("/demoData", myData);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler  for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("Customers", {
					Id: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oDataModel.metadataLoaded().then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		toggleFullScreen: function() {
			debugger;
			var btnId = "idFullScreenBtn";
			var headerId = "__component0---idSuppliers--BookingHeader";
			this.toggleUiTable(btnId, headerId)
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.Id,
				sObjectName = oObject.FirstName;

			// Everything went fine.
			oViewModel.setProperty("/busy", false);
			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		// onDropBookingTable:function(oEvent){
		// 	debugger;
		// 	var oDraggedItem = oEvent.getParameter("draggedControl");
		//   var oDraggedItemContext = oDraggedItem.getBindingContext();
		// 	if (!oDraggedItemContext) {
		// 		return;
		// 	}
		// 	var oBookingTable = this.getOwnerComponent().byId("idSuppliers").byId("idTable");
		//   var oModel = oBookingTable.getModel();
		//   oModel.setProperty("Rank", 0, oDraggedItemContext);
		// },
		onDropBookingDeliveryTable: function(oEvent) {
			debugger;
			var that = this;
			that.getView().setBusy(true);
			var oDraggedItem = oEvent.getParameter("draggedControl");
			var oDraggedItemContext = oDraggedItem.getBindingContext();
			// if (!oDraggedItemContext) {
			// 	return;
			// }
			// var oBookingTable = this.getOwnerComponent().byId("idSuppliers").byId("idTable");
			// var oModel = oBookingTable.getModel();
			// oModel.setProperty("Rank", 0, oDraggedItemContext);

			// var aSelectedItems = this.getOwnerComponent().byId("idSuppliers").byId("idTable").getSelectedItems();
			// var oSelectedItem = aSelectedItems[0];
			if (!oDraggedItemContext) {
				sap.m.MessageToast.show(that.resourceBundle.getText("Please11"));
				that.getView().setBusy(false);
				return;
			}

			var recId = "'" + oDraggedItem.getBindingContext().getObject().id + "'";
			var oFilter = new sap.ui.model.Filter("Recid", "EQ", recId);
			// filters: [oFilter]
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDlvDetails",
					"GET", {
						filters: [oFilter]
					}, {}, this)
				.then(function(oData) {
					debugger;
					if (oData.results.length > 0) {
						that.insertDragDlvDetails(oDraggedItem, oData);
					} else {

						var recId = oDraggedItem.getBindingContext().getObject().Recid;
						var oFilter = new sap.ui.model.Filter("Recid", "EQ", recId);
						// filters: [oFilter]
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/BookingDlvDetails",
								"GET", {
									filters: [oFilter]
								}, {}, that)
							.then(function(oData) {
								debugger;
								if (oData.results.length > 0) {
									that.insertDragDlvDetails(oDraggedItem, oData);
								} else {
									that.appendDragDlvDetails(oDraggedItem);
								}
							}).catch(function(oError) {
								that.getView().setBusy(false);
								var oPopover = that.getErrorMessage(oError);
							});
					}
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},
		insertDragDlvDetails: function(oDraggedItem, oData) {
			var that = this;
			var myData1 = this.getView().getModel("local").getProperty("/BookingDlvDetail");

			myData1.BookingDate = oDraggedItem.getBindingContext().getObject().BookingDate;
			myData1.Customer = oDraggedItem.getBindingContext().getObject().Customer;
			myData1.Quantity = parseInt(oDraggedItem.mAggregations.cells[2].mProperties.text) +
				parseInt(oData.results[0].Quantity);
			myData1.Bhav = oDraggedItem.mAggregations.cells[3].mProperties.text;
			myData1.Advance = oDraggedItem.mAggregations.cells[4].mProperties.text;
			myData1.Type = oDraggedItem.mAggregations.cells[5].mProperties.text;
			if (oDraggedItem.getBindingContext().getObject().Recid != "null") {
				myData1.Recid = oDraggedItem.getBindingContext().getObject().Recid;
			} else {
				myData1.Recid = "'" + oDraggedItem.getBindingContext().getObject().id + "'";
			}

			var oId = oData.results[0].id;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDlvDetails('" + oId + "')",
					"PUT", {}, myData1, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show(that.resourceBundle.getText("Delivery12"));

					var x = oDraggedItem;
					// that.getView().byId("idTable").getSelectedItems();
					// if(x.length){
					//  for(var i=0; i<x.length; i++){
					debugger;
					var myUrl = x.getBindingContext().sPath;
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl, "DELETE", {}, {}, that);
					//  }
					// }

				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},
		appendDragDlvDetails: function(oDraggedItem) {
			var that = this;
			var myData1 = this.getView().getModel("local").getProperty("/BookingDlvDetail");

			myData1.BookingDate = oDraggedItem.getBindingContext().getObject().BookingDate;
			myData1.Customer = oDraggedItem.getBindingContext().getObject().Customer;
			myData1.Quantity = oDraggedItem.mAggregations.cells[2].mProperties.text;
			myData1.Bhav = oDraggedItem.mAggregations.cells[3].mProperties.text;
			myData1.Advance = oDraggedItem.mAggregations.cells[4].mProperties.text;
			myData1.Type = oDraggedItem.mAggregations.cells[5].mProperties.text;
			if (oDraggedItem.getBindingContext().getObject().Recid != "null") {
				myData1.Recid = oDraggedItem.getBindingContext().getObject().Recid;
			} else {
				myData1.Recid = "'" + oDraggedItem.getBindingContext().getObject().id + "'";
			}

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDlvDetails",
					"POST", {}, myData1, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show(that.resourceBundle.getText("Delivery12"));

					var x = oDraggedItem;
					// that.getView().byId("idTable").getSelectedItems();
					// if(x.length){
					//  for(var i=0; i<x.length; i++){
					debugger;
					var myUrl = x.getBindingContext().sPath;
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl, "DELETE", {}, {}, that);
					//  }
					// }

				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},
		onDropBookingTable: function(oEvent) {
			debugger;
			var that = this;
			that.getView().setBusy(true);
			var oDraggedItem = oEvent.getParameter("draggedControl");
			var oDraggedItemContext = oDraggedItem.getBindingContext();

			// var aSelectedItems = this.getOwnerComponent().byId("idSuppliers").byId("idBookingDlvTable").getSelectedItems();
			// var oSelectedItem = aSelectedItems[0];
			if (!oDraggedItemContext) {
				sap.m.MessageToast.show(that.resourceBundle.getText("Please11"));
				that.getView().setBusy(false);
				return;
			}

			var recId = oDraggedItem.getBindingContext().getObject().Recid;

			var oFilter = new sap.ui.model.Filter("id", "EQ", recId);
			// filters: [oFilter]
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDetails",
					"GET", {
						filters: [oFilter]
					}, {}, this)
				.then(function(oData) {
					debugger;
					if (oData.results.length > 0) {
						that.insertDragDetails(oDraggedItem, oData);
					} else {
						var oFilter = new sap.ui.model.Filter("Recid", "EQ", recId);
						// filters: [oFilter]
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/BookingDetails",
								"GET", {
									filters: [oFilter]
								}, {}, that)
							.then(function(oData) {
								debugger
								if (oData.results.length > 0) {
									that.insertDragDetails(oDraggedItem, oData);
								} else {
									that.appendDragDetails(oDraggedItem);
								}
							}).catch(function(oError) {
								that.getView().setBusy(false);
								var oPopover = that.getErrorMessage(oError);
							});
					}
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},
		appendDragDetails: function(oDraggedItem) {
			var that = this;
			var myData1 = this.getView().getModel("local").getProperty("/BookingDetail");

			myData1.BookingDate = oDraggedItem.getBindingContext().getObject().BookingDate;
			myData1.Customer = oDraggedItem.getBindingContext().getObject().Customer;
			myData1.Quantity = oDraggedItem.mAggregations.cells[2].mProperties.text;
			myData1.Bhav = oDraggedItem.mAggregations.cells[3].mProperties.text;
			myData1.Advance = oDraggedItem.mAggregations.cells[4].mProperties.text;
			myData1.Type = oDraggedItem.mAggregations.cells[5].mProperties.text;
			myData1.Recid = oDraggedItem.getBindingContext().getObject().Recid;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDetails",
					"POST", {}, myData1, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show(that.resourceBundle.getText("Delivery14"));

					var x = oDraggedItem;
					// that.getView().byId("idBookingDlvTable").getSelectedItems();
					// if(x.length){
					//  for(var i=0; i<x.length; i++){
					debugger;
					var myUrl = x.getBindingContext().sPath;
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl, "DELETE", {}, {}, that);
					//  }
					// }

				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});

		},
		insertDragDetails: function(oDraggedItem, oData) {
			var that = this;
			var myData1 = this.getView().getModel("local").getProperty("/BookingDetail");

			myData1.BookingDate = oDraggedItem.getBindingContext().getObject().BookingDate;
			myData1.Customer = oDraggedItem.getBindingContext().getObject().Customer;
			myData1.Quantity = parseInt(oDraggedItem.mAggregations.cells[2].mProperties.text) +
				parseInt(oData.results[0].Quantity);
			myData1.Bhav = oDraggedItem.mAggregations.cells[3].mProperties.text;
			myData1.Advance = oDraggedItem.mAggregations.cells[4].mProperties.text;
			myData1.Type = oDraggedItem.mAggregations.cells[5].mProperties.text;
			myData1.Recid = oDraggedItem.getBindingContext().getObject().Recid;
			var oId = oData.results[0].id;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDetails('" + oId + "')",
					"PUT", {}, myData1, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show(that.resourceBundle.getText("Delivery14"));

					var x = oDraggedItem;
					// that.getView().byId("idBookingDlvTable").getSelectedItems();
					// if(x.length){
					//  for(var i=0; i<x.length; i++){
					debugger;
					var myUrl = x.getBindingContext().sPath;
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl, "DELETE", {}, {}, that);
					//  }
					// }

				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});

		},
		onSubmit: function(evt) {
			// $(function() {
			// 	$('input:text:first').focus();
			// 	var $inp = $('input:text');
			// 	$inp.bind('keypress', function(e) {
			// 		//var key = (e.keyCode ? e.keyCode : e.charCode);
			// 		var key = e.which;
			// 		if (key == 13) {
			// 			e.preventDefault();
			// 			var nxtIdx = $inp.index(this) + 1;
			// 			$(":input:text:eq(" + nxtIdx + ")").focus();
			// 		}
			// 	});
			// });
			this.getView().byId("idBhav").focus();
		},

		onBhavSubmit: function(oEvent) {
			this.getView().byId("idAdvance").focus();
		},

		onAdvSubmit: function(oEvent) {
			this.getView().byId("sendButton").focus();
		},

		decimalvalidator: function(oEvent) {
			if (this.getView().byId("idRb1").getSelected()) {
				this.decimalvalidator2(oEvent);
			} else if (this.getView().byId("idRb2").getSelected()) {
				this.decimalvalidator3(oEvent);
			}
		},
		decimalvalidator3: function(oEvent) {
			debugger;
			var dQty = oEvent.mParameters.value.match(/^[+-]?\d{0,6}(\.\d{0,3})?/)[0];
			this.getView().byId("idQnty").setValue(dQty);
			console.log(this.getView().byId("idQnty"))
		},
		decimalvalidator2: function(oEvent) {
			debugger;
			var dQty = oEvent.mParameters.value.match(/^[+-]?\d{0,5}(\.\d{0,2})?/)[0];
			this.getView().byId("idQnty").setValue(dQty);
		},
		customerCodeCheck1: function(oEvent) {debugger;
			this.getCustomer(oEvent);
			this.getView().byId("idQnty").focus();
		},
		onLiveSearch: function(oEvent) {

			this.onSearch(oEvent);
		},
	});

});
