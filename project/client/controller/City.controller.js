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

		return BaseController.extend("victoria.controller.City", {

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
						"cityCode": "",
				        "cityName": "",
				        "state": ""

				        });

//				this.getRouter().getRoute("Products").attachPatternMatched(this._onObjectMatched, this);
//
//				// Store original busy indicator delay, so it can be restored later on
//				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "cityModel");

				var oViewDetailModel = new JSONModel({
					"buttonText" : "Save",
					"deleteEnabled" : false

				});
				this.setModel(oViewDetailModel, "viewModel");
				var oRouter = this.getRouter();
			oRouter.getRoute("City").attachMatched(this._onRouteMatched, this);

	 // 			var a ={"cityCode":"1","cityName" : "Bangalore", "state" : "KA"
	 // };
	// debugger;
	 // this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/City", "POST", {}, a, this)
	 // .then(function(oData) {
	 //
	 //  });
//				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
//						// Restore original busy indicator delay for the object view
//						oViewModel.setProperty("/delay", iOriginalBusyDelay);
//					}
//				);
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



_onRouteMatched : function(){
	var that = this;
	var viewModel = this.getView().getModel("viewModel");
	viewModel.setProperty("/codeEnabled", true);
	viewModel.setProperty("/buttonText", "Save");
	viewModel.setProperty("/deleteEnabled", false);
	var odataModel = new JSONModel({
		"cityCodeState" : "None"


	});
	this.setModel(odataModel, "dataModel");
	this.clearCity();
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

},

additionalInfoValidation : function(){
	var customerModel = this.getView().getModel("cityModel");
	var oDataModel = this.getView().getModel("dataModel");
	if(customerModel.getData().cityCode === ""){
			oDataModel.setProperty("/cityCodeState", "Error");
	}else{
		oDataModel.setProperty("/cityCodeState", "None");
	}

},

cityCodeCheck : function(oEvent){
	var cityModel = this.getView().getModel("cityModel");
	var cityCode = cityModel.getData().cityCode;
	var cityJson = this.getView().getModel("cityModelInfo").getData().results;
var viewModel = this.getView().getModel("viewModel");


	function getCityCode(cityCode) {
				return cityJson.filter(
					function (data) {
						return data.cityCode === cityCode;
					}
				);
			}

			var found = getCityCode(cityCode);
			if(found.length > 0){
				cityModel.getData().cityName = found[0].cityName;
				cityModel.getData().state = found[0].state;
				viewModel.setProperty("/buttonText", "Update");
				viewModel.setProperty("/deleteEnabled", true);
				viewModel.setProperty("/codeEnabled", false);
				this.additionalInfoValidation();
				this.getView().byId("cityName").focus();
				cityModel.refresh();
			}else{
				cityModel.getData().cityName = "";
				cityModel.getData().state = "";
				viewModel.setProperty("/buttonText", "Save");
				viewModel.setProperty("/deleteEnabled", false);
				viewModel.setProperty("/codeEnabled", false);
				this.getView().byId("cityName").focus();
				this.additionalInfoValidation();
				cityModel.refresh();
			}

},

clearCity : function(){
		var cityModel = this.getView().getModel("cityModel");
		var viewModel = this.getView().getModel("viewModel");
		var dataModel = this.getView().getModel("dataModel");
		cityModel.getData().cityName = "";
		cityModel.getData().cityCode = "";
		cityModel.getData().state = "";
		viewModel.setProperty("/codeEnabled", true);
		viewModel.setProperty("/buttonText", "Save");
		viewModel.setProperty("/deleteEnabled", false);
		dataModel.setProperty("/cityCode", "None");
		cityModel.refresh();
},

deleteCity : function(){
	var that = this;
	 var cityModel = this.getView().getModel("cityModel");
	 var cityCode = cityModel.getData().cityCode;
	 var cityJson = this.getView().getModel("cityModelInfo").getData().results;
	 function getCityCode(cityCode) {
				return cityJson.filter(
					function (data) {
						return data.cityCode === cityCode;
					}
				);
			}

			var found = getCityCode(cityCode);
			if(found.length > 0){
				if (!this.customerCityInfo(found[0].cityName)){
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				 "/Cities('" + found[0].id + "')", "DELETE", {},{}, this)
					.then(function(oData) {
					MessageToast.show("Deleted successfully");
					cityModel.getData().cityCode = "";
					cityModel.getData().cityName = "";
					cityModel.getData().state = "";
					cityModel.refresh();
					that._onRouteMatched();
					}).catch(function(oError) {
							MessageToast.show("Could not delete the entry");
					});

			}else{
				MessageToast.show("City already in use.Cannot be deleted");
			}
			}
			else{
				MessageToast.show("Data not available");
			}

},

customerCityInfo : function(cityName){
	var customerModel = this.getView().getModel("customerModelInfo");
	var oDataCustomer =  customerModel.getData().results;
	function getCustomerCity(cityName) {
			return oDataCustomer.filter(
				function (data) {
					return data.City === cityName;
				}
			);
		}

		var found = getCustomerCity(cityName);
		if(found.length > 0){
			return true;
		}else{
			return false;
		}
},

saveCity : function(){
	var that = this;
	 var cityModel = this.getView().getModel("cityModel");
	 var cityCode = cityModel.getData().cityCode;
	 var cityJson = this.getView().getModel("cityModelInfo").getData().results;
	 if(cityModel.getData().cityCode === "" ){
		 this.additionalInfoValidation();
		MessageToast.show("Please fill the required fields");
		return;
	}
	 function getCityCode(cityCode) {
	 			return cityJson.filter(
	 				function (data) {
	 					return data.cityCode === cityCode;
	 				}
	 			);
	 		}

	 		var found = getCityCode(cityCode);
	 		if(found.length > 0){

	 			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
	 			 "/Cities('"+found[0].id+"')", "PUT", {},cityModel.getData() , this)
					.then(function(oData) {
	 				MessageToast.show("Data saved successfully");
					that._onRouteMatched();
	 				}).catch(function(oError) {
	 						MessageToast.show("Data could not be saved");
	 				});

	 		}
			else{
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				 "/City", "POST", {},cityModel.getData() , this)
					.then(function(oData) {
					MessageToast.show("Data saved successfully");
					that._onRouteMatched();
					}).catch(function(oError) {
							MessageToast.show("Data could not be saved");
					});
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
					var sObjectPath = this.getModel().createKey("city", {
						Id :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));


			},

			getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
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
