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
								"Group": "",
								"Type": ""
				        });
				var oViewModel1 = new JSONModel({
					"items":[{"text": "Sikar"},{"text": "Churu"},{"text": "Jaipur"}]
				});
				var oViewModel2 = new JSONModel({
					"items":[{"text": "gm"},{"text": "pcs"}]
				});
				var oViewModel3 = new JSONModel({
					"items":[{"text": "Retail Customer"},{"text": "Agent"},{"text": "Karigar"},
										{"text": "Retailer"},{"text": "Maker"},{"text": "Kata Center"}]
				});
//				this.getRouter().getRoute("Products").attachPatternMatched(this._onObjectMatched, this);
//
//				// Store original busy indicator delay, so it can be restored later on
//				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "customerModel");
				// myData.KacchaGold = this.getView().byId("idKacchaGold").getValue();
				this.setModel(oViewModel1, "fixed");
				this.setModel(oViewModel2, "per");
				this.setModel(oViewModel3, "typec");
				// var typeValue = this.getModel("oViewModel3").getProperty("/selectedKey");
				// this.getView().getModel("customerModel").setProperty("/Type", typeValue);
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
			onSelectChange: function(oEvent){
				var oSelect = oEvent.getParameter("selectedItem").getText();
				this.getView().getModel("customerModel").setProperty("/Type", oSelect);
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
					"NameState" : "None",
					"TypeState" : "None"

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
				if(customerModel.getData().Type === ""){
						oDataModel.setProperty("/TypeState", "Error");
				}else{
					oDataModel.setProperty("/TypeState", "None");
				}
			},

			ValueChangeCustomer: function(oEvent){
				var oSource = oEvent.getSource();
				var oFilter = new sap.ui.model.Filter("CustomerCode",
				sap.ui.model.FilterOperator.Contains, oEvent.getParameter("suggestValue").toLocaleUpperCase());

				oSource.getBinding("suggestionItems").filter(oFilter);
				// oSource.bindAggregation("suggestionItems", {
				// 	path: '/Customers',
				// 	template: new sap.m.ColumnListItem({
				// 		label: "{CustomerCode}",
				// 		value: "{Name} - {City}"
				// 	})
				// });
				// oSource.getBinding( {
				//  path: '/Customers',
				//  template: new sap.m.DisplayListItem({
				// 	 label: "{CustomerCode}",
				// 	 value: "{Name} - {City}"
				//  })
			 // });

			},

			customerCodeEnter : function(oEvent){
				$(function() {
								$('input:text:first').focus();
								var $inp = $('input:text');
								$inp.bind('keypress', function(e) {
										//var key = (e.keyCode ? e.keyCode : e.charCode);
										var key = e.which;
										if (key == 13) {
												e.preventDefault();
												var nxtIdx = $inp.index(this) + 1;
												$(":input:text:eq(" + nxtIdx + ")").focus();
										}
								});
						});
						var customerModel = this.getView().getModel("customerModel");
						var selData = oEvent.getParameter("value").toLocaleUpperCase();
						customerModel.setProperty("/CustomerCode", selData);
						// var selectedCustData =oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
						var customerJson = this.getView().getModel("customerModelInfo").getData().results;
						function getCustomerCode(selData) {
						 		return customerJson.filter(
						 			function (data) {
						 				return data.CustomerCode === selData;
						 			}
						 		);
						 	}

						 	var found = getCustomerCode(selData);
						var dataModel = this.getView().getModel("dataModel");
					 var viewModel = this.getView().getModel("viewModel");
						var oCustCode = this.getView().byId("idCustomerCode").getValue();
					if(found.length > 0){
						customerModel.setProperty("/CustomerCode", found[0].id);
						customerModel.setProperty("/City", found[0].City);
						customerModel.setProperty("/Name", found[0].Name);
						customerModel.setProperty("/MobilePhone", found[0].MobilePhone);
						customerModel.setProperty("/Address", found[0].Address);
						customerModel.setProperty("/SecondaryPhone", found[0].SecondaryPhone);
						customerModel.setProperty("/Group", found[0].Group);
						customerModel.setProperty("/Id", found[0].id);
						var oType = this.getView().byId("idType");
						oType.setSelectedKey(found[0].Type);
						customerModel.setProperty("/Type", found[0].Type);
						viewModel.setProperty("/buttonText", "Update");
						viewModel.setProperty("/deleteEnabled", true);
						viewModel.setProperty("/codeEnabled", false);
						dataModel.setProperty("/typeEnabled", true);
						this.additionalInfoValidation();
						// this.getView().byId("idName").focus();
						customerModel.refresh();
						}else{
							customerModel.getData().City = "";
							customerModel.getData().MobilePhone = "0";
							customerModel.getData().Address = "";
							customerModel.getData().Name = "";
							customerModel.getData().SecondaryPhone = "0";
							customerModel.getData().Group = "";
							customerModel.getData().Type = "";
							viewModel.setProperty("/buttonText", "Save");
							viewModel.setProperty("/deleteEnabled", false);
							viewModel.setProperty("/codeEnabled", false);
							this.additionalInfoValidation();
							// this.getView().byId("idName").focus();
							customerModel.refresh();
						}
			},

			customerCodeCheck : function(oEvent){
						var customerModel = this.getView().getModel("customerModel");
						var selectedCustData =oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
						var customerCode = selectedCustData.CustomerCode;
						var dataModel = this.getView().getModel("dataModel");
					 // var productCode = customerModel.getData().ProductCode;
					 // var productJson = this.getView().getModel("customerModelInfo").getData().results;
					 var viewModel = this.getView().getModel("viewModel");
						var oCustCode = this.getView().byId("idCustomerCode").getValue();
						 var found =  customerCode;
					if(found.length > 0){
						customerModel.setProperty("/CustomerCode", selectedCustData.id);
						customerModel.setProperty("/City", selectedCustData.City);
						customerModel.setProperty("/Name", selectedCustData.Name);
						customerModel.setProperty("/MobilePhone", selectedCustData.MobilePhone);
						customerModel.setProperty("/Address", selectedCustData.Address);
						customerModel.setProperty("/SecondaryPhone", selectedCustData.SecondaryPhone);
						customerModel.setProperty("/Group", selectedCustData.Group);
						// customerModel.getData().City = found[0].City;
						// customerModel.getData().MobilePhone = found[0].MobilePhone;
						// customerModel.getData().Address = found[0].Address;
						// customerModel.getData().Name = found[0].Name;
						// customerModel.getData().SecondaryPhone = found[0].SecondaryPhone;
						// customerModel.getData().Group = found[0].Group;
						// customerModel.getData().Type = found[0].Type;
						var oType = this.getView().byId("idType");
						oType.setSelectedKey(selectedCustData.Type);
						customerModel.setProperty("/Type", selectedCustData.Type);
						viewModel.setProperty("/buttonText", "Update");
						viewModel.setProperty("/deleteEnabled", true);
						viewModel.setProperty("/codeEnabled", false);
						dataModel.setProperty("/typeEnabled", true);
						this.additionalInfoValidation();
						this.getView().byId("idName").focus();
						// customerModel.refresh();
						}else{
							customerModel.getData().City = "";
							customerModel.getData().MobilePhone = "0";
							customerModel.getData().Address = "";
							customerModel.getData().Name = "";
							customerModel.getData().SecondaryPhone = "0";
							customerModel.getData().Group = "";
							customerModel.getData().Type = "";
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
				var typeModel = this.getView().getModel("typec");
				customerModel.getData().CustomerCode = "";
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
				customerModel.getData().CustomerCode = "";
				var custid = this.getView().byId("idCustomerCode");
				custid.setSelectedKey("");
				var typeValue = typeModel.getData().items[0].text;
				var oType = this.getView().byId("idType");
				oType.setSelectedKey(typeValue);
				dataModel.setProperty("/CityState", "None");
				dataModel.setProperty("/GroupState", "None");
				dataModel.setProperty("/NameState", "None");
				customerModel.refresh();
			},

			SaveCustomer : function(){
				var that = this;
				 var customerModel = this.getView().getModel("customerModel");
				 var custId = customerModel.getData().Id;
 				var customerCode = that.getView().byId("idCustomerCode").getValue();
 				customerModel.setProperty("/CustomerCode", customerCode);
				var oCuscode = customerModel.getProperty("/CustomerCode").toLocaleUpperCase();
				customerModel.setProperty("/CustomerCode", oCuscode);
				 // var customerCode = customerModel.getData().CustomerCode;
				 // var customerJson = this.getView().getModel("customerModelInfo").getData().results;

				 if(customerModel.getData().CustomerCode === "" || customerModel.getData().Name === "" || customerModel.getData().City === "" || customerModel.getData().Group === ""){
					 MessageToast.show("Please fill the required fields");
					 return;
				 }

				 // function getCustomerCode(customerCode) {
					// 		return customerJson.filter(
					// 			function (data) {
					// 				return data.CustomerCode === customerCode;
					// 			}
					// 		);
					// 	}
				 //
					// 	var found = getCustomerCode(customerCode);
						if(custId.length > 0){

							this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							 "/Customers('"+custId+"')", "PUT", {},customerModel.getData() , this)
								.then(function(oData) {
								MessageToast.show("Data saved successfully");
								// that._onRouteMatched();
									that.clearCustomer();
								}).catch(function(oError) {
										MessageToast.show("Data could not be saved");
								});

						}
						else{
							this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							 "/Customer", "POST", {},customerModel.getData() , this)
								.then(function(oData) {
								MessageToast.show("Data saved successfully");
							// that.clearCustomer();
								// that._onRouteMatched();
								that.clearCustomer();
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
					 	var typeModel = this.getView().getModel("typec");
					 if(customerCode.length > 0){

							this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							 "/Customers('" + customerCode + "')", "DELETE", {},{}, this)
								.then(function(oData) {
								MessageToast.show("Deleted successfully");
								customerModel.getData().City = "";
								customerModel.getData().MobilePhone = "0";
								customerModel.getData().Address = "";
								customerModel.getData().CustomerCode = ""
								customerModel.getData().Name = "";
								customerModel.getData().SecondaryPhone = "0";
								customerModel.getData().Group = "";
								// var typeValue = typeModel.getData().items[0].text;
								// var oType = this.getView().byId("idType");
								customerModel.refresh();
								// // that._onRouteMatched();
								that.clearCustomer();
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
						"Type": parseInt(this.byId("idType").getSelectedKey()),
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
						// that.clearCustomer();
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
						"Type": parseInt(this.byId("idType").getSelectedKey()),
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
							// that.clearCustomer();
						}
						else{
							that.updateCustomer();
							// that.clearCustomer();
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
