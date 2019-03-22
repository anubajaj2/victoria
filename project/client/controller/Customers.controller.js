/*global location*/
sap.ui.define([
		"victoria/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"victoria/models/formatter",
		"sap/m/MessageToast",
		"sap/ui/model/Filter"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
		MessageToast,
		Filter
	) {
		"use strict";

		return BaseController.extend("victoria.controller.Customers", {

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
				//Actual Tunch : StandardCost
				//Wastage : ZipPostalCode , Customer Tunch : MobilePhone
				//Alarm Below : TargetLevel
				//Price per pc/gm : QuantityPerUnit
				//Making : Address
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						"Id": "",
				        "City": "",
				        "MobilePhone": 0,
				        "Address": "",
				        "Company": "",
				        "FirstName": "",
				        "ZipPostalCode": 0,
				        "LastName": ""
				        });
				var oViewModel1 = new JSONModel({
					"items":[{"text": "Sikar"},{"text": "Churu"},{"text": "Jaipur"}]
				});
				var oViewModel2 = new JSONModel({
					"items":[{"text": "gm"},{"text": "pcs"}]
				});
//				this.getRouter().getRoute("Products").attachPatternMatched(this._onObjectMatched, this);
//
//				// Store original busy indicator delay, so it can be restored later on
//				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "customerModel");
				this.setModel(oViewModel1, "fixed");
				this.setModel(oViewModel2, "per");
//				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
//						// Restore original busy indicator delay for the object view
//						oViewModel.setProperty("/delay", iOriginalBusyDelay);
//					}
//				);
			},
			selectedCustomer: function(oEvent){
				var item = oEvent.getParameter("selectedItem");
				var key = item.getText();
				var keya = item.getKey();
				var that = this;
				console.log(key);console.log(keya);
				this.getModel().read("/Customers(" + keya + ")",{
					success: function(data){
						that.getModel("customerModel").setData(data);
						that.getModel("customerModel").setProperty("/City",data.CitycodeDetails.Code);
					}
				} );
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
			createNewCustomer: function(){
				var that = this;
				//var updatedData = that.getModel("customerModel").getProperty("/");
				var updatedData = {
						"Address": this.byId("idAddress").getValue(),
						"Attachments": "",
						"BusinessPhone": "",
						"Citycode": parseInt(this.byId("idCity").getSelectedKey()),
						"Company": this.byId("customerCode").getValue(),
						"CountryRegion": "",
						"Customgroup": parseInt(this.byId("idCustomGrp").getSelectedKey()),
						"EmailAddress": null,
						"FaxNumber":  "",
						"FirstName": this.byId("idName").getValue(),
						"HasInterest": this.byId("idSendSMS").getState(),
						"HomePhone": null,
						"JobTitle": "",
						"LastName": "",
						"MobilePhone": this.byId("idMobilePhone").getValue(),
						"Notes": null,
						"Standardgroup": parseInt(this.byId("idGroup").getSelectedKey()),
						"StateProvince": "",
						"WebPage": "",
						"ZipPostalCode": this.byId("idZipPostalCode").getValue(),
						"CitycodeDetails": {
							"__metadata": {
								"uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Citycodes("+ this.byId("idCity").getSelectedKey() +")"
							}
						},
						"CustomgroupDetails": {
							"__metadata": {
								"uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Customgroups(" + this.byId("idCustomGrp").getSelectedKey() + ")"
							}
						},
						"StandardgroupDetails": {
							"__metadata": {
								"uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Standardgroups("+ this.byId("idGroup").getSelectedKey() +")"
							}
						}
					};
				this.getModel().create("/Customers",updatedData,{
					success: function(){
						MessageToast.show("Created successfully");
					}
				});
			},
			updateCustomer: function(){
				var that = this;
				//var updatedData = that.getModel("customerModel").getProperty("/");
				var updatedData = {
						"Address": this.byId("idAddress").getValue(),
						"Attachments": "",
						"BusinessPhone": "",
						"Citycode": parseInt(this.byId("idCity").getSelectedKey()),
						"Company": this.byId("customerCode").getValue(),
						"CountryRegion": "",
						"Customgroup": parseInt(this.byId("idCustomGrp").getSelectedKey()),
						"EmailAddress": null,
						"FaxNumber":  "",
						"FirstName": this.byId("idName").getValue(),
						"HasInterest": this.byId("idSendSMS").getState(),
						"HomePhone": null,
						"JobTitle": "",
						"LastName": "",
						"MobilePhone": this.byId("idMobilePhone").getValue(),
						"Notes": null,
						"Standardgroup": parseInt(this.byId("idGroup").getSelectedKey()),
						"StateProvince": "",
						"WebPage": "",
						"ZipPostalCode": this.byId("idZipPostalCode").getValue(),
						"CitycodeDetails": {
							"__metadata": {
								"uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Citycodes("+ this.byId("idCity").getSelectedKey() +")"
							}
						},
						"CustomgroupDetails": {
							"__metadata": {
								"uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Customgroups(" + this.byId("idCustomGrp").getSelectedKey() + ")"
							}
						},
						"StandardgroupDetails": {
							"__metadata": {
								"uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Standardgroups("+ this.byId("idGroup").getSelectedKey() +")"
							}
						}
					};
				this.getModel().update("/Customers("+ that.getModel("customerModel").getProperty("/Id")+ ")",updatedData,{
					success: function(){
						MessageToast.show("Updated successfully");
					}
				});
			},
			clearValues : function(){
				this.getModel("customerModel").setProperty("/Id", "");
				this.getModel("customerModel").setProperty("/City", "");
				this.getModel("customerModel").setProperty("/Company", "");
				this.getModel("customerModel").setProperty("/FirstName", "");
				this.getModel("customerModel").setProperty("/LastName", "");
				this.getModel("customerModel").setProperty("/MobilePhone", 0);
				this.getModel("customerModel").setProperty("/Address", 0);
				this.getModel("customerModel").setProperty("/ZipPostalCode", 0);
			},
			deleteProduct: function(){
				var that = this;
				this.getModel().remove("/Customers("+ that.getModel("customerModel").getProperty("/Id")+ ")",{
					success: function(){
						MessageToast.show("Deleted successfully");
						that.clearValues();
					}
				});
			},
			Save: function(){
				var that = this;
				var aFilters = [];
				var oFilter = new Filter("Company", "EQ", that.getModel("customerModel").getProperty("/Company"));
				aFilters.push(oFilter);
				this.getModel().read("/Customers",{
					filters: aFilters,
					success: function(data){

						if(data.results.length === 0){
							that.createNewCustomer();
						}
						else{
							that.updateCustomer();
						}
					}
				} );
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
