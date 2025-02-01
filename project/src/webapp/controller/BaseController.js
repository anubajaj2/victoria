sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"victoria/dbapi/dbapi",
	"sap/m/MessageBox",
	'sap/m/MessagePopover',
	"sap/m/MessageToast",
	'sap/m/MessageItem',
	"victoria/models/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(jQuery, Controller, History, JSONModel, ODataHelper, MessageBox, MessagePopover, MessageToast, MessageItem, formatter, Filter, FilterOperator) {
	"use strict";
	var oTargetField;
	var oSDCField;
	var oUsernameField;
	var oSystemField;
	var oClientField;
	return Controller.extend("victoria.controller.BaseController", {

		formatter: formatter,

		/**
		 * Global Variables used in all controllers
		 * Defining the formatters here allows the use in all controllers that extends the base controller
		 * Also defined the models here so that all controllers would be able to access them
		 *
		 */
		ODataHelper: ODataHelper,
		secureToken: "",
		currentUser: "",
		bUserTestcases: true,
		oViewModel: undefined,
		oMasterList: undefined,
		oMasterPage: undefined,
		oDetailPage: undefined,
		oViewTable: undefined,
		oEditTable: undefined,
		oEventBus: undefined,
		oTestcaseListModel: undefined,
		sUrlTargetSystem: undefined,
		toggleTableState: true,
		deduction: 0,
		DeductionCash: 0,
		DeductionGold: 0,
		DeductionSilver: 0,
		allMasterData: {
			"customers": [],
			"customersId": [],
			"materials": [],
			"materialsId": [],
			"orderHeader": [],
			"wholeSaleHeader": [],
			"customCalculations": [],
			"cities": [],
			"users": [],
			"stockItems": [],
			"groups": []
		},

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		onInit: function() {
			// var that = this;
			// this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/AppUsers", "GET", null, null, this)
			// 	.then(function(oData) {
			// 		that.getView().setBusy(false);
			// 	}).catch(function(oError) {
			// 		var oPopover = that.getErrorMessage(oError);
			// 	});

			var that = this;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/StockItems", "GET", null, null, this)
				.then(function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						that.allMasterData.stockItems[oData.results[i].OrderNo] = oData.results[i];
					}
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/AppUsers", "GET", null, null, this)
				.then(function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						that.allMasterData.users[oData.results[i].TechnicalId] = oData.results[i];
					}
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/WSOrderHeaders", "GET", null, null, this)
				.then(function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						that.allMasterData.wholeSaleHeader[oData.results[i].id] = oData.results[i];
					}
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/OrderHeaders", "GET", null, null, this)
				.then(function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						that.allMasterData.orderHeader[oData.results[i].id] = oData.results[i];
					}
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Customers", "GET", null, null, this)
				.then(function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						that.allMasterData.customers[oData.results[i].id] = oData.results[i];
						that.allMasterData.customersId[oData.results[i].CustomerCode] = oData.results[i];
					}

					var currentUser = that.getModel("local").getProperty("/CurrentUser");
					if (that.getModel("local").oData.AppUsers[currentUser].Role !== "Admin") {

						var oFilter1 = new Filter([
							new sap.ui.model.Filter("CustomerCode", sap.ui.model.FilterOperator.EQ, "")
						], true);
						that.getView().byId("idTable1").getBinding("items").filter(oFilter1);
						// return;
						that.getView().setBusy(false);

						var customers = that.allMasterData.customers;
						var final = [];

						function sizeObj(obj) {
							return Object.keys(obj).length;
						}


						// for(var i=0;i<c;i++){
						for (var j in customers) {
							//
							var grp = customers[j].Group;
							var hide = that.allMasterData.groups[grp].hide;
							if (hide === false) {
								final.push(customers[j]);
								// 															break;
							}
						}
						// }



						that.getView().getModel("local").setProperty("/finalCustomer", final);
						// that.getView().byId("idTable1").setVisible();
					} else {

						function sizeObj(obj) {
							return Object.keys(obj).length;
						}
						var customers = that.allMasterData.customers;
						var c = sizeObj(customers);
						var finals = [];
						// for(var i=0;i<c;i++){
						for (var j in customers) {
							finals.push(customers[j]);
							// break;
						}
						// }

						that.getView().getModel("local").setProperty("/finalCustomer", finals);
					}
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Products", "GET", null, null, this)
				.then(function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						that.allMasterData.materials[oData.results[i].id] = oData.results[i];
						that.allMasterData.materialsId[oData.results[i].ProductCode] = oData.results[i];
					}
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Cities", "GET", null, null, this)
				.then(function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						that.allMasterData.cities[oData.results[i].id] = oData.results[i];
					}
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Groups", "GET", null, null, this)
				.then(function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						that.allMasterData.groups[oData.results[i].id] = oData.results[i];
						// that.allMasterData.groups[oData.results[i].CustomerCode] = oData.results[i];
					}
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});
			this.fetchValuesFromCustomizing();

		},
		onAfterRendering: function() {
			$("input[type='Number']").focus(function() {
				$(this).select();
			});
		},

		onBeforeShow: function(evt) {
			alert("hello");
		},
		fetchValuesFromCustomizing: function() {
			var that = this;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/CustomCalculations", "GET", null, null, this)
				.then(function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						that.allMasterData.customCalculations[oData.results[i].id] = oData.results[i];
					}
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});
		},
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},
		getCurrentUser: function() {
			return this.currentUser;
		},
		logOutApp: function(Reload) {

			var that = this;
			// var accessToken = that.getView().getModel("local").getProperty("/Authorization");
			var accessToken = that.getView().getModel().getHeaders().Authorization;
			if (accessToken) {
				$.post('/api/Users/logout?access_token=' + accessToken, {})
					.done(function(data, status) {
						that.getView().getModel("local").setProperty("/Authorization", "");

						that.getView().getModel().setHeaders({
							"Authorization": ""
						});
						that.redirectLoginPage("X", Reload);
					})
					.fail(function(xhr, status, error) {
						sap.m.MessageBox.error("Logout failed");
					});

				// that.redirectLoginPage("X", Reload);

			} else {

				that.redirectLoginPage("X", Reload);
			}

		},
		//fieldId: "",
		getCustomerPopup: function(oEvent) {
			if (!this.searchPopup) {
				var that = this;
				this.searchPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
				this.getView().addDependent(this.searchPopup);
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: '/Customers',
					template: new sap.m.DisplayListItem({
						label: "{CustomerCode}",
						value: {
							parts: [{
								path: "Name"
							}, {
								path: "City"
							}],
							formatter: function(Name, City) {
								return Name + "-" + that.allMasterData.cities[City].cityName
							}
						}
					}),
					sorter: new sap.ui.model.Sorter("CustomerCode")
				});
			}
			// this.fieldId = oEvent.getSource().getId();
			// if (this.fieldId.split("--")[2] === "idCoKarigar") {
			// 	var title = this.getView().getModel("i18n").getProperty("karigarSearch");
			// 	this.searchPopup.setTitle(title);
			// } else {
			// 	var title = this.getView().getModel("i18n").getProperty("customer");
			// 	this.searchPopup.setTitle(title);
			// }
			this.searchPopup.open();
		},

		onSearch: function(oEvent) {
			var searchStr = oEvent.getParameter("value");
			oFilter = [];
			if (!searchStr) {
				searchStr = oEvent.getParameter("newValue");
			}
			if (searchStr) {
				var oFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("CustomerCode", sap.ui.model.FilterOperator.Contains, searchStr.toUpperCase()),
						new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, searchStr.toUpperCase())
					],
					and: false
				});
			}
			// var oFilter = new sap.ui.model.Filter({
			// 	filters: [
			// 		new sap.ui.model.Filter("CustomerCode", sap.ui.model.FilterOperator.Contains, searchStr),
			// 		new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, searchStr)
			// 	],
			// 	and: false
			// });
			this.searchPopup.getBinding("items").filter(oFilter);
		},
		getKachhiCustPopup: function(oEvent) {
			if (!this.kCustomersearchPopup) {
				this.kCustomersearchPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
				this.getView().addDependent(this.kCustomersearchPopup);
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.kCustomersearchPopup.setTitle(title);
				var oFilter1 = new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "Kata Center");
				this.kCustomersearchPopup.bindAggregation("items", {
					path: '/Customers',
					filters: [oFilter1],
					template: new sap.m.DisplayListItem({
						label: "{CustomerCode}",
						value: "{Name} - {city}"
					})
				});
			}
			this.kCustomersearchPopup.open();
		},

		getKarigarPopup: function(oEvent) {
			var that = this;
			if (!this.karigarsearchPopup) {
				this.karigarsearchPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
				this.getView().addDependent(this.karigarsearchPopup);
				var title = this.getView().getModel("i18n").getProperty("karigarSearch");
				this.karigarsearchPopup.setTitle(title);
				var oFilter1 = new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "Karigar");
				this.karigarsearchPopup.bindAggregation("items", {
					path: '/Customers',
					template: new sap.m.DisplayListItem({
						label: "{CustomerCode}",
						value: {
							parts: [{
								path: "Name"
							}, {
								path: "City"
							}],
							formatter: function(Name, City) {

								return Name + "-" + that.allMasterData.cities[City].cityName
							}
						}
					})
				});
			}
			this.karigarsearchPopup.open();
		},

		orderPopup: function(oEvent) {
			//call the popup screen dynamically

			// if (!this.orderSearchPopup) {
			this.orderSearchPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
			// this.getView().addDependent(this.orderSearchPopup);
			var title = this.getView().getModel("i18n").getProperty("orderSearch");
			this.orderSearchPopup.setTitle(title);
			// this.getView().setBusy(false);
			// this.orderSearchPopup.sId = 'orderNo';

			var orderDate = this.byId("Sales--DateId").getValue();
			var customer = this.getView().getModel('local').getProperty('/orderHeader').Customer;
			//when you sending date to filter use date Object var oObj = new Date(yyyymmdd);

			var dateFrom = new Date(orderDate);
			dateFrom.setHours(0, 0, 0, 1)
			var dateTo = new Date(orderDate);
			dateTo.setHours(23, 59, 59, 59)
			//Now you have to have 2 date Object
			//firstDate object set the time to 000000 second object 240000
			//now create 2 filter one ge low and two le High
			var oFilter1 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, dateFrom);
			var oFilter2 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, dateTo);
			if (customer) {
				var oFilter3 = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, customer);
			} else {
				var oFilter3 = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, "");
			}

			var orFilter = new sap.ui.model.Filter({
				filters: [oFilter1, oFilter2],
				and: true
			});
			var orFilterF = new sap.ui.model.Filter({
				filters: [orFilter, oFilter3],
				and: true
			});

			// this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			//     "/OrderHeaders", "GET", {expand: "ToCustomers",filters: orFilter}, {}, this)
			//   .then(function(oData) {
			//
			//   }).catch(function(oError) {
			//
			//   });
			this.orderSearchPopup.bindAggregation("items", {
				path: '/OrderHeaders',
				filters: orFilter,
				template: new sap.m.DisplayListItem({
					label: "{OrderNo}",
					value: {
						path: 'Customer',
						formatter: this.getCustomerName.bind(this)
					}
				})
			});
			// }//order popup
			this.getView().addDependent(this.orderSearchPopup);
			this.orderSearchPopup.open();
		},
		getCustomerName: function(custId) {
			return this.allMasterData.customers[custId].CustomerCode + "-" + this.allMasterData.customers[custId].Name
		},
		getMaterialPopup: function() {
			if (!this.matSearchPopup) {
				this.matSearchPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
				this.getView().addDependent(this.matSearchPopup);
				var title = this.getView().getModel("i18n").getProperty("matSearch");
				this.matSearchPopup.setTitle(title);
				this.matSearchPopup.bindAggregation("items", {
					path: '/Products',
					template: new sap.m.DisplayListItem({

						label: "{ProductCode}",
						value: "{ProductName}"
					})
				});
			}
			this.matSearchPopup.open();

		},

		getDialogPopup: function() {
			if (!this.oDialogPopup) {
				this.oDialogPopup = new sap.ui.xmlfragment("idDialog", "victoria.fragments.Dialog", this);
				// sap.ui.getCore().getMessageManager().registerObject(this.oSuppPopup, true);
				this.getView().addDependent(this.oDialogPopup);
			}
			this.oDialogPopup.open();
		},
		getReasgnPopup: function() {
			if (!this.ReasgnPopup) {
				this.ReasgnPopup = new sap.ui.xmlfragment("idReDialog", "victoria.fragments.Dialog", this);
				// sap.ui.getCore().getMessageManager().registerObject(this.oSuppPopup, true);
				this.getView().addDependent(this.ReasgnPopup);
			}
			this.ReasgnPopup.open();
		},
		getFormPopup: function() {
			if (!this.oFormPopup) {
				this.oFormPopup = new sap.ui.xmlfragment("victoria.fragments.SimpleForm", this);
				// sap.ui.getCore().getMessageManager().registerObject(this.oSuppPopup, true);
				this.getView().addDependent(this.oFormPopup);
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.oFormPopup.setTitle(title);
			}
			this.oFormPopup.open();
		},

		getBatchPopup: function() {
			if (!this.oSuppPopup) {
				this.oSuppPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
				// sap.ui.getCore().getMessageManager().registerObject(this.oSuppPopup, true);
				this.getView().addDependent(this.oSuppPopup);
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.searchPopup.setTitle(title);
			}
			this.oSuppPopup.open();
		},

		getQuery: function(oEvent) {
			var queryString = oEvent.getParameter("query");
			if (!queryString) {
				queryString = oEvent.getParameter("value");
			}
			return queryString;
		},

		getSelectedKey: function(oEvent, key, label) {
			var key = oEvent.getParameter("selectedItem").getValue();
			var label = oEvent.getParameter("selectedItem").getLabel();
			var sPath = oEvent.getParameter("selectedItem").getBindingContextPath();
			var id = this.getView().getModel().getProperty(sPath).id;
			return [key, label, id];

		},

		getObjListSelectedkey: function(oEvent) {

			var title = oEvent.getParameter("selectedItem").getTitle();
			var intro = oEvent.getParameter("selectedItem").getIntro();
			var number = oEvent.getParameter("selectedItem").getNumber();
			var sPath = oEvent.getParameter("selectedItem").getBindingContextPath();
			var id = this.getView().getModel().getProperty(sPath).id;
			return [title, intro, number, id];

		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getOwnerComponent().getModel(sName);
		},

		messagePoper: null,
		createMessagePopover: function() {
			var that = this;
			if (!this.messagePoper) {
				this.messagePoper = sap.ui.xmlfragment(
					"victoria.fragments.DependencyChecker",
					this
				);
				this.getView().addDependent(this.messagePoper);
				this.messagePoper.setModel(this.getOwnerComponent().getModel("local"), "local");
			}
			this.messagePoper.open();

		},
		// Zoom in/out for UI tables
		toggleUiTable: function(btnId, headerId) {

			// if(this.toggleScreenState === true){
			if (this.toggleTableState === true) {
				this._openFullScreen(btnId, headerId);
				this.toggleTableState = false;
				this.byId(btnId).setTooltip("exit fullScreen");
			} else {
				this._closeFullScreen(btnId, headerId);
				this.toggleTableState = true;
				this.byId(btnId).setTooltip("fullScreen");
			}
			var sIcon = (this.toggleTableState ? "sap-icon://full-screen" : "sap-icon://exit-full-screen");
			this.byId(btnId).setIcon(sIcon);
		},

		_closeFullScreen: function(btnId, headerId) {

			this.getView().byId(headerId).setVisible(true);
			this.getView().oParent.oParent._oMasterNav.setVisible(true);
		},
		_openFullScreen: function(btnId, headerId) {

			this.getView().byId(headerId).setVisible(false);
			this.getView().oParent.oParent._oMasterNav.setVisible(false);
		},
		destroyMessagePopover: function() {
			if (this.messagePoper) {
				this.messagePoper.destroy();
				this.messagePoper = null;
			}
		},

		getErrorMessage: function(oError) {
			var sErrorMessages = [];
			var sResponseText;
			var oResponse;

			if (oError.statusText == "Unauthorized") {
				this.redirectLoginPage();
			}

			try {
				var sErrorMessages = oError.responseText.split(".")[1];
				if (oError.responseText.split(".")["length"] > 2) {
					sErrorMessages = oError.responseText;
				}
				if (!sErrorMessages) {
					sErrorMessages = oError.responseText.split(":")[1];
				}
			} catch (e) {
				if (oError.message) {
					sErrorMessages = ';' + oError.message;
				} else {
					return oError.responseText.split(".")[1];
				}
			}
			sErrorMessages = sErrorMessages.split(";");
			var finalMessages = [];
			for (var i = 0; i < sErrorMessages.length; i++) {
				finalMessages.push({
					type: "Error",
					description: sErrorMessages[i]
				});
			}
			if (finalMessages) {
				this.getOwnerComponent().getModel("local").setProperty("/messages", finalMessages);
				this.getOwnerComponent().getModel("local").setProperty("/messagesLength", finalMessages.length);
				this.createMessagePopover();
			}
		},
		handlevalidationDialogClose: function() {
			this.messagePoper.close();
			if (this.messagePoper) {
				this.messagePoper.destroy();
				this.messagePoper = null;
			}
		},

		handleGoldValidation: function(oValue) {
			var oGold1 = parseFloat(oValue, 10);
			if ((oGold1 < 30000 ||
					oGold1 > 80000) && oGold1 > 0) {
				var valid = false;
				return valid;
			} else {
				var valid = true;
				return valid;
			}

		},

		handleSilverValidation: function(oValue) {
			var oSilver1 = parseFloat(oValue, 10);
			if ((oSilver1 < 30000 ||
					oSilver1 > 110000) && oSilver1 > 0) {
				var valid = false;
				return valid;
			} else {
				var valid = true;
				return valid;
			}

		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		redirectLoginPage: function(logOut, Reload) {

			var that = this;
			var accessToken = that.getView().getModel().getHeaders().Authorization;
			if (logOut == "X" && Reload != "X") {
				// $.post('/api/Users/logout?access_token=' + accessToken, {})
				// 	.done(function(data, status) {
				// 		that.getView().getModel("local").setProperty("/Authorization", "");
				//
				// 		that.getView().getModel().setHeaders({
				// 			"Authorization": ""
				// 		});
				// 		// that.redirectLoginPage("X", Reload);
				// 	})
				// 	.fail(function(xhr, status, error) {
				// 	MessageBox.alert("Logout Successful");
				// 	});
				MessageBox.alert("Logout Successful");
			} else if (Reload != "X") {
				MessageBox.alert(that.resourceBundle.getText("Page11"));
			}
			window.top.location.href = "/";
		},
		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				this.getRouter().navTo("master", {}, true);
			}
		},
		getEventBus: function() {
			return sap.ui.getCore().getEventBus();
		},
		getViewModel: function() {
			return new JSONModel({
				busy: false,
				delay: 0,
				mode: "view",
				oldRec: "false",
				extendedMode: false
			});
		},

		clearData: function() {

		},

		onSwitchStateChange: function(oEvent) {

		},

		onAutoLoginCheck: function(oEvent) {
			// var state = oEvent.getSource().getSelected();
			// var oTestcaseModel = sap.ui.getCore().getModel("tcCreateModel");
			// if (state) {
			// 	oTestcaseModel.setProperty("/autoLogin", "X");
			// } else {
			// 	oTestcaseModel.setProperty("/autoLogin", "");
			// }
		},

		//conversion of server date to format "DD-MM-YYYY"
		onDateFormatted: function(oDate) {
			var dd = oDate.getDate();
			var mm = oDate.getMonth() + 1;
			var yyyy = oDate.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			return dd + '.' + mm + '.' + yyyy;
		},
		copyTextToClipboard: function(text) {
			if (!navigator.clipboard) {
				fallbackCopyTextToClipboard(text);
				return;
			}
			navigator.clipboard.writeText(text).then(function() {
				console.log('Async: Copying to clipboard was successful!');
			}, function(err) {
				console.error('Async: Could not copy text: ', err);
			});
		},
		fallbackCopyTextToClipboard: function(text) {
			var textArea = document.createElement("textarea");
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			try {
				var successful = document.execCommand('copy');
				var msg = successful ? 'successful' : 'unsuccessful';
				console.log('Fallback: Copying text command was ' + msg);
			} catch (err) {
				console.error('Fallback: Oops, unable to copy', err);
			}

			document.body.removeChild(textArea);
		},
		onSystemHelp: function(oEvent) {
			// oSystemField = oEvent.getSource();
			// if (!this.systemHelpDialog) {
			// 	this.systemHelpDialog = sap.ui.xmlfragment(
			// 		"victoria.fragment.SystemValueHelp",
			// 		this
			// 	);
			// }
			// this.getView().addDependent(this.systemHelpDialog);
			// this.systemHelpDialog.open();
			// this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/DefaultSDC_TargetSet", "GET", {}).then(function(oData) {
			// 		var oModel = new JSONModel();
			// 		oModel.setData(oData);
			// 		sap.ui.getCore().byId("systemDialog").setModel(oModel, "systemModel");
			// 	})
			// 	.catch(function(oError) {
			// 		jQuery.sap.log.error("Could not obtain data");
			// 	});
		},
		mapFieldsFromBaseToItem: function(itemType) {
			//map fields which are common for both of you from base to your items
			var baseItem = this.getView().getModel("local").getProperty("orderItemBase");

			if (itemType === "R") {

			} else {

			}

		},
		setVisible: function(oEvent, id) {
			var oVisModel = new sap.ui.model.json.JSONModel({
				rows1: true
			});
			//check for retail sales only
			this.setModel(oVisModel, "visModel");
			if (id) {
				var odata = this.getView().getModel('visModel');
				odata.setProperty("/rows1", false);
			} else
			if (oEvent.getParameter('name') === "sales") {
				var odata = this.getView().getModel('visModel');
				odata.setProperty("/rows1", false);
			} else
			if (oEvent.getParameter('name') === "salesws") {
				var odata = this.getView().getModel('visModel');
				odata.setProperty("/rows1", true);
			} else if (oEvent.getParameter('id')) {
				if (oEvent.getParameter('id').split('---')[1] === 'idsales') {
					var odata = this.getView().getModel('visModel');
					odata.setProperty("/rows1", false);
				} else if (oEvent.getParameter('id').split('---')[1].split('--')[0] === 'idsales') {
					var odata = this.getView().getModel('visModel');
					odata.setProperty("/rows1", false);
				}
			} else if (oEvent.getSource().getContent().getId() === "idsales") {
				var odata = this.getView().getModel('visModel');
				odata.setProperty("/rows1", false);
			} else if (oEvent.getSource().getContent().getId() === "sales-page") {
				var odata = this.getView().getModel('visModel');
				odata.setProperty("/rows1", false);
			}
		},

		focusAndSelectNextInput: function(currentBoxId, id) {

			setTimeout(function() {
				var textboxes = $(id);
				var findCurrentBox = textboxes.toArray().filter((i) => i.id.includes(currentBoxId));
				var currentBoxNumber = textboxes.index(findCurrentBox[0]);
				//	if(findCurrentBox.length !== 0){
				if (textboxes[currentBoxNumber + 1] != null) {
					var nextBox = textboxes[currentBoxNumber + 1]
					nextBox.focus();
					nextBox.select();
				}
				//}
			}, 300);
		},

		ValueChangeMaterial: function(oEvent) {

			var id = oEvent.getSource().getId().split('---')[1];
			if (id !== undefined) {
				if (id.split('--')[0] === 'idsales') {
					this.byId("Sales--idSaveIcon").setColor('red');
				}
			}

			var fragIndicator = sap.ui.core.Fragment.byId("fr1", "idSaveIndicator");
			if (fragIndicator) {
				fragIndicator.setColor("red");
			}

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
			var that = this;
			var oModel = oEvent.getSource().getParent().getBindingContext("orderItems");
			var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
			var orderId = null;
			if (!oModel) {
				oModel = oEvent.getSource().getParent().getBindingContext("materialPopupOrderItems");
				orderId = oHeader.id;
				var orderNoPath = oEvent.getSource().mBindingInfos.value.binding.oContext.sPath;
				if (!orderId) {
					var oFilter = new sap.ui.model.Filter("OrderNo", "EQ", oHeader.OrderNo);
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
							"/OrderHeaders",
							"GET", {
								filters: [oFilter]
							}, {}, that)
						.then(function(oData) {

							orderId = oData.results[oData.results.length - 1].id;
							orderNoPath = orderNoPath + "/OrderNo";
							that.getView().getModel("materialPopupOrderItems").setProperty(orderNoPath, orderId);
						})
				} else {
					orderNoPath = orderNoPath + "/OrderNo";
					that.getView().getModel("materialPopupOrderItems").setProperty(orderNoPath, orderId);
				}
			}

			var oModelForRow = oModel.getModel('local');
			var sBinding = oEvent.getSource().getParent().getBindingContext("orderItems");
			if (!sBinding) {
				sBinding = oEvent.getSource().getParent().getBindingContext("materialPopupOrderItems");
			}
			var sRowPath = sBinding.getPath();
			var selData = oModelForRow.getProperty(sRowPath + "/MaterialCode");
			var currentBoxId = oEvent.getSource().getId();
			var oFilter = new sap.ui.model.Filter("ProductCode", "EQ", selData.toUpperCase());
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/Products", "GET", {
						filters: [oFilter]
					}, {}, this)
				.then(function(oData) {
					console.log(oData.results[0]);
					if (oData.results[0]) {
						if (currentBoxId.includes("fr1")) {
							that.focusAndSelectNextInput(currentBoxId, "input[id*='fr1--id']");
						} else {
							that.focusAndSelectNextInput(currentBoxId, "input[id*='---idsales--']");
						}
					}

					oModelForRow.setProperty(sRowPath + "/Material", oData.results[0].id);
					if (oData.results[0].HindiName) {
						oModelForRow.setProperty(sRowPath + "/Description", oData.results[0].HindiName);
					} else {
						oModelForRow.setProperty(sRowPath + "/Description", oData.results[0].ProductName);
					}
					oModelForRow.setProperty(sRowPath + "/MaterialCode", oData.results[0].ProductCode);
					if (oData.results[0].Making) {
						oModelForRow.setProperty(sRowPath + "/Making", oData.results[0].CustomerMaking ? oData.results[0].CustomerMaking : oData.results[0].Making);
					}
					if (oData.results[0].PricePerUnit) {
						oModelForRow.setProperty(sRowPath + "/MakingD", oData.results[0].PricePerUnit);
					}
					if (oData.results[0].Tunch) {
						oModelForRow.setProperty(sRowPath + "/Tunch", oData.results[0].CustomerTunch ? oData.results[0].CustomerTunch : oData.results[0].Tunch);
					}
					oModelForRow.setProperty(sRowPath + "/Category", oData.results[0].Category);
					oModelForRow.setProperty(sRowPath + "/Type", oData.results[0].Type);
					oModelForRow.setProperty(sRowPath + "/Karat", oData.results[0].Karat);
				}).catch(function(oError) {
					// MessageToast.show("cannot fetch the data");
				});
		},

		materialPopup: null,
		onFindMaterial: function() {

			var that = this;

			var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
			if (oHeader.OrderNo !== 0 &&
				oHeader.OrderNo !== "") {
				if (!this.materialPopup) {
					this.materialPopup = new sap.ui.xmlfragment("fr1", "victoria.fragments.tableSelectDialog", this);
					this.getView().addDependent(this.materialPopup);
				}
				that.clearPopupScreen();
				var orderId = orderId = oHeader.id;
				var oFilter = null;
				if (!orderId) {
					var oFilter = new sap.ui.model.Filter("OrderNo", "EQ", oHeader.OrderNo);
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
							"/OrderHeaders",
							"GET", {
								filters: [oFilter]
							}, {}, that)
						.then(function(oData) {

							orderId = oData.results[oData.results.length - 1].id;
							orderId = "'" + orderId + "'";
							oFilter = new sap.ui.model.Filter("OrderNo", "EQ", orderId);

							that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
									"/StockItems",
									"GET", {
										filters: [oFilter]
									}, {}, that)
								.then(function(oData) {

									if (oData.results.length > 0) {
										var allItems = that.getView().getModel("materialPopupOrderItems").getProperty("/popupItemsData");
										for (var i = 0; i < oData.results.length; i++) {
											var MaterialData = that.allMasterData.materials[oData.results[i].Material];
											allItems[i].MaterialCode = MaterialData.ProductCode;
											allItems[i].Qty = Math.abs(oData.results[i].Qty);
											allItems[i].id = oData.results[i].id;
											allItems[i].Description = MaterialData.HindiName || MaterialData.ProductName;
											allItems[i].OrderNo = oData.results[i].OrderNo;
										}
										that.getView().getModel("materialPopupOrderItems").setProperty("/popupItemsData", allItems);
									}

									var fragIndicator = sap.ui.core.Fragment.byId("fr1", "idSaveIndicator");
									if (fragIndicator) {
										fragIndicator.setColor("green");
									}
								})
							setTimeout(function() {
								$("input[type='Number']").focus(function() {
									$(this).select();
								});
							}, 300);
							that.materialPopup.open();

						})
				} else {
					orderId = "'" + orderId + "'";
					oFilter = new sap.ui.model.Filter("OrderNo", "EQ", orderId);
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
							"/StockItems",
							"GET", {
								filters: [oFilter]
							}, {}, that)
						.then(function(oData) {

							if (oData.results.length > 0) {
								var allItems = that.getView().getModel("materialPopupOrderItems").getProperty("/popupItemsData");
								for (var i = 0; i < oData.results.length; i++) {
									var MaterialData = that.allMasterData.materials[oData.results[i].Material];
									allItems[i].MaterialCode = MaterialData.ProductCode;
									allItems[i].Qty = Math.abs(oData.results[i].Qty);
									allItems[i].id = oData.results[i].id;
									allItems[i].Description = MaterialData.HindiName || MaterialData.ProductName;
									allItems[i].OrderNo = oData.results[i].OrderNo;
								}
								that.getView().getModel("materialPopupOrderItems").setProperty("/popupItemsData", allItems);
							}

							var fragIndicator = sap.ui.core.Fragment.byId("fr1", "idSaveIndicator");
							if (fragIndicator) {
								fragIndicator.setColor("green");
							}
						})
					setTimeout(function() {
						$("input[type='Number']").focus(function() {
							$(this).select();
						});
					}, 300);
					that.materialPopup.open();
				}
			} else {
				var oBundle = that.getView().getModel("i18n").getResourceBundle().getText("orderValidation");
				MessageBox.show(
					oBundle, {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {}
					}
				);
			}
		},

		clearPopupScreen: function() {
			var allItems = this.getView().getModel("materialPopupOrderItems").getProperty("/popupItemsData");
			for (var i = 0; i < allItems.length; i++) {
				allItems[i].MaterialCode = "";
				allItems[i].Qty = "0";
				allItems[i].id = "";
				allItems[i].Description = "";
				allItems[i].OrderNo = "";
			}
			this.getView().getModel("materialPopupOrderItems").setProperty("/popupItemsData", allItems);

		},

		onDialogClose: function(oEvent) {
			this.materialPopup.close();
		},

		validateValue: function(oEvent) {
			var dialogSave = sap.ui.core.Fragment.byId("fr1", "dialogSave");
			if (!dialogSave) {
				dialogSave = sap.ui.core.Fragment.byId("fr2", "dialogSave");
			}
			if (oEvent.getSource().getValue() <= 0) {

				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				dialogSave.setEnabled(false);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				dialogSave.setEnabled(true);
			}
		},

		onDialogSave: function(oEvent) {

			var that = this;
			var oTableDetails = sap.ui.core.Fragment.byId("fr1", "materialPopupTable");
			if (!oTableDetails) {
				oTableDetails = sap.ui.core.Fragment.byId("fr2", "materialPopupTable");
			}
			var oBinding = oTableDetails.getBinding("rows");
			var arr = [];
			var allItems = that.getView().getModel("materialPopupOrderItems").getProperty("/popupItemsData");

			var flag = false;
			var fragIndicator = sap.ui.core.Fragment.byId("fr1", "idSaveIndicator");
			if (!fragIndicator) {
				fragIndicator = sap.ui.core.Fragment.byId("fr2", "idSaveIndicator");
			}

			for (let i = 0; i < oBinding.getLength(); i++) {
				var that = this;
				var data = oBinding.oList[i];
				if (data.id === "") {
					if (data.MaterialCode !== "") {
						if (fragIndicator) {
							fragIndicator.setColor("red");
						}
						if (data.Qty > 0) {

						} else {
							flag = true;
							break;
						}
					}
				}
			}

			if (flag === true) {
				sap.m.MessageBox.error("Can't Save! Quantity should be greater than 0");
				oEvent.getSource().setEnabled(false);
			} else {
				for (let i = 0; i < oBinding.getLength(); i++) {
					var that = this;
					var data = oBinding.oList[i];
					if (data.id === "") {
						if (data.MaterialCode !== "") {
							if (data.Qty > 0) {
								var payload = {
									data
								};
								payload.Date = this.getView().getModel('local').getProperty('/orderHeader/Date');
								payload.Qty = Math.abs(payload.Qty) * -1;
								this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/StockItems",
										"POST", {}, payload, this)
									.then(function(oData) {
										that.getView().setBusy(false);

										allItems[i].id = oData.id;
										sap.m.MessageToast.show("Data Saved Successfully");
										if (fragIndicator) {
											fragIndicator.setColor("green");
										}
										that.getView().getModel("materialPopupOrderItems").setProperty("/popupItemsData", allItems);
									}).catch(function(oError) {
										that.getView().setBusy(false);
										var oPopover = that.getErrorMessage(oError);
									});
							}
						}
					}
				}
			}
		},

		deleteReturnValues: function(oEvent, i, selIdxs, viewId, oTableData) {

			var that = this;
			var id = that.getView().getModel('returnModel').getProperty('/TransData')[selIdxs].ReturnId;
			if (id) {
				if (viewId === 'idsales') {
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/OrderReturns('" + id + "')",
						"DELETE", {}, {}, that)
				} else {
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/WSOrderReturns('" + id + "')",
						"DELETE", {}, {}, that)
				}
				sap.m.MessageToast.show("Data Deleted Successfully");
			}
			that.deleteReturn(oEvent, selIdxs);
			var oTableData = that.getView().getModel("returnModel").getProperty("/TransData");
			oTableData.splice(selIdxs, 1);
			oTableData.push({
				"Type": "",
				"Key": "",
				"ReturnId": "",
				"Weight": 0,
				"KWeight": 0,
				"Tunch": 0,
				"Qty": 0,
				"Bhav": 0,
				"Remarks": "",
				"SubTotalS": 0,
				"SubTotalG": 0,
				"SubTotal": "",
				"CreatedBy": "",
				"CreatedOn": "",
				"ChangedBy": "",
				"ChangedOn": ""
			});
			that.getView().getModel('returnModel').setProperty('/TransData', oTableData);
		},
		onReturnValue: function(oEvent) {

			if (oEvent.getSource().getId().split('---')[1].split('--')[0] == 'idsales') {
				this.byId("Sales--idSaveIcon").setColor('red');
			} else if (oEvent.getSource().getId().split('---')[1].split('--')[0] == 'idsalesws') {
				this.byId("WSHeaderFragment--idSaveIcon").setColor('red');
			}
			var userEnterValue = this.getView().byId("OrderReturn").getModel("returnModel").getProperty(oEvent.getSource().getParent().getBindingContext(
				"returnModel").getPath());
			var customCal = this.getView().getModel("local").getProperty('/CustomCalculations');
			var key = oEvent.getParameter("selectedItem").getKey();
			this.defaultValuesLoad(oEvent, userEnterValue, customCal, key);
		},
		defaultValuesLoad: function(oEvent, userEnterValue, customCal, key) {

			var that = this;
			var viewId = oEvent.getSource().getParent().getId().split('---')[1].split('--')[0];
			if (key) {
				userEnterValue.Key = key;
			}

			userEnterValue.Weight = "0";
			userEnterValue.Tunch = "0";
			userEnterValue.KWeight = "0";
			userEnterValue.Quantity = "0";
			userEnterValue.Remarks = "";
			userEnterValue.Bhav = "0";
			userEnterValue.SubTotal = "0";

			if (key === 'OG') {
				userEnterValue.Tunch = "100";
				if (viewId === 'idsales') {
					userEnterValue.Bhav = customCal.results[0].GoldReturns;
				} else {
					userEnterValue.Bhav = customCal.results[0].GoldReturns1;
				}
			} else if (key === 'BG') {
				userEnterValue.Tunch = "100";
				if (viewId === 'idsales') {
					userEnterValue.Bhav = customCal.results[0].GoldReturns;
				}
			} else if (key === 'BS') {
				userEnterValue.Tunch = "100";
				if (viewId === 'idsales') {
					userEnterValue.Bhav = customCal.results[0].SilverReturns;
				}
			} else if (key === 'OS') {
				userEnterValue.Tunch = "100";
				if (viewId === 'idsales') {
					userEnterValue.Bhav = customCal.results[0].SilverReturns;
				} else {
					userEnterValue.Bhav = customCal.results[0].SilverReturns1;
				}
			} else if (key === 'KG') {
				//only in case of retail sales load by default
				if (viewId === 'idsales') {
					userEnterValue.Bhav = customCal.results[0].GoldReturns;
				}
			} else if (key === 'KS') {
				//only in case of retail sales load by default
				if (viewId === 'idsales') {
					userEnterValue.Bhav = customCal.results[0].SilverReturns;
				}

			} else if (key === 'CASH') {
				// no default value load are required
			}
			that.getView().getModel('local').setProperty('/returnModel', userEnterValue);
		},
		onReturnChange: function(oEvent) {

			if (oEvent.getSource().getId().split('---')[1].split('--')[0] == 'idsales') {
				this.byId("Sales--idSaveIcon").setColor('red');
				var orderTemp = this.getView().getModel('local').getProperty('/orderHeaderTemp');
				if (this.orderAmount === "") {
					this.orderAmount = orderTemp.TotalOrderValue;
				}
			} else if (oEvent.getSource().getId().split('---')[1].split('--')[0] == 'idsalesws') {
				this.byId("WSHeaderFragment--idSaveIcon").setColor('red');
			};
			var path = oEvent.getSource().getParent().getBindingContext("returnModel").getPath();
			var seletedLine = this.getView().getModel('returnModel').getProperty(path);
			var sourceId = oEvent.getSource().getId().split('---')[1].split('--')[0];
			if (sourceId === 'idsales') {
				//retail sales detail
				var orderHeader = this.getView().getModel('local').getProperty('/orderHeader');
			} else {
				//WS order details
			}
			this.returnCalculation(oEvent, orderHeader, seletedLine);
			this.finalBal = this.orderAmount - this.deduction;
			if (this.finalBal === 0) {
				var finalBal = 0;
			} else {
				var finalBal = this.getIndianCurr(this.finalBal);
			}

			this.getView().getModel('local').setProperty('/orderHeaderTemp/FinalBalance', finalBal);
		},
		setReturnNewValue: function(seletedLine, fieldId, newValue) {
			//weight
			if (fieldId === 'IdWeightR') {
				if (seletedLine.Weight !== newValue) {
					seletedLine.Weight = newValue;
				}
			}
			//katta weight
			if (fieldId === 'IdKWeightR') {
				if (seletedLine.KWeight !== newValue) {
					seletedLine.KWeight = newValue;
				}
			}
			//Tunch
			if (fieldId === 'IdTunchR') {
				if (seletedLine.Tunch !== newValue) {
					seletedLine.Tunch = newValue;
				}
			}
			//Bhav value
			if (fieldId === 'IdBhavR') {
				if (seletedLine.Bhav !== newValue) {
					seletedLine.Bhav = newValue;
				}
			}
		},
		getReturnFloatValue: function(seletedLine, oFloatFormat) {
			//weight
			if (seletedLine.Weight === "") {
				var weight = 0;
				seletedLine.Weight = 0;
			} else
			if (seletedLine.Weight === 0) {
				var weight = 0;
				seletedLine.Weight = 0
			} else {
				var weight = seletedLine.Weight.toString();
				seletedLine.Weight = oFloatFormat.parse(weight);
			}
			//Katta weight
			if (seletedLine.KWeight === "") {
				var kWeight = 0;
				seletedLine.KWeight = 0;
			} else
			if (seletedLine.KWeight === 0) {
				var kWeight = 0;
				seletedLine.KWeight = 0;
			} else {
				var kWeight = seletedLine.KWeight.toString();
				seletedLine.KWeight = oFloatFormat.parse(kWeight);
			}
			//tunch
			if (seletedLine.Tunch === "") {
				var tunch = 0;
				seletedLine.Tunch = 0;
			} else
			if (seletedLine.Tunch === 0) {
				var tunch = 0;
				seletedLine.Tunch = 0;
			} else {
				var tunch = seletedLine.Tunch.toString();
				seletedLine.Tunch = oFloatFormat.parse(tunch);
			}
			//bhav
			if (seletedLine.Bhav === "") {
				var bhav = 0;
				seletedLine.Bhav = 0;
			} else
			if (seletedLine.Bhav === 0) {
				var bhav = 0;
				seletedLine.Bhav = 0;
			} else {
				var bhav = seletedLine.Bhav.toString();
				seletedLine.Bhav = oFloatFormat.parse(bhav);
			}
		},
		returnCalculation: function(oEvent, orderHeader, data) {

			if (oEvent.getId() === 'orderReload') {
				var seletedLine = this.getView().getModel('returnModel').getProperty(data);
				// var category = this.getView().byId("OrderReturn").getModel("returnModel").getProperty(data);
				var path = data;
				var cells = this.getView().byId("OrderReturn")._getVisibleColumns();
				viewId = oEvent.viewId;
			} else {
				var seletedLine = data;
				var newValue = oEvent.getParameters().newValue;
				var fieldId = oEvent.getParameters().id.split('---')[1].split('--')[1].split('-')[0];
				var viewId = oEvent.getSource().getId().split('---')[1].split('--')[0];
				var oCurrentRow = oEvent.getSource().getParent();
				var cells = oCurrentRow.getCells();
				// this.getView().getModel('local').setProperty('/OrderReturn',seletedLine);
			}
			var oLocale = new sap.ui.core.Locale("en-US");
			var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
			if (newValue) {
				this.setReturnNewValue(seletedLine, fieldId, newValue);
			}
			this.getReturnFloatValue(seletedLine, oFloatFormat);

			if (seletedLine.Key === 'OG' ||
				seletedLine.Key === 'KG' ||
				seletedLine.Key === 'BG') {
				if (seletedLine.Key === 'BG') {
					seletedLine.Tunch = 100;
				}
				var bhavF = seletedLine.Bhav / 10;
				var weightF = seletedLine.Weight - seletedLine.KWeight;
				var fineGold = (seletedLine.Tunch * weightF) / 100;
				var subtotGold = parseFloat(fineGold).toFixed(3);
				var subTotal = fineGold * bhavF;
				var subTotalNoDecimal = parseFloat(subTotal).toFixed(0);
				subTotalNoDecimal = this.getIndianCurr(subTotalNoDecimal);
				var subTotF = this.getIndianCurr(subTotal)
				if ((seletedLine.SubTotal) && (seletedLine.SubTotal !== "")) {
					var currentSubTot = oFloatFormat.parse(seletedLine.SubTotal);
					this.deduction = subTotal + this.deduction - currentSubTot;
				} else {
					this.deduction = subTotal + this.deduction;
				}
				var deduction = this.deduction;
				var deductionF = this.getIndianCurr(deduction);
				if (path) {
					seletedLine.SubTotal = subTotF;
					if (viewId == 'idsalesws') {
						seletedLine.SubTotal = subTotalNoDecimal;
						if (subTotal) {
							seletedLine.SubTotalG = 0
							seletedLine.SubTotalS = 0;
						} else {
							seletedLine.SubTotal = 0;
							seletedLine.SubTotalG = subtotGold;
							seletedLine.SubTotalS = 0;
						}
					} else {

						if (deductionF === '0' || deductionF === '') {
							deductionF = '0';
						}
						this.getView().getModel('local').setProperty('/orderHeaderTemp/Deduction', deductionF);
					}
					this.getView().byId("OrderReturn").getModel("returnModel").setProperty(path, seletedLine);
				} else {
					cells[cells.length - 1].setText(subTotF);
					if (viewId == 'idsalesws') {
						cells[cells.length - 1].setText(subTotalNoDecimal);
						if (subTotF) {
							cells[cells.length - 2].setText(0);
						} else {
							cells[cells.length - 2].setText(subtotGold);
							cells[cells.length - 3].setText(0);
						}
					} else {

						if (deductionF === '0' || deductionF === '') {
							deductionF = '0';
						}
						this.getView().getModel('local').setProperty('/orderHeaderTemp/Deduction', deductionF);
					}
				} //path check
			} else if (seletedLine.Key === 'OS' ||
				seletedLine.Key === 'KS' ||
				seletedLine.Key === 'BS') {
				if (seletedLine.Key === 'BS') {
					seletedLine.Tunch = 100;
				}
				var bhavF = seletedLine.Bhav / 1000;
				var weightF = seletedLine.Weight - seletedLine.KWeight;
				var fineSilver = (seletedLine.Tunch * weightF) / 100;
				var subtotSilver = parseFloat(fineSilver).toFixed(2);
				var subTotal = fineSilver * bhavF;
				var subTotalNoDecimal = parseFloat(subTotal).toFixed(0);
				subTotalNoDecimal = this.getIndianCurr(subTotalNoDecimal);
				var subTotF = this.getIndianCurr(subTotal)
				if ((seletedLine.SubTotal) && (seletedLine.SubTotal !== "")) {
					var currentSubTot = oFloatFormat.parse(seletedLine.SubTotal);
					this.deduction = subTotal + this.deduction - currentSubTot;
				} else {
					this.deduction = subTotal + this.deduction;
				}
				var deduction = this.deduction;
				var deductionF = this.getIndianCurr(deduction);
				if (path) {
					seletedLine.SubTotal = subTotF;
					if (viewId == 'idsalesws') {
						seletedLine.SubTotal = subTotalNoDecimal;
						if (subTotal) {
							seletedLine.SubTotalG = 0
							seletedLine.SubTotalS = 0;
						} else {
							seletedLine.SubTotalS = subtotSilver;
							seletedLine.SubTotalG = 0;
							seletedLine.SubTotal = 0;
						}
					} else {

						if (deductionF === '0' || deductionF === '') {
							deductionF = '0';
						}
						this.getView().getModel('local').setProperty('/orderHeaderTemp/Deduction', deductionF);
					}
					this.getView().byId("OrderReturn").getModel("returnModel").setProperty(path, seletedLine);
				} else {
					cells[cells.length - 1].setText(subTotF);

					if (viewId == 'idsalesws') {
						cells[cells.length - 1].setText(subTotalNoDecimal);
						if (subTotal) {
							cells[cells.length - 3].setText(0);
							cells[cells.length - 2].setText(0);
						} else {
							cells[cells.length - 3].setText(subtotSilver);
							cells[cells.length - 2].setText(0);
							cells[cells.length - 1].setText(0);
						}
					} else {

						if (deductionF === '0' || deductionF === '') {
							deductionF = '0';
						}
						this.getView().getModel('local').setProperty('/orderHeaderTemp/Deduction', deductionF);
					}
				}
			} else if (seletedLine.Key === 'CASH') {
				var subTotF = this.getIndianCurr(seletedLine.Bhav)
				var wsSubTotF = parseFloat(seletedLine.Bhav).toFixed(0);
				wsSubTotF = this.getIndianCurr(wsSubTotF);
				if (this.deduction != "") {
					if ((seletedLine.SubTotal) && seletedLine.SubTotal != "") {
						var currentVal = oFloatFormat.parse(seletedLine.SubTotal);
						this.deduction = this.deduction + seletedLine.Bhav - currentVal;
					} else {
						this.deduction = this.deduction + seletedLine.Bhav;
					}
				} else {
					this.deduction = seletedLine.Bhav;
				}
				var deduction = this.deduction;
				var deductionF = this.getIndianCurr(deduction);
				if (viewId == 'idsalesws') {} else {
					if (deductionF === '0' || deductionF === '') {
						deductionF = '0';
					}
					this.getView().getModel('local').setProperty('/orderHeaderTemp/Deduction', deductionF);
				}
				if (path) {
					seletedLine.SubTotal = subTotF;
					if (viewId == 'idsalesws') {
						seletedLine.SubTotal = wsSubTotF;
					}
					this.getView().byId("OrderReturn").getModel("returnModel").setProperty(path, seletedLine);
				} else {
					cells[cells.length - 1].setText(subTotF);
					if (viewId == 'idsalesws') {
						cells[cells.length - 1].setText(wsSubTotF);
					}
				}
			}
		},
		onRetItemValidation: function() {
			//line item validations
			var that = this;
			var viewId = this.getView().getId().split('---')[1];
			var returnModel = this.getView().getModel("returnModel").getProperty("/TransData");
			// var oReturnDetail = that.getView().getModel('local').getProperty(returnLocalPayload);
			var oTableDetails = that.getView().byId("OrderReturn");
			var tableBinding = oTableDetails.getBinding("rows");
			//---all errors are false
			var returnError = false;
			for (var i = 0; i < tableBinding.getLength(); i++) {
				var data = tableBinding.oList[i];
				if (data.Key !== "") {
					if (data.Key === "CASH") {
						if (data.Bhav === "" || data.Bhav === 0 || data.Bhav === "0") {
							this.getView().setBusy(false);
							oTableDetails.getRows()[i].getCells()[5].setValueState("Error");
							returnError = true;
						} else {
							oTableDetails.getRows()[i].getCells()[1].setValueState("None");
							this.getView().setBusy(false);
						}
					} else {
						//Quantity
						if (data.Weight === "" || data.Weight === 0 || data.Weight === "0") {
							this.getView().setBusy(false);
							oTableDetails.getRows()[i].getCells()[1].setValueState("Error");
							returnError = true;
							// return;
						} else {
							returnModel.Weight = data.Weight;
							oTableDetails.getRows()[i].getCells()[1].setValueState("None");
							this.getView().setBusy(false);
							// returnError = false;
						}

						if (data.Bhav === "" || data.Bhav === 0 || data.Bhav === "0") {
							if (((viewId == "idsalesws") &&
									(data.Key === "OG" || data.Key === "OS")) ||
								(viewId == "idsales")) {
								this.getView().setBusy(false);
								oTableDetails.getRows()[i].getCells()[5].setValueState("Error");
								returnError = true;
							}
							// return;
						} else {
							returnModel.Bhav = data.Bhav;
							oTableDetails.getRows()[i].getCells()[5].setValueState("None");
							this.getView().setBusy(false);
							// returnError = false;
						}

						//Tunch
						if (data.Tunch === "" || data.Tunch === 0 || data.Tunch === "0") {
							if ((data.Key === "KG" || data.Key === "KS") &&
								(viewId == "idsales")) {
								this.getView().setBusy(false);
								oTableDetails.getRows()[i].getCells()[3].setValueState("Error");
								returnError = true;
							} else {
								returnModel.Tunch = data.Tunch;
								oTableDetails.getRows()[i].getCells()[3].setValueState("None");
								this.getView().setBusy(false);
							}

							if (viewId == "idsalesws") {
								this.getView().setBusy(false);
								oTableDetails.getRows()[i].getCells()[3].setValueState("Error");
								returnError = true;
							}
						} //Key check

						this.getView().getModel("returnModel").setProperty("/TransData", returnModel);
					} //bhav check
				} //data.Key check
			} //for loop
			return returnError;
		},
		orderItem: function(oEvent, id) {
			//create the model to set the getProperty
			//visible or // NOT
			this.setVisible(oEvent, id);
			//create json model
			var oOrderItem = new sap.ui.model.json.JSONModel();
			//create array
			var array = [];
			//loop the array values
			for (var i = 1; i <= 20; i++) {
				//var baseItem = this.getView().getModel("local").getProperty("/orderItemBase");
				var oItem = {
					"OrderNo": "",
					"itemNo": "",
					"Material": "",
					"MaterialCode": "",
					"Description": "",
					"Qty": "0",
					"QtyD": "0",
					"Weight": "0",
					"WeightD": "0",
					"Making": "0",
					"MakingD": "0",
					"Tunch": 0,
					"Remarks": "",
					"SubTotal": "",
					"SubTotalS": 0,
					"SubTotalG": 0,
					"Category": "",
					"CreatedBy": "",
					"CreatedOn": "",
					"ChangedBy": "",
					"ChangedOn": ""
				};
				array.push(oItem);
			}
			//set the Data
			oOrderItem.setData({
				"itemData": array
			});
			//set the model
			this.setModel(oOrderItem, "orderItems");
		},
		materialPopupOrderItem: function(oEvent, id) {
			//create the model to set the getProperty
			//visible or // NOT
			this.setVisible(oEvent, id);
			//create json model
			var oOrderItem = new sap.ui.model.json.JSONModel();
			//create array
			var array = [];
			//loop the array values
			for (var i = 1; i <= 20; i++) {
				//var baseItem = this.getView().getModel("local").getProperty("/orderItemBase");
				var oItem = {
					"id": "",
					"OrderNo": "",
					"itemNo": "",
					"MaterialCode": "",
					"Description": "",
					"Qty": "0",
					"Date": ""
				};
				array.push(oItem);
			}
			//set the Data
			oOrderItem.setData({
				"popupItemsData": array
			});
			//set the model
			this.setModel(oOrderItem, "materialPopupOrderItems");
		},
		hideDColumns: function(oEvent) {
			//on setting button click

			var oModel = this.getView().getModel('VisibleSet');

			if (oModel.getProperty('/set') === true) {
				oModel.setProperty('/set', false);
			} else {
				oModel.setProperty('/set', true);
			}
		},

		onCustomerSelect: function(oEvent, custName, custId) {
			let custCode = oEvent.getSource().getValue();
			if(!custCode) return;
			this.setCustomerFilter(custCode);

			var that = this;
			if (oEvent.getParameter("selectedItem")) {
				var selectedData = oEvent.getParameter("selectedItem").getBindingContext().getObject();
				this.setCustomerIdAndCustomerName(selectedData);
			}
			// jQuery.sap.delayedCall(100, this, function() {
			// 	this.getView().byId("idCash").focus();
			// 	this.getView().byId("idCash").$().find("input").select();
			// });
			// this.getView().byId(oEvent.getSource().getId().replace("customerId", "idCustomerNameForSale")).setVisible(oEvent.getParameter("selectedItem").getText() === "SALE").getFields()[0].setValue();
			// this.getView().byId(oEvent.getSource().getId().replace("customerId", "idCustomerCityForSale")).setVisible(oEvent.getParameter("selectedItem").getText() === "SALE").getFields()[0].setValue();
		},

		onBookingCustomerSelect: function(oEvent, custName, custId) {

			var that = this;
			if (oEvent.getParameter("selectedItem")) {
				var selectedData = oEvent.getParameter("selectedItem").getBindingContext().getObject();
				this.setCustomerIdAndCustomerName(selectedData);
			}
		},

		getCustomer: function(oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			if (oEvent.getParameter("value")) {
				var searchValue = oEvent.getParameter("value").toLocaleUpperCase();
				// var items = oSource.getBinding("suggestionItems").aLastContextData;
				// 	var filteredObj = items.find((item) => {
				// 		if (JSON.parse(item).CustomerCode === searchValue) {
				// 			return items;
				// 		}
				// 	});
				// 	var selectedData = JSON.parse(filteredObj);
				// 	this.setCustomerIdAndCustomerName(selectedData);
				var oFilter = new Filter('CustomerCode', FilterOperator.EQ, searchValue);
				this.getView().setBusy(true);
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/Customers", "GET", {
							filters: [oFilter]
						}, {}, this)
					.then(function(oData) {
						if (oData.results.length > 0) {
							var selectedData = oData.results[0];
							that.setCustomerIdAndCustomerName(selectedData);
						}
						that.getView().setBusy(false);
					})
					.catch(function(oError) {});
			}
		},

		setCustomerIdAndCustomerName: function(selectedCustomer) {

			this.getView().getModel("local").setProperty("/selectedCustomer", selectedCustomer)
			var that = this;
			var cityId = selectedCustomer.City;
			var customerCode = selectedCustomer.CustomerCode;
			var name = selectedCustomer.Name;
			var salesId = this.getView().byId("Sales--customerId");
			var entryId = this.getView().byId("idCust");
			var bookingId = this.getView().byId("idCustomerCode");
			var wsId = this.getView().byId("WSHeaderFragment--customerId");
			var custOrderId = this.getView().byId("idCoCustomer");
			var kachhiId = this.getView().byId("idCustNo");

			if (custOrderId) {
				this.getView().byId("idCoCustomer").setValue(customerCode);
				// this.getView().byId("idCoCustomerText").setValue(name);

				this.getView().getModel("local").setProperty("/customerOrder/Customer",
					this.allMasterData.customersId[customerCode].id);
				this.getView().getModel("local").setProperty("/coTemp/CustomerCode",
					customerCode);

				var oFilter = new sap.ui.model.Filter("Customer", "EQ", "'" + this.allMasterData.customersId[customerCode].id + "'");
				this.getView().byId("idCoTable").getBinding("items").filter(oFilter);
			} else if (wsId) {
				// this.getView().byId()
				this.getView().byId("WSHeaderFragment--customerId").setValue(customerCode);
				// this.getView().byId("WSHeaderFragment--custName").setText(name + "-" + that.allMasterData.cities[cityId].cityName);
				this.getView().getModel("local").setProperty("/WSOrderHeader/Customer",
					selectedCustomer.id);
				this.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerId",
					customerCode);
				this.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerName",
					name);
			} else if (bookingId) { //booking
				this.getView().byId("idCustomerCode").setValue(customerCode);
				// this.getView().byId("idCustName").setText(name + "-" + that.allMasterData.cities[cityId].cityName);
				this.getView().getModel("local").setProperty("/BookingDetail/Customer",
					selectedCustomer.id);
				this.getView().getModel("local").setProperty("/BookingDetail/CustomerId",
					customerCode);
				this.getView().getModel("local").setProperty("/BookingDetail/CustomerName",
					name);
				var myData = this.getView().getModel("local").getProperty("/BookingDetail");

				if (this.getView().byId("idRb1").getSelected()) {
					myData.Type = "Silver";
				} else {
					myData.Type = "Gold";
				}
				if (myData.Customer === "") {

					var oFilter2 = new sap.ui.model.Filter("Type", "EQ", myData.Type);
					this.getView().byId("idTable").getBinding("items").filter(oFilter2);
					this.getView().byId("idTable1").getBinding("items").filter(oFilter2);
					this.getView().byId("idTable2").getBinding("items").filter(oFilter2);
					this.getView().byId("idBookingDlvTable").getBinding("items").filter(oFilter2);

				} else {
					var oFilter1 = new sap.ui.model.Filter("Customer", "EQ", "'" + myData.Customer.split("'") + "'");
					var oFilter2 = new sap.ui.model.Filter("Type", "EQ", myData.Type);

					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1, oFilter2],
						and: true
					});
					this.getView().byId("idTable").getBinding("items").filter([oFilter]);
					this.getView().byId("idTable1").getBinding("items").filter([oFilter]);
					this.getView().byId("idTable2").getBinding("items").filter([oFilter]);
					this.getView().byId("idBookingDlvTable").getBinding("items").filter([oFilter]);
				}
				var that = this;
				$.post("/getTotalBookingCustomer", {
					myData
				}).then(function(result) {
					console.log(result);

					if (myData.Type = "Silver") {
						that.byId("idBTQ").setText(parseFloat(result.BookedQtyTotal.toFixed(3)));
					} else {
						that.byId("idBTQ").setText(parseFloat(result.BookedQtyTotal.toFixed(2)));
					}
					that.byId("idBTQ").getText();
					parseFloat(that.byId("idBTQ").getText());
					if (parseFloat(that.byId("idBTQ").getText()) > 0) {
						that.byId("idBTQ").setState('Success');

					} else {
						that.byId("idBTQ").setState('Warning');
					}

					that.byId("idBAP").setText(parseFloat(result.BookedAvgPriceTotal.toFixed(0)));
					that.byId("idBAP").getText();
					parseFloat(that.byId("idBAP").getText());
					if (parseFloat(that.byId("idBAP").getText()) > 0) {
						that.byId("idBAP").setState('Success');

					} else {
						that.byId("idBAP").setState('Warning');
					}
				});
				var that2 = that;
				$.post("/getTotalDeliveredCustomer", {
					myData
				}).then(function(result) {
					console.log(result);

					if (myData.Type = "Silver") {
						that2.byId("idDTQ").setText(parseFloat(result.DeliveredQtyTotal.toFixed(3)));
					} else {
						that2.byId("idDTQ").setText(parseFloat(result.DeliveredQtyTotal.toFixed(2)));
					}
					that2.byId("idDTQ").getText();
					if (parseFloat(that.byId("idDTQ").getText()) > 0) {
						that2.byId("idDTQ").setState('Success');

					} else {
						that2.byId("idDTQ").setState('Warning');
					}

					that2.byId("idDAP").setText(parseFloat(result.DeliveredAvgPriceTotal.toFixed(0)));
					that2.byId("idDAP").getText();
					if (parseFloat(that.byId("idDAP").getText()) > 0) {
						that2.byId("idDAP").setState('Success');

					} else {
						that2.byId("idDAP").setState('Warning');
					}
				});
			} else if (entryId) {
				this.getView().byId("idCust").setValue(customerCode);
				// this.getView().byId("idCustText").setText(name);
				this.getView().byId("idEntryDownload").setEnabled(true);
				this.getView().getModel("local").setProperty("/EntryData/Customer", selectedCustomer.id);

				this.getView().getModel("local").setProperty("/EntryData/CustomerCity", cityId);

				this.getView().getModel("local").setProperty("/entryHeaderTemp/customerId", customerCode);
				this.getView().getModel("local").setProperty("/EntryData/customerName", name);
				var myData = this.getView().getModel("local").getProperty("/EntryData");
				// this.getView().getModel("local").getProperty("/EntryData",myData);
				var oFilter = new sap.ui.model.Filter("Customer", "EQ", "'" + myData.Customer + "'");
				this.getView().byId("idTable").getBinding("items").filter(oFilter);
				this.getView().byId("idTable1").getBinding("items").filter(oFilter);
				this.getView().byId("idTable2").getBinding("items").filter(oFilter);
				this.customerId = selectedCustomer.id;
				that.getView().byId("idCust").setVisible(true);
				$.post("/getTotalEntryCustomer", {
					Customer: myData.Customer
				}).then(function(result) {
					console.log(result);
					that.getView().byId("idCust").setVisible(true);
					if (result.CashTotal === null) {
						that.byId("idTC").setText('0');
					} else {
						that.byId("idTC").setText(parseFloat(result.CashTotal.toFixed(2)));
					}
					that.byId("idTC").getText();
					parseFloat(that.byId("idTC").getText());
					if (parseFloat(that.byId("idTC").getText()) > 0) {
						that.byId("idTC").setState('Success');

					} else {
						that.byId("idTC").setState('Warning');
					}
					that.getView().byId("idG").setText(parseFloat(result.GoldTotal.toFixed(3)));
					that.byId("idG").getText();
					parseFloat(that.byId("idG").getText());
					if (parseFloat(that.byId("idG").getText()) > 0) {
						that.byId("idG").setState('Success');

					} else {
						that.byId("idG").setState('Warning');
					}
					that.getView().byId("idS").setText(parseFloat(result.SilverTotal.toFixed(2)));
					that.byId("idS").getText();
					parseFloat(that.byId("idS").getText());
					parseFloat(that.byId("idS").getText()).toFixed(3);
					// parseFloat(that.byId("idS").getText());
					// parseFloat(that.byId("idS").getText()).toFixed(3);
					// parseFloat(parseFloat(that.byId("idS").getText()).toFixed(3));
					if (parseFloat(parseFloat(that.byId("idS").getText()).toFixed(3)) > 0) {
						that.byId("idS").setState('Success');

					} else {
						that.byId("idS").setState('Warning');
					}
					that.getView().byId("idCust").setVisible(true);
					//alert("chal gaya");
				});
			} else if (kachhiId) {

				if (customerCode) {
					var custHeader = this.getView().getModel("local").getProperty("/kachhiHeaderTemp");
					custHeader.CustomerId = customerCode;
					custHeader.CustomerName = name;
					this.getView().getModel("local").setProperty("/kachhiHeaderTemp", custHeader);
					// this.getView().byId("idCustNo").setValueState();
				}
				var myData = this.getView().getModel("local").getProperty("/kacchiData");
				myData.Customer = selectedCustomer.id;
				this.customerId = myData.Customer;
				this.getView().getModel("local").setProperty("/kacchiData", myData);
				this.getView().byId("idCustNo").setValue(customerCode);
				this.getView().getModel("local").setProperty("/kacchiData/Customer", selectedCustomer.id);
				this.getView().getModel("local").setProperty("/kachhiHeaderTemp/customerId", customerCode);
				var oFilter = new sap.ui.model.Filter("Customer", "EQ", "'" + myData.Customer + "'");
				this.getCustDataFromDB(oFilter);
			} else {
				this.getView().byId("Sales--customerId").setValue(customerCode);
				// this.getView().byId("Sales--custName").setText(name + "-" + that.allMasterData.cities[cityId].cityName);
				this.getView().getModel("local").setProperty("/orderHeader/Customer", selectedCustomer.id);
				this.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerId", customerCode);
			}
		},

		onMaterialSelect: function(oEvent) {

			var that = this;
			var id = oEvent.getSource().getId().split('---')[1];
			if (id !== undefined) {
				if (id.split('--')[0] === 'idsales') {
					this.byId("Sales--idSaveIcon").setColor('red');
				}
			}
			var fragIndicator = sap.ui.core.Fragment.byId("fr1", "idSaveIndicator");
			if (fragIndicator) {
				fragIndicator.setColor("red");
			}
			var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext()
				.getPath());
			// var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
			var oModel = oEvent.getSource().getParent().getBindingContext("orderItems");

			var orderId = null;
			var oHeader = this.getView().getModel('local').getProperty('/orderHeader');

			if (!oModel) {
				oModel = oEvent.getSource().getParent().getBindingContext("materialPopupOrderItems");
				orderId = oHeader.id;
				var orderNoPath = oEvent.getSource().mBindingInfos.value.binding.oContext.sPath;
				if (!orderId) {
					var oFilter = new sap.ui.model.Filter("OrderNo", "EQ", oHeader.OrderNo);
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
							"/OrderHeaders",
							"GET", {
								filters: [oFilter]
							}, {}, that)
						.then(function(oData) {

							orderId = oData.results[oData.results.length - 1].id;
							orderNoPath = orderNoPath + "/OrderNo";
							that.getView().getModel("materialPopupOrderItems").setProperty(orderNoPath, orderId);
						})
				} else {
					orderNoPath = orderNoPath + "/OrderNo";
					that.getView().getModel("materialPopupOrderItems").setProperty(orderNoPath, orderId);
				}
			}

			var oModelForRow = oModel.getModel();
			var sBinding = oEvent.getSource().getParent().getBindingContext("orderItems");
			if (!sBinding) {
				sBinding = oEvent.getSource().getParent().getBindingContext("materialPopupOrderItems");
			}

			var sRowPath = sBinding.getPath();
			oModelForRow.setProperty(sRowPath + "/Material", selectedMatData.id);
			if (selectedMatData.HindiName) {
				oModelForRow.setProperty(sRowPath + "/Description", selectedMatData.HindiName);
			} else {
				oModelForRow.setProperty(sRowPath + "/Description", selectedMatData.ProductName);
			}
			//Making
			if (selectedMatData.Making) {
				oModelForRow.setProperty(sRowPath + "/Making", selectedMatData.CustomerMaking ? selectedMatData.CustomerMaking : selectedMatData.Making);
			} else {
				oModelForRow.setProperty(sRowPath + "/Making", 0);
			}
			//Makind D field
			if (selectedMatData.PricePerUnit) {
				oModelForRow.setProperty(sRowPath + "/MakingD", selectedMatData.PricePerUnit);
			} else {
				oModelForRow.setProperty(sRowPath + "/MakingD", 0);
			}

			oModelForRow.setProperty(sRowPath + "/Category", selectedMatData.Category);
			oModelForRow.setProperty(sRowPath + "/Type", selectedMatData.Type);
			oModelForRow.setProperty(sRowPath + "/Karat", selectedMatData.Karat);
			if (selectedMatData.Tunch) {
				oModelForRow.setProperty(sRowPath + "/Tunch", selectedMatData.CustomerTunch ? selectedMatData.CustomerTunch : selectedMatData.Tunch);
			} else {
				oModelForRow.setProperty(sRowPath + "/Tunch", 0);
			}

			var currentBoxId = oEvent.getSource().getId();
			if (currentBoxId.includes("fr1")) {
				that.focusAndSelectNextInput(currentBoxId, "input[id*='fr1--id']");
			} else {
				that.focusAndSelectNextInput(currentBoxId, "input[id*='---idsales--']");
			}
		},

		onTableExpand: function(oEvent) {

			var splitApp = this.getView().oParent.oParent;
			var masterVisibility = splitApp.getMode();
			if (masterVisibility == "ShowHideMode") {

				splitApp.setMode(sap.m.SplitAppMode.HideMode);
			} else {
				splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
			}
		},
		orderCustomCalculations: function() {
			var that = this;
			// var orderHeader = that.getView().getModel('local').getProperty('/orderHeaders');
			that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
					"/CustomCalculations", "GET", {}, {}, this)
				.then(function(oData) {
					that.getView().getModel("local").setProperty("/CustomCalculations", oData);
					that.getView().getModel("local").setProperty("/orderHeader/GoldBhav22", oData.results[0].Second);
					that.getView().getModel("local").setProperty("/orderHeader/GoldBhav20", oData.results[0].First);
					that.getView().getModel("local").setProperty("/orderHeader/GoldBhav", oData.results[0].Gold);
					that.getView().getModel("local").setProperty("/orderHeader/SilverBhav", oData.results[0].Silver);
				}).catch(function(oError) {
					that.getView().getModel("local").setProperty("/orderHeader/GoldBhav22", 0);
					that.getView().getModel("local").setProperty("/orderHeader/GoldBhav20", 0);
					that.getView().getModel("local").setProperty("/orderHeader/GoldBhav", 0);
					that.getView().getModel("local").setProperty("/orderHeader/SilverBhav", 0);
				});
		},



		onSuggest: function(oEvent) {

			var sTerm = oEvent.getParameter("suggestValue").toLocaleUpperCase();

			// var sTerm=oEvent.getSource().getProperty("value");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter("CustomerCode", FilterOperator.Contains, sTerm));
				aFilters.push(new Filter("Name", FilterOperator.Contains, sTerm));
				// aFilters.push(new Filter("Name", FilterOperator.Contains, sTerm.toUpperCase()));
				oEvent.getSource().getBinding("suggestionItems").filter(new Filter({
					filters: aFilters,
					and: false
				}));
				// oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
				oEvent.getSource().getBinding("suggestionItems").refresh(true);
				// oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
				oEvent.getSource().getBinding("suggestionItems").isSuspended();
				oEvent.getSource().getBinding("suggestionItems").resume();
				var oSorter = new sap.ui.model.Sorter({

					path: "CustomerCode",
					descending: false

				});
				oEvent.getSource().getBinding("suggestionItems").sort(oSorter);
			}


		},

		handleNavButtonPress: function() {

			var oSplitApp = this.getView().getParent().getParent();
			var oMaster = oSplitApp.getMasterPages()[0];
			oSplitApp.toMaster(oMaster, "flip");
		},



		orderReturn: function(oEvent, id) {
			//create the model to set the getProperty
			//visible or // NOT
			this.setVisible(oEvent, id);
			//create structure of an array
			var oTransData = new sap.ui.model.json.JSONModel();
			var aTtype = [];
			for (var i = 1; i <= 5; i++) {
				var oRetailtab = {
					"Type": "",
					"Key": "",
					"ReturnId": "",
					"Weight": 0,
					"KWeight": 0,
					"Tunch": 0,
					"Qty": 0,
					"Bhav": 0,
					"Remarks": "",
					"SubTotalS": 0,
					"SubTotalG": 0,
					"SubTotal": "",
					"CreatedBy": "",
					"CreatedOn": "",
					"ChangedBy": "",
					"ChangedOn": ""
				};
				aTtype.push(oRetailtab);
			}
			oTransData.setData({
				"TransData": aTtype
			});
			this.setModel(oTransData, "returnModel");
		},

		setCustomerFilter : function(custCode){
			var that = this;
			let oModel = this.getModel(); // Default OData model
			oModel.read("/Customers", {
				filters: [new sap.ui.model.Filter("CustomerCode", sap.ui.model.FilterOperator.EQ, custCode)],
				success: function (oData) {
					if(!oData && !oData.results && !oData.results[0]) return;
					let matchingObject = oData.results[0]; // Assuming unique CustomerCode
					if (matchingObject) {
						that.getModel('local').setProperty('/customerOrder/Customer', matchingObject.id);
						that.customerInputValue(matchingObject.id);

					}
				},
				error: function (oError) {
					return;
				}
			});
		},


		customerInputValue: function (customerOrderIdsArray) {
			if(!customerOrderIdsArray){
				return;
			}
			// Get the sap.m.Table instance
			var oTable = this.byId("idCoTable");
			let idObj = {
				id: customerOrderIdsArray
			}
			$.post('/CustomerOrderFilter', idObj)
				.done(function (data, status) {	
					// Validate and convert date fields
					data.forEach(item => {
						if (item.Date) {
							item.Date = parseValidDate(item.Date);
						}
						if (item.DelDate) {
							item.DelDate = parseValidDate(item.DelDate);
						}
					});

					var oJSONModel = new sap.ui.model.json.JSONModel();
					oJSONModel.setData({ results: data }); // Ensure the structure matches your table's expected format
					oTable.setModel(oJSONModel);
					oTable.bindItems({
						path: "/results",
						template: oTable.getBindingInfo("items").template // Reuse the existing column template
					});

					function parseValidDate(dateString) {
						var parsedDate = new Date(dateString);
						if (isNaN(parsedDate.getTime())) {
							console.warn("Invalid date format: " + dateString);
							return null; // Or handle with a default date
						}
						return parsedDate;
					}
				})
				.fail(function (xhr, status, error) {
					// sap.m.MessageBox.error("Error");
					return;
				});

		}
	});
});
