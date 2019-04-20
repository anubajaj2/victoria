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
				        "MobilePhone": "0",
				        "Address": "",
				        "CustomerCode": "",
				        "Name": "",
				        "SecondaryPhone": "0",
								"Group": ""

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
				var oViewDetailModel = new JSONModel({
					"buttonText" : "Save",
					"deleteEnabled" : false,
					"codeEnabled" : true

				});
				this.setModel(oViewDetailModel, "viewModel");

				var oRouter = this.getRouter();
			oRouter.getRoute("Customers").attachMatched(this._onRouteMatched, this);
//				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
//						// Restore original busy indicator delay for the object view
//						oViewModel.setProperty("/delay", iOriginalBusyDelay);
//					}
//				);
			},

			getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

			_onRouteMatched : function(){
				var that = this;
				var viewModel = this.getView().getModel("viewModel");
				viewModel.setProperty("/codeEnabled", true);
				viewModel.setProperty("/buttonText", "Save");
				viewModel.setProperty("/deleteEnabled", false);
				var odataModel = new JSONModel({
					"CustomerCodeState" : "None",
					"CityState" : "None",
					"GroupState" : "None",
					"NameState" : "None"

				});
				this.setModel(odataModel, "dataModel");

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				 "/Customers", "GET", {}, {}, this)
					.then(function(oData) {
						var oModelCustomer = new JSONModel();
				oModelCustomer.setData(oData);
				that.getView().setModel(oModelCustomer, "customerModelInfo");

					}).catch(function(oError) {
							MessageToast.show("cannot fetch the data");
					});

					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					 "/Cities", "GET", {}, {}, this)
						.then(function(oData) {
							var oModelCity = new JSONModel();
					oModelCity.setData(oData);
					that.getView().setModel(oModelCity, "cityModelInfo");

						}).catch(function(oError) {
								MessageToast.show("cannot fetch the data");
						});

						this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						 "/Groups", "GET", {}, {}, this)
							.then(function(oData) {
								var oModelGroup = new JSONModel();
						oModelGroup.setData(oData);
						that.getView().setModel(oModelGroup, "groupModelInfo");

							}).catch(function(oError) {
									MessageToast.show("cannot fetch the data");
							});
