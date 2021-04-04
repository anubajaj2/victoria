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

		return BaseController.extend("victoria.controller.Inventory", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			productId: "",
			customerId:"",
			globalDate: "",
			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : false,
						delay : 0,
						dateValue: new Date(),
						entryType: "Sold",
						ProductCode: "",
						Qty: 0	,
						Weight:0,
						CustomerCode: "",
						Remarks:""
					});

				var oJamaModel = new JSONModel({
					"items": [{	"Id": "",
								"Date": "",
								"Time": "",
								"ProductCode": "D",
								"Category":"D",
								"Qty":0,
								"Weight":0,
								"CustomerCode": "S",
								"City": "D",
								"Remarks":""}]
				});
				var oNaamModel = new JSONModel({
					"items": [{	"Id": "",
								"Date": "",
								"Time": "",
								"ProductCode": "W",
								"Category":"",
								"Qty":0,
								"Weight":0,
								"CustomerCode": "F",
								"City": "E",
								"Remarks":""}]
				});
				this.setModel(oJamaModel, "jama");
				this.setModel(oNaamModel, "naam");

				this.loadDataInTables();
//				this.getRouter().getRoute("Products").attachPatternMatched(this._onObjectMatched, this);
//
//				// Store original busy indicator delay, so it can be restored later on
//				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
				//this.getView().byId("dateEntry").setValue(this.getCurrentDateQuery()[0]);
