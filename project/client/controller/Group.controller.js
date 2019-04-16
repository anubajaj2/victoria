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

		return BaseController.extend("victoria.controller.Group", {

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
						"groupCode": "",
				        "groupName": "",
				        "description": ""

				        });

//				this.getRouter().getRoute("Products").attachPatternMatched(this._onObjectMatched, this);
//
//				// Store original busy indicator delay, so it can be restored later on
//				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "groupModel");
				var oViewDetailModel = new JSONModel({
					"buttonText" : "Save",
					"deleteEnabled" : false

				});
				this.setModel(oViewDetailModel, "viewModel");
				var oRouter = this.getRouter();
			oRouter.getRoute("Group").attachMatched(this._onRouteMatched, this);
	// 			var a ={"groupCode":"123","groupName" : "ABC", "description" : "test"
	// };
	// debugger;
	// this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Group", "POST", {}, a, this)
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
			 	this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			 	 "/Groups", "GET", {}, {}, this)
			 		.then(function(oData) {
			 			var oModelGroup = new JSONModel();
			 	oModelGroup.setData(oData);
			 	that.getView().setModel(oModelGroup, "groupModelInfo");

			 		}).catch(function(oError) {
			 				sap.m.MessageBox.error("cannot fetch the data");
			 		});

			 },

			 groupCodeCheck : function(oEvent){
			 	var groupModel = this.getView().getModel("groupModel");
			 	var groupCode = groupModel.getData().groupCode;
			 	var groupJson = this.getView().getModel("groupModelInfo").getData().results;
				var viewModel = this.getView().getModel("viewModel");

			 	function getGroupCode(groupCode) {
			 				return groupJson.filter(
			 					function (data) {
			 						return data.groupCode === groupCode;
			 					}
			 				);
			 			}

			 			var found = getGroupCode(groupCode);
			 			if(found.length > 0){
			 				groupModel.getData().groupName = found[0].groupName;
			 				groupModel.getData().description = found[0].description;
							viewModel.setProperty("/buttonText", "Update");
							viewModel.setProperty("/deleteEnabled", true);
			 				groupModel.refresh();
			 			}else{
			 				groupModel.getData().groupName = "";
			 				groupModel.getData().description = "";
							viewModel.setProperty("/buttonText", "Save");
							viewModel.setProperty("/deleteEnabled", false);
			 				groupModel.refresh();
			 			}

			 },

			 clearGroup : function(){
				 var groupModel = this.getView().getModel("groupModel");
				 groupModel.getData().groupName = "";
					groupModel.getData().description = "";
					groupModel.getData().groupCode = "";
					groupModel.refresh();
			 },

			 deleteGroup : function(){
			 	var that = this;
			 	 var groupModel = this.getView().getModel("groupModel");
			 	 var groupCode = groupModel.getData().groupCode;
			 	 var groupJson = this.getView().getModel("groupModelInfo").getData().results;
			 	 function getGroupCode(groupCode) {
			 				return groupJson.filter(
			 					function (data) {
			 						return data.groupCode === groupCode;
			 					}
			 				);
			 			}

			 			var found = getGroupCode(groupCode);
			 			if(found.length > 0){

			 				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			 				 "/Groups('" + found[0].id + "')", "DELETE", {},{}, this)
			 					.then(function(oData) {
			 					sap.m.MessageBox.success("Deleted successfully");
								groupModel.getData().groupCode = "";
			 					groupModel.getData().groupName = "";
			 					groupModel.getData().description = "";
			 					groupModel.refresh();
			 					that._onRouteMatched();
			 					}).catch(function(oError) {
			 							sap.m.MessageBox.error("Could not delete the entry");
			 					});

			 			}
			 			else{
			 				sap.m.MessageBox.error("Data not available");
			 			}

			 },

			 saveGroup : function(){
			 	var that = this;
			 	 var groupModel = this.getView().getModel("groupModel");
			 	 var groupCode = groupModel.getData().groupCode;
			 	 var groupJson = this.getView().getModel("groupModelInfo").getData().results;
			 	 function getGroupCode(groupCode) {
			 	 			return groupJson.filter(
			 	 				function (data) {
			 	 					return data.groupCode === groupCode;
			 	 				}
			 	 			);
			 	 		}

			 	 		var found = getGroupCode(groupCode);
			 	 		if(found.length > 0){

			 	 			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			 	 			 "/Groups('"+found[0].id+"')", "PUT", {},groupModel.getData() , this)
			 					.then(function(oData) {
			 	 				sap.m.MessageBox.success("Data saved successfully");
			 					that._onRouteMatched();
			 	 				}).catch(function(oError) {
			 	 						sap.m.MessageBox.error("Data could not be saved");
			 	 				});

			 	 		}
			 			else{
			 				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			 				 "/Group", "POST", {},groupModel.getData() , this)
			 					.then(function(oData) {
			 					sap.m.MessageBox.success("Data saved successfully");
			 					that._onRouteMatched();
			 					}).catch(function(oError) {
			 							sap.m.MessageBox.error("Data could not be saved");
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
					var sObjectPath = this.getModel().createKey("group", {
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