this.clearCustomer();
			},

			additionalInfoValidation : function(){
				var customerModel = this.getView().getModel("customerModel");
				var oDataModel = this.getView().getModel("dataModel");
				if(customerModel.getData().CustomerCode === ""){
						oDataModel.setProperty("/CustomerCodeState", "Error");
				}else{
					oDataModel.setProperty("/CustomerCodeState", "None");
				}
				if(customerModel.getData().Name === ""){
						oDataModel.setProperty("/NameState", "Error");
				}else{
					oDataModel.setProperty("/NameState", "None");
				}
				if(customerModel.getData().Group === ""){
						oDataModel.setProperty("/GroupState", "Error");
				}else{
					oDataModel.setProperty("/GroupState", "None");
				}
				if(customerModel.getData().City === ""){
						oDataModel.setProperty("/CityState", "Error");
				}else{
					oDataModel.setProperty("/CityState", "None");
				}

			},

			customerCodeCheck : function(){
				var customerModel = this.getView().getModel("customerModel");
 			 var customerCode = customerModel.getData().CustomerCode;
 			 var customerJson = this.getView().getModel("customerModelInfo").getData().results;
			 var viewModel = this.getView().getModel("viewModel");
 			 function getCustomerCode(customerCode) {
 						return customerJson.filter(
 							function (data) {
 								return data.CustomerCode === customerCode;
 							}
 						);
 					}

 					var found = getCustomerCode(customerCode);
					if(found.length > 0){
						customerModel.getData().City = found[0].City;
						customerModel.getData().MobilePhone = found[0].MobilePhone;
						customerModel.getData().Address = found[0].Address;
						customerModel.getData().Name = found[0].Name;
						customerModel.getData().SecondaryPhone = found[0].SecondaryPhone;
						customerModel.getData().Group = found[0].Group;
						viewModel.setProperty("/buttonText", "Update");
						viewModel.setProperty("/deleteEnabled", true);
						viewModel.setProperty("/codeEnabled", false);
						this.additionalInfoValidation();
						this.getView().byId("idName").focus();
						customerModel.refresh();
						}else{
							customerModel.getData().City = "";
							customerModel.getData().MobilePhone = "0";
							customerModel.getData().Address = "";
							customerModel.getData().Name = "";
							customerModel.getData().SecondaryPhone = "0";
							customerModel.getData().Group = "";
							viewModel.setProperty("/buttonText", "Save");
							viewModel.setProperty("/deleteEnabled", false);
							viewModel.setProperty("/codeEnabled", false);
							this.additionalInfoValidation();
							this.getView().byId("idName").focus();
							customerModel.refresh();
						}
			},

			clearCustomer : function(){
				var customerModel = this.getView().getModel("customerModel");
				var viewModel = this.getView().getModel("viewModel");
				var dataModel = this.getView().getModel("dataModel");
			 customerModel.getData().City = "";
				customerModel.getData().MobilePhone = "0";
				customerModel.getData().Address = "";
				customerModel.getData().Name = "";
				customerModel.getData().CustomerCode = "";
				customerModel.getData().SecondaryPhone = "0";
				customerModel.getData().Group = "";
				viewModel.setProperty("/codeEnabled", true);
				viewModel.setProperty("/buttonText", "Save");
				viewModel.setProperty("/deleteEnabled", false);
				dataModel.setProperty("/CustomerCodeState", "None");
				dataModel.setProperty("/CityState", "None");
				dataModel.setProperty("/GroupState", "None");
				dataModel.setProperty("/NameState", "None");
				customerModel.refresh();
			},

			SaveCustomer : function(){
				var that = this;
				 var customerModel = this.getView().getModel("customerModel");
				 var customerCode = customerModel.getData().CustomerCode;
				 var customerJson = this.getView().getModel("customerModelInfo").getData().results;

				 if(customerModel.getData().CustomerCode === "" || customerModel.getData().Name === "" || customerModel.getData().City === "" || customerModel.getData().Group === ""){
					 MessageToast.show("Please fill the required fields");
					 return;
				 }

				 function getCustomerCode(customerCode) {
							return customerJson.filter(
								function (data) {
									return data.CustomerCode === customerCode;
								}
							);
						}

						var found = getCustomerCode(customerCode);
						if(found.length > 0){

							this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							 "/Customers('"+found[0].id+"')", "PUT", {},customerModel.getData() , this)
								.then(function(oData) {
								MessageToast.show("Data saved successfully");
								that._onRouteMatched();
								}).catch(function(oError) {
										MessageToast.show("Data could not be saved");
								});

						}
						else{
							this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							 "/Customer", "POST", {},customerModel.getData() , this)
								.then(function(oData) {
								MessageToast.show("Data saved successfully");
								that._onRouteMatched();
								}).catch(function(oError) {
										MessageToast.show("Data could not be saved");
								});
						}

			},

			deleteCustomer : function(){
				var that = this;
				var customerModel = this.getView().getModel("customerModel");
				var customerCode = customerModel.getData().CustomerCode;
				var customerJson = this.getView().getModel("customerModelInfo").getData().results;
				if(customerModel.getData().CustomerCode === "" || customerModel.getData().Name === "" || customerModel.getData().City === "" || customerModel.getData().Group === ""){
					MessageToast.show("Please fill the required fields");
					return;
				}
				function getCustomerCode(customerCode) {
						 return customerJson.filter(
							 function (data) {
								 return data.CustomerCode === customerCode;
							 }
						 );
					 }

					 var found = getCustomerCode(customerCode);
					 if(found.length > 0){

							this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							 "/Customers('" + found[0].id + "')", "DELETE", {},{}, this)
								.then(function(oData) {
								MessageToast.show("Deleted successfully");
								customerModel.getData().City = "";
								customerModel.getData().MobilePhone = "0";
								customerModel.getData().Address = "";
								customerModel.getData().CustomerCode = ""
								customerModel.getData().Name = "";
								customerModel.getData().SecondaryPhone = "0";
								customerModel.getData().Group = "";
								customerModel.refresh();
								that._onRouteMatched();
								}).catch(function(oError) {
										MessageToast.show("Could not delete the entry");
								});

						}
						else{
							MessageToast.show("Data not available");
						}

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
