/*global location*/
sap.ui.define([
		"victoria/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"victoria/models/formatter"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter
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
			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0
					});

					debugger;
					BaseController.prototype.onInit.apply(this);

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
			_onRouteMatched : function(){
      var that = this;
      that.getView().getModel("local").setProperty("/BookingDetail/BookingDate", new Date());
      this.getView().byId("DateId").setDateValue(new Date());

      },
      customerCodeCheck:function(oEvent){
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
debugger;
						var selectedCustData =oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
				    var cName = selectedCustData.Name.toUpperCase();
						this.getView().byId("idCustName").setText(cName);

						var myData = this.getView().getModel("local").getProperty("/BookingDetail");
						myData.Customer = oEvent.getParameter("selectedItem").getBindingContext().sPath.split("'")[1];
			},
			onClear:function(){
				debugger;
				var custid = this.getView().byId("idCustomerCode");
				custid.setSelectedKey("");
				this.getView().byId("idCustName").setText("");
				this.getView().byId("idQnty").setValue("");
				this.getView().byId("idBhav").setValue("");
				this.getView().byId("idAdvance").setValue("");
				this.getView().byId("DateId").setDateValue(new Date());


			},
			_getDialog: function (oEvent) {
	        if(!this.oDialog){
	 				 this.oDialog= sap.ui.xmlfragment("BookingDialog","victoria.fragments.BookingDialog",this);
	 				 this.getView().addDependent(this.oDialog);
	 			 }
	 			 this.oDialog.open();
	 			 debugger;
	 			 var title = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[1].mProperties.text;
	 			 sap.ui.getCore().byId("BookingDialog--idDialog-title").setText(title);
	 			 var cell0 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[0].mProperties.text;
	 			 sap.ui.getCore().byId("BookingDialog--idDialogDate").setValue(cell0);
	 			 var cell2 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[1].mProperties.text;
	 			sap.ui.getCore().byId("BookingDialog--idDialogCust").setValue(cell2);
	 			 var cell3 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[2].mProperties.text;
	 			  sap.ui.getCore().byId("BookingDialog--idDialogQnty").setValue(cell3);
	 			 var cell4 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[3].mProperties.text;
	 			  sap.ui.getCore().byId("BookingDialog--idDialogBhav").setValue(cell4);
	 			 var cell5 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[4].mProperties.text;
	 			  sap.ui.getCore().byId("BookingDialog--idDialogAdv").setValue(cell5);

	 	 },
		 onPressHandleEntrySavePopup: function (oEvent){
			 debugger;
			 var that=this;
			 that.getView().setBusy(true);
			 var myData = this.getView().getModel("local").getProperty("/BookingDetail");
			 var id = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[1].mBindingInfos.text.binding.oContext.sPath.split("'")[1]; //myData.Customer;

			 myData.BookingDate = sap.ui.getCore().byId("BookingDialog--idDialogDate").getValue();
			 myData.Quantity = sap.ui.getCore().byId("BookingDialog--idDialogQnty").getValue();
			 myData.Bhav = sap.ui.getCore().byId("BookingDialog--idDialogBhav").getValue();
			 myData.Advance = sap.ui.getCore().byId("BookingDialog--idDialogAdv").getValue();
			 // myData.Customer = sap.ui.getCore().byId("BookingDialog--idDialogCust").getValue();
       myData.Customer = this.getView().byId("idTable").getSelectedItems()[0].getBindingContext().getObject().Customer;
			 this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDetails('" + id + "')",
																 "PUT", {}, myData, this)
			 .then(function(oData) {
				 that.getView().setBusy(false);
				 sap.m.MessageToast.show("Data updated Successfully");

			 }).catch(function(oError) {
				 that.getView().setBusy(false);
				 var oPopover = that.getErrorMessage(oError);
			 });
		 },
		 onPressHandleEntryCancelPopup: function () {
			 this.oDialog.close();
		 },

		 onDelete: function(){
	     var that=this;
	     // debugger;
	     sap.m.MessageBox.confirm(
	"Deleting Selected Records", {
	         title: "Confirm",
	         actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
	         styleClass: "",
	         onClose: function(sAction) {
	           debugger;
	           if(sAction==="OK"){
	             debugger;
	             var x = that.getView().byId("idTable").getSelectedItems();
							 var nQnty = 0;
							 var nBhav = 0;
							 var nAdvance = 0;
	            if(x.length){
	              for(var i=0; i<x.length; i++){
	                debugger;
	                var myUrl = x[i].getBindingContext().sPath;
	                that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,"DELETE",{},{},that);
								}

	            }
	          sap.m.MessageToast.show("Selected records are deleted");
	        }
	       }
	     }
	     );
			 // debugger;
	   },


		onNameChange: function(oEvent){

				debugger;
 				var cName = oEvent.getParameter("value");
				this.getView().byId("idCustName").setText(cName);

			},
			onSend: function(){
				debugger;
				var that = this;
				that.getView().setBusy(true);
				var myData = this.getView().getModel("local").getProperty("/BookingDetail");
				myData.BookingDate =  this.getView().byId("DateId").getDateValue();
				myData.Quantity =  this.getView().byId("idQnty").getValue();
				myData.Bhav =  this.getView().byId("idBhav").getValue();
				myData.Advance =  this.getView().byId("idAdvance").getValue();
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDetails",
																	"POST", {}, myData, this)
				.then(function(oData) {
					that.getView().setBusy(false);
					sap.m.MessageToast.show("Data Saved Successfully");

				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
			},
			onUpdateFinished: function(oEvent){
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
					var customerId = oTable.getItems()[i].getCells()[1].getText();
					var customerData = this.allMasterData.customers[customerId];
					oTable.getItems()[i].getCells()[1].setText(customerData.CustomerCode + ' - ' + customerData.Name );
					//Find the customer data for that Guid in customer collection
					//Change the data on UI table with semantic information
				}
			},
			onEdit: function (oEvent) {
	 		 debugger;
	 		 var oEvent =this.getView().byId("idTable").getSelectedItems().length;
	 		 if(oEvent>1){
	 			 sap.m.MessageBox.alert(
	 			 "Select one entry only");
	 		 }
	 		 else{
	 		  this._getDialog();
	      }

	 	 },
			onRightArrowPress: function(oEvent){
				debugger;
				var that = this;
				that.getView().setBusy(true);
				var oSelCount =this.getView().byId("idTable").getSelectedItems().length;
				for(var i = 0; i<oSelCount; i++){
					var oSelected = this.getView().byId("idTable").getSelectedItems()[i];
					var myData1 = this.getView().getModel("local").getProperty("/BookingDlvDetail");
					myData1.BookingDate = oSelected.getBindingContext().getObject().BookingDate;
					myData1.Customer = oSelected.getBindingContext().getObject().Customer;
					myData1.Quantity = oSelected.mAggregations.cells[2].mProperties.text;
					myData1.Bhav = oSelected.mAggregations.cells[3].mProperties.text;
					myData1.Advance = oSelected.mAggregations.cells[4].mProperties.text;
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/BookingDlvDetails",
																		"POST", {}, myData1, this)
					.then(function(oData) {
						that.getView().setBusy(false);
						sap.m.MessageToast.show("Data Saved Successfully");

					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
					});
				}
			},
			onMaterialSelect: function(oEvent){
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
			onNavBack : function() {
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
			_onObjectMatched : function (oEvent) {
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("Customers", {
						Id :  sObjectId
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
			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel();

				this.getView().bindElement({
					path: sObjectPath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								// Busy indicator on view should only be set if metadata is loaded,
								// otherwise there may be two busy indications next to each other on the
								// screen. This happens because route matched handler already calls '_bindView'
								// while metadata is loaded.
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
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
			}

		});

	}
);