//				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
//						// Restore original busy indicator delay for the object view
//						oViewModel.setProperty("/delay", iOriginalBusyDelay);
//					}
//				);
			},
			onSubmit: function(oEvent){
				this.createInventory();
			},
			onClear: function(oEvent){
				this.byId("idRemarks").setValue("");
				this.byId("idEntryType").getSelectedKey(2);
				this.byId("idQty").setValue("0");
				this.byId("idWeight").setValue("0");
				this.byId("customerCode").setValue("");
				this.byId("productInput").setValue("");
			},
			createInventory: function(){
				var that = this;
				var updatedData = {
						"Comments": this.byId("idRemarks").getValue(),
						"Customer": this.customerId,
						"Weight": parseFloat(this.byId("idWeight").getValue()),
						"Extra": null,
						"InventoryTransactionType": parseFloat(this.byId("idEntryType").getSelectedKey()),
						"Quantity": parseFloat(this.byId("idQty").getValue()),
						"TransactionCreatedDate": this.convertToJSONDate(this.byId("dateEntry").getYyyymmdd()),
						"TransactionModifiedDate": this.convertToJSONDate(this.byId("dateEntry").getYyyymmdd()),
						"InventoryTransactionTypeDetails":{
							"__metadata": { "uri":
								"http://localhost:8080/bhavysoft/galaxyService.svc" +
								"/InventoryTransactionTypes("+ this.byId("idEntryType").getSelectedKey() +")" }
						},
						"ProductDetails":{
							"__metadata": { "uri": "http://localhost:8080/bhavysoft" +
									"/galaxyService.svc/Products("+ this.productId  +")" }
						},
						"CustomerDetails":{
						"__metadata": { "uri": "http://localhost:8080/bhavysoft" +
								"/galaxyService.svc/Customers("+ this.customerId +")" }
						}
				};
//				delete updatedData.CustomerDetails;
//				delete updatedData.InventoryTransactionTypeDetails;
//				delete updatedData.OrderDetails;
//				delete updatedData.ProductDetails;
//				delete updatedData.PurchaseOrderDetails;
//				delete updatedData.PurchaseOrderDetailDetails;

				this.getModel().create("/InventoryTransactions",updatedData,{
					success: function(){
						MessageToast.show("Created successfully");
						that.loadDataInTables();
					}
				});
			},
			selectedCustomer: function(oEvent){
				var item = oEvent.getParameter("selectedItem");
				var key = item.getText();
				var keya = item.getKey();
				var that = this;
				console.log(key);console.log(keya);
				this.getModel().read("/Customers(" + keya + ")",{
					urlParameters: {"$expand": "CitycodeDetails" },
					success: function(data){
						that.customerId = data.Id;
						that.byId("lblCustomer").setText(data.FirstName + ", "+ data.CitycodeDetails.Name);
					}
				} );
			},
			selectedProduct: function(oEvent){
				var item = oEvent.getParameter("selectedItem");
				var key = item.getText();
				var keya = item.getKey();
				var that = this;
				console.log(key);console.log(keya);
				this.getModel().read("/Products(" + keya + ")",{
					success: function(data){
						that.productId = data.Id;
						that.byId("lblProduct").setText(data.ProductName + ", "+ data.Category);
					}
				} );
			},
			stringToDate: function(_date,_format,_delimiter)
			{
			            var formatLowerCase=_format.toLowerCase();
			            var formatItems=formatLowerCase.split(_delimiter);
			            var dateItems=_date.split(_delimiter);
			            var monthIndex=formatItems.indexOf("mm");
			            var dayIndex=formatItems.indexOf("dd");
			            var yearIndex=formatItems.indexOf("yyyy");
			            var month=parseInt(dateItems[monthIndex]);
			            month-=1;
			            var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
			            return formatedDate;
			},
			getDatesFromDate: function(date){
				var yyyy = date.substring(0,4);
				var mm = date.substring(4,6);
				var dd = date.substring(6,8);
				var today = yyyy+'-'+mm+'-'+dd + 'T00:00:00';
				var someDate = new Date(yyyy+'-'+mm+'-'+dd);
				someDate.setDate(someDate.getDate() + 1);
				var newDate = someDate.toISOString().substr(0,10);
				var yyyy = newDate.substring(0,4);
				var mm = newDate.substring(5,7);
				var dd = newDate.substring(8,10);
				var nextDay = yyyy+'-'+mm+'-'+dd + 'T00:00:00';
				return [today,nextDay];
			},
			convertToJSONDate : function (date){
				var yyyy = date.substring(0,4);
				var mm = date.substring(4,6);
				var dd = date.substring(6,8);
				var d = new Date();
				var today = yyyy+'-'+mm+'-'+dd + 'T00:00:00';
				var dt = new Date(yyyy+'-'+mm+'-'+dd);
				//dt.setDate(dt.getDate() - 1);

				  var newDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
				  return '/Date(' + newDate.getTime() + ')/';
				},
			dateChanged: function(oEvent){
				var Dates = oEvent.getParameter("newYyyymmdd");
				this.globalDate = Dates;
				console.log(Dates);
				var that = this;
				var oFilter1 = new Filter("TransactionCreatedDate","GE",
						this.getDatesFromDate(Dates)[0]);
				var oFilter2 = new Filter("TransactionCreatedDate","LE",
						this.getDatesFromDate(Dates)[1]);

				var oFilter = new Filter({
					filters:[oFilter1,oFilter2],
					and:true
				});
				var aFilters = [oFilter];
				var dataJama = [], dataNaam = [];
				var oJamaModel = this.getModel("jama");
				var oNaamModel = this.getModel("naam");

				this.getModel().read("/InventoryTransactions",{
					urlParameters: {"$expand": "ProductDetails,CustomerDetails,CustomerDetails/CitycodeDetails" },
					filters: aFilters,
					success: function(data){

						for (var i = 0; i < data.results.length; i++) {
							var record = data.results[i];
							if(record.InventoryTransactionType == 1){
								var recordJama = {	"Id": record.Id,
										"Date": record.TransactionCreatedDate,
										"ProductCode": record.ProductDetails.ProductName,
										"Category":record.ProductDetails.Category,
										"Qty":record.Quantity	,
										"Weight":record.Weight,
										"CustomerCode": record.CustomerDetails.FirstName,
										"City": record.CustomerDetails.CitycodeDetails.Name,
										"Remarks":record.Comments };
								dataJama.push(recordJama);
							}
							else{
								var recordNaam = {	"Date": record.TransactionCreatedDate,
										"ProductCode": record.ProductDetails.ProductName,
										"Category":record.ProductDetails.Category,
										"Qty":record.Quantity	,
										"Weight":record.Weight,
										"CustomerCode": record.CustomerDetails.FirstName,
										"City": record.CustomerDetails.CitycodeDetails.Name,
										"Remarks":record.Comments };
								dataNaam.push(recordNaam);
							}
						}
						oJamaModel.setProperty("/items",dataJama);
						oNaamModel.setProperty("/items",dataNaam);
					}
				} );
			},
			loadDataInTables: function(){
				var oDataModel = this.getOwnerComponent().getModel();
				var dataJama = [], dataNaam = [];
				var oJamaModel = this.getModel("jama");
				var oNaamModel = this.getModel("naam");

//				var rightNow = new Date();
//				var res = rightNow.toISOString().slice(0,10).replace(/-/g,"");
				var Dates = this.byId("dateEntry").getYyyymmdd();
				if (Dates == ""){
					var rightNow = new Date();
					var Dates = rightNow.toISOString().slice(0,10).replace(/-/g,"");
				}
				this.globalDate = Dates;
				console.log(Dates);
				var that = this;
				var oFilter1 = new Filter("TransactionCreatedDate","GE",
						this.getDatesFromDate(Dates)[0]);
				var oFilter2 = new Filter("TransactionCreatedDate","LE",
						this.getDatesFromDate(Dates)[1]);

				var oFilter = new Filter({
					filters:[oFilter1,oFilter2],
					and:true
				});
				var aFilters = [oFilter];

				oDataModel.read("/InventoryTransactions",{
					urlParameters: {"$expand": "ProductDetails,CustomerDetails,CustomerDetails/CitycodeDetails" },
					filters: aFilters,
					success: function(data){

						for (var i = 0; i < data.results.length; i++) {
							var record = data.results[i];
							if(record.InventoryTransactionType == 1){
								var recordJama = {	"Id": record.Id,
										"Date": record.TransactionCreatedDate,
										"ProductCode": record.ProductDetails.ProductName,
										"Category":record.ProductDetails.Category,
										"Qty":record.Quantity	,
										"Weight":record.Weight,
										"CustomerCode": record.CustomerDetails.FirstName,
										"City": record.CustomerDetails.CitycodeDetails.Name,
										"Remarks":record.Comments };
								dataJama.push(recordJama);
							}
							else{
								var recordNaam = {	"Date": record.TransactionCreatedDate,
										"ProductCode": record.ProductDetails.ProductName,
										"Category":record.ProductDetails.Category,
										"Qty":record.Quantity	,
										"Weight":record.Weight,
										"CustomerCode": record.CustomerDetails.FirstName,
										"City": record.CustomerDetails.CitycodeDetails.Name,
										"Remarks":record.Comments };
								dataNaam.push(recordNaam);
							}
						}
						oJamaModel.setProperty("/items",dataJama);
						oNaamModel.setProperty("/items",dataNaam);
					}
				} );
			},
			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */
			getCurrentDateQuery: function(){
				var today = new Date();
				var dd = today.getDate();
				var mm = today.getMonth()+1;
				//January is 0!
				var yyyy = today.getFullYear();
				if(dd<10){
					dd='0'+dd
					}
				if(mm<10){
					mm='0'+mm
					}
				var today = yyyy+'-'+mm+'-'+dd + 'T00:00:00';
				dd = parseInt(dd) + 1;
				var nextDay = yyyy+'-'+mm+'-'+dd + 'T00:00:00';
				return [today,nextDay];
			},
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
