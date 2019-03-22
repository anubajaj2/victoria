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

		return BaseController.extend("victoria.controller.Products", {

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
				//Wastage : ReorderLevel , Customer Tunch : ListPrice
				//Alarm Below : TargetLevel
				//Price per pc/gm : QuantityPerUnit
				//Making : MinimumReorderQuantity
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						"Category": "Payal 80T",
				        "Description": "",
				        "Discontinued": 0,
				        "ListPrice": 0,
				        "MinimumReorderQuantity": 0,
				        "ProductCode": "",
				        "ProductName": "",
				        "QuantityPerUnit": "gm",
				        "ReorderLevel": 0,
				        "StandardCost": 0,
				        "SupplierIds": "1",
				        "TargetLevel": 500,
				        "Hindi":""
				        });
				var oViewModel1 = new JSONModel({
					"items":[{"text": "Silver"},{"text": "Gold"},{"text": "GS"}]
				});
				var oViewModel2 = new JSONModel({
					"items":[{"text": "gm"},{"text": "pcs"}]
				});
				
//				this.getRouter().getRoute("Products").attachPatternMatched(this._onObjectMatched, this);
//
//				// Store original busy indicator delay, so it can be restored later on
//				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "productModel");
				this.setModel(oViewModel1, "fixed");
				this.setModel(oViewModel2, "per");
//				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
//						// Restore original busy indicator delay for the object view
//						oViewModel.setProperty("/delay", iOriginalBusyDelay);
//					}
//				);
			},
			selectedProduct: function(oEvent){
				var item = oEvent.getParameter("selectedItem");
				var key = item.getText();
				var keya = item.getKey();
				var that = this;
				console.log(key);console.log(keya);
				this.getModel().read("/Products(" + keya + ")",{
					urlParameters: {"$expand": "CategoryDetails" },
					success: function(data){
						that.getModel("productModel").setData(data);
						that.getModel("productModel").setProperty("/Category",data.CategoryDetails.Category);
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
			createNewProduct: function(){
				var that = this;
				var updatedData = {
						"Description": this.byId("idDescription").getSelectedKey(),
						"Discontinued": false,
						"ListPrice": this.byId("idListPrice").getValue(),
						"MinimumReorderQuantity": this.byId("idMinimumReorderQuantity").getValue(),
						"ProductCode": this.byId("productInput").getValue(),
						"ProductName": this.byId("idProductName").getValue(),
						"QuantityPerUnit": this.byId("idQuantityPerUnit").getSelectedKey(),
						"ReorderLevel": this.byId("idReorderLevel").getValue(),
						"StandardCost": this.byId("idStandardCost").getValue(),
						"SupplierIds": "0",
						"TargetLevel": this.byId("idTargetLevel").getValue(),
						"Hindi": this.byId("idHindi").getValue(),
						"CategoryDetails":{
							"__metadata": {
								"uri": "http://localhost:8080/bhavysoft" +
										"/galaxyService.svc/Categorys("+this.getView().byId("idCategory").getSelectedKey()+")"
							}
						}
					};
				
				this.getModel().create("/Products",updatedData,{
					success: function(){
						MessageToast.show("Created successfully");
					}
				});
			},
			updateProduct: function(){
				var that = this;
				var updatedData = {
						"Description": this.byId("idDescription").getSelectedKey(),
						"Discontinued": false,
						"ListPrice": this.byId("idListPrice").getValue(),
						"MinimumReorderQuantity": this.byId("idMinimumReorderQuantity").getValue(),
						"ProductCode": this.byId("productInput").getValue(),
						"ProductName": this.byId("idProductName").getValue(),
						"QuantityPerUnit": this.byId("idQuantityPerUnit").getSelectedKey(),
						"ReorderLevel": this.byId("idReorderLevel").getValue(),
						"StandardCost": this.byId("idStandardCost").getValue(),
						"SupplierIds": "0",
						"TargetLevel": this.byId("idTargetLevel").getValue(),
						"Hindi": this.byId("idHindi").getValue(),
						"CategoryDetails":{
							"__metadata": {
								"uri": "http://localhost:8080/bhavysoft" +
										"/galaxyService.svc/Categorys("+this.getView().byId("idCategory").getSelectedKey()+")"
							}
						}
					};
				this.getModel().update("/Products("+ that.getModel("productModel").getProperty("/Id")+ ")",updatedData,{
					success: function(){
						MessageToast.show("Updated successfully");
					}
				});
			},
			clearValues : function(){
				this.getModel("productModel").setProperty("/Id", "");
				this.getModel("productModel").setProperty("/Description", "");
				this.getModel("productModel").setProperty("/ProductCode", "");
				this.getModel("productModel").setProperty("/ProductName", "");
				this.getModel("productModel").setProperty("/ListPrice", 0);
				this.getModel("productModel").setProperty("/MinimumReorderQuantity", 0);
				this.getModel("productModel").setProperty("/ReorderLevel", 0);
				this.getModel("productModel").setProperty("/StandardCost", 0);
				this.getModel("productModel").setProperty("/TargetLevel", 500);
			},
			deleteProduct: function(){
				var that = this;
				this.getModel().remove("/Products("+ that.getModel("productModel").getProperty("/Id")+ ")",{
					success: function(){
						MessageToast.show("Deleted successfully");
						that.clearValues();
					}
				});
			},
			Save: function(){
				var that = this;
				var aFilters = [];
				var oFilter = new Filter("ProductCode", "EQ", that.getModel("productModel").getProperty("/ProductCode"));
				aFilters.push(oFilter);
				this.getModel().read("/Products",{
					filters: aFilters,
					success: function(data){
						
						if(data.results.length === 0){
							that.createNewProduct();
						}
						else{
							that.updateProduct();
						}
					}
				} );
			},
			Delete: function(){
				
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