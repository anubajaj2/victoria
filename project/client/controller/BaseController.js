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
], function(jQuery, Controller, History, JSONModel, ODataHelper, MessageBox, MessagePopover, MessageToast, MessageItem, formatter) {
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
		allMasterData: {
			"customers": [],
			"materials": [],
			"orderHeader": [],
			"customCalculations": []
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
			debugger;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Customers", "GET", null, null, this)
				.then(function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						that.allMasterData.customers[oData.results[i].id] = oData.results[i];
					}
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Products", "GET", null, null, this)
				.then(function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						that.allMasterData.materials[oData.results[i].id] = oData.results[i];
					}
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});
			this.fetchValuesFromCustomizing();

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
			var accessToken = that.getView().getModel("local").getProperty("/Authorization");
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
			} else {
				that.redirectLoginPage("X", Reload);
			}

		},
		//fieldId: "",
		getCustomerPopup: function(oEvent) {
			if (!this.searchPopup) {
				this.searchPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
				this.getView().addDependent(this.searchPopup);
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: '/Customers',
					template: new sap.m.DisplayListItem({
						label: "{CustomerCode}",
						value: "{Name} - {City}"
					})
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
						value: "{Name} - {City}"
					})
				});
			}
			this.kCustomersearchPopup.open();
		},

		getKarigarPopup: function(oEvent) {
			if (!this.karigarsearchPopup) {
				this.karigarsearchPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
				this.getView().addDependent(this.karigarsearchPopup);
				var title = this.getView().getModel("i18n").getProperty("karigarSearch");
				this.karigarsearchPopup.setTitle(title);
				var oFilter1 = new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "Karigar");
				this.karigarsearchPopup.bindAggregation("items", {
					path: '/Customers',
					filters: [oFilter1],
					template: new sap.m.DisplayListItem({
						label: "{CustomerCode}",
						value: "{Name} - {City}"
					})
				});
			}
			this.karigarsearchPopup.open();
		},

		orderPopup: function(oEvent) {
			//call the popup screen dynamically
			if (!this.orderPopup) {
				debugger;
				//call the popupfragment and pass the values
				this.orderPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
				this.getView().addDependent(this.orderPopup);
				this.orderPopup.bindAggregation("items", {
					path: "/OrderHeaders",
					template: new sap.m.DisplayListItem({

						label: "{OrderHeaders}",
						value: "{OrderNo}"
					})
				});
			}
			this.orderPopup.open(oEvent);
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
			debugger;
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
			debugger;
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
			debugger;
			this.getView().byId(headerId).setVisible(true);
			this.getView().oParent.oParent._oMasterNav.setVisible(true);
		},
		_openFullScreen: function(btnId, headerId) {
			debugger;
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
			if ((oGold1 < 25000 ||
					oGold1 > 40000) && oGold1 > 0) {
				var valid = false;
				return valid;
			} else {
				var valid = true;
				return valid;
			}

		},

		handleSilverValidation: function(oValue) {
			var oSilver1 = parseFloat(oValue, 10);
			if ((oSilver1 < 32000 ||
					oSilver1 > 65000) && oSilver1 > 0) {
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
			if (logOut == "X" && Reload != "X") {
				MessageBox.alert("Logout Successful");
			} else if (Reload != "X") {
				MessageBox.alert("Page expired, please login again");
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
		setVisible: function(oEvent) {
			debugger;
			var oVisModel = new sap.ui.model.json.JSONModel({
				rows1: true
			});
			//check for retail sales only
			this.setModel(oVisModel, "visModel");

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
			}
		},
		deleteReturnValues:function(oEvent,i,selIdxs,viewId,oTableData){
			debugger;
			var that = this;
			var id  = that.getView().getModel('returnModel').getProperty('/TransData')[i].ReturnId;
			if (id){
				if (viewId === 'idsales') {
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/OrderItems('" + id + "')",
																		"DELETE", {}, {}, that)
				}else {
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/WSOrderReturns('" + id + "')",
																		"DELETE", {}, {}, that)
				}
			sap.m.MessageToast.show("Data Deleted Successfully");
			}
			var oTableData = that.getView().getModel("returnModel").getProperty("/TransData");
			oTableData.splice(selIdxs, 1);
			oTableData.push(
				{
				"Type":"",
				"key":"",
				"ReturnId":"",
				"Weight":0,
				"KWeight":0,
				"Tunch":0,
				"Qty":0,
				"Bhav":0,
				"Remarks":"",
				"SubTotalS":0,
				"SubTotalG":0,
				"SubTotal":0,
				"CreatedBy":"",
				"CreatedOn":"",
				"ChangedBy":"",
				"ChangedOn":""
			});
	that.getView().getModel('returnModel').setProperty('/TransData',oTableData);
		},
		onReturnValue: function(oEvent) {
			var userEnterValue = this.getView().byId("OrderReturn").getModel("returnModel").getProperty(oEvent.getSource().getParent().getBindingContext("returnModel").getPath());
			var customCal = this.getView().getModel("local").getProperty('/CustomCalculations');
			var key = oEvent.getParameter("selectedItem").getKey();
			this.defaultValuesLoad(oEvent, userEnterValue, customCal, key);
		},
		defaultValuesLoad: function(oEvent, userEnterValue, customCal, key) {
			var that = this;
			var viewId = oEvent.getSource().getParent().getId().split('---')[1].split('--')[0];
			if (key) {
				userEnterValue.key = key;
			}
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
			}
			that.getView().getModel('local').setProperty('/returnModel', userEnterValue);
		},
		onReturnChange: function(oEvent) {
			debugger;
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
		},
		returnCalculation: function(oEvent, orderHeader, seletedLine) {
			debugger;
			var newValue = oEvent.getParameters().newValue;
			var fieldId = oEvent.getParameters().id.split('---')[1].split('--')[1].split('-')[0];
			var viewId = oEvent.getSource().getId().split('---')[1].split('--')[0];
			var oCurrentRow = oEvent.getSource().getParent();
			var cells = oCurrentRow.getCells();
			var oLocale = new sap.ui.core.Locale("en-US");
			var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
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
			//weight
			if (seletedLine.Weight === "") {
				var weight = 0;
			} else
			if (seletedLine.Weight === 0) {
				var weight = 0;
			} else {
				var weight = oFloatFormat.parse(seletedLine.Weight);
			}
			//Katta weight
			if (seletedLine.KWeight === "") {
				var kWeight = 0;
			} else
			if (seletedLine.KWeight === 0) {
				var kWeight = 0;
			} else {
				var kWeight = oFloatFormat.parse(seletedLine.KWeight);
			}
			//tunch
			if (seletedLine.Tunch === "") {
				var tunch = 0;
			} else
			if (seletedLine.Tunch === 0) {
				var tunch = 0;
			} else {
				var tunch = oFloatFormat.parse(seletedLine.Tunch);
			}
			//bhav
			if (seletedLine.Bhav === "") {
				var bhav = 0;
			} else
			if (seletedLine.Bhav === 0) {
				var bhav = 0;
			} else {
				//   var bhav  = oFloatFormat.parse(seletedLine.Bhav);
				var bhav = seletedLine.Bhav;
			}
			if (seletedLine.key === 'OG' ||
				seletedLine.key === 'KG' ||
				seletedLine.key === 'BG') {
				debugger;
				if (seletedLine.key === 'BG') {
					var tunch = 100;
				}
				var bhavF = bhav / 10;
				var weightF = weight - kWeight;
				var fineGold = (tunch * weightF) / 100;
				var subTotal = fineGold * bhavF;
				cells[cells.length - 1].setText(subTotal);
				if (viewId == 'idsalesws' &&
					(seletedLine.key === 'KG' ||
					seletedLine.key === 'BG')) {
					cells[cells.length - 2].setText(fineGold);
				}
			} else if (seletedLine.key === 'OS' ||
				seletedLine.key === 'KS' ||
				seletedLine.key === 'BS') {
				debugger;
				if (seletedLine.key === 'BS') {
					var tunch = 100;
				}
				var bhavF = bhav / 1000;
				var weightF = weight - kWeight;
				var fineSilver = (tunch * weightF) / 100;
				var subTotal = fineSilver * bhavF;
				cells[cells.length - 1].setText(subTotal);

				if (viewId == 'idsalesws' &&
					(seletedLine.key === 'KS' ||
					seletedLine.key === 'BS')) {
					cells[cells.length - 3].setText(fineSilver);
				}
			}
		},
		onRetItemValidation:function(data,i,returnLocalPayload)
		{
		//line item validations
			var that = this;
			var returnModel = this.getView().getModel("returnModel").getProperty("/TransData");
			var oReturnDetail = that.getView().getModel('local').getProperty(returnLocalPayload);
			var oTableDetails = that.getView().byId("OrderReturn");
			var tableBinding = oTableDetails.getBinding("rows");
		//---all errors are false
			var returnError = false;
			//Quantity
			if(data.Weight === "" || data.Weight === 0) {
				this.getView().setBusy(false);
				oTableDetails.getRows()[i].getCells()[2].setValueState("Error");
				returnError = true;
				return;
				}else {
					oReturnDetail.Weight=data.Weight;
					oTableDetails.getRows()[i].getCells()[2].setValueState("None");
					this.getView().setBusy(false);
					returnError = false;
			}
			if(data.Bhav === "" || data.Bhav === 0) {
				this.getView().setBusy(false);
				oTableDetails.getRows()[i].getCells()[2].setValueState("Error");
				returnError = true;
				return;
				}else {
					oReturnDetail.Bhav=data.Bhav;
					oTableDetails.getRows()[i].getCells()[2].setValueState("None");
					this.getView().setBusy(false);
					returnError = false;
			}

		return returnError;
		},
		orderItem: function(oEvent) {
			//create the model to set the getProperty
			//visible or // NOT
			this.setVisible(oEvent);

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
					"Qty": 0,
					"QtyD": 0,
					"Weight": 0,
					"WeightD": 0,
					"Making": 0,
					"MakingD": 0,
					"Tunch": 0,
					"Remarks": "",
					"SubTotal": 0,
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
		hideDColumns: function(oEvent) {
			//on setting button click
			debugger;
			var oModel = this.getView().getModel('VisibleSet');
			debugger;
			if (oModel.getProperty('/set') === true) {
				oModel.setProperty('/set', false);
			} else {
				oModel.setProperty('/set', true);
			}
		},
		onMaterialSelect: function(oEvent) {
			debugger;
			var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
			// var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
			var oModelForRow = oEvent.getSource().getParent().getBindingContext("orderItems").getModel();
			var sRowPath = oEvent.getSource().getParent().getBindingContext("orderItems").getPath();
			oModelForRow.setProperty(sRowPath + "/Material", selectedMatData.id);
			oModelForRow.setProperty(sRowPath + "/Description", selectedMatData.ProductName);
			//Making
			if (selectedMatData.Making) {
				oModelForRow.setProperty(sRowPath + "/Making", selectedMatData.Making);
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
				oModelForRow.setProperty(sRowPath + "/Tunch", selectedMatData.Tunch);
			} else {
				oModelForRow.setProperty(sRowPath + "/Tunch", 0);
			}
		},
		onTableExpand: function(oEvent) {
			debugger;
			var splitApp = this.getView().oParent.oParent;
			var masterVisibility = splitApp.getMode();
			if (masterVisibility == "ShowHideMode") {
				debugger;
				splitApp.setMode(sap.m.SplitAppMode.HideMode);
			} else {
				splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
			}
		},
		orderReturn: function(oEvent) {
			debugger;
			//create the model to set the getProperty
			//visible or // NOT
			this.setVisible(oEvent);
			//create structure of an array
			var oTransData = new sap.ui.model.json.JSONModel();
			var aTtype = [];
			for (var i = 1; i <= 5; i++) {
				var oRetailtab = {
					"Type": "",
					"key": "",
					"ReturnId": 0,
					"Weight": 0,
					"KWeight": 0,
					"Tunch": 0,
					"Qty": 0,
					"Bhav": 0,
					"Remarks": "",
					"SubTotalS": 0,
					"SubTotalG": 0,
					"SubTotal": 0,
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
		}
	});
});
