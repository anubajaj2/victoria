sap.ui.define([
	"victoria/controller/BaseController"
], function(Controller) {
	"use strict";

	return Controller.extend("victoria.controller.MainApp", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf victoria.view.App
		 */
		//	onInit: function() {
		//
		//	},
		idleLogout: function() {
			var t;
			var that = this;
			window.onbeforeunload = function() {
				that.logOutApp("X");
			}

			window.onload = resetTimer;
			window.onmousemove = resetTimer;
			window.onmousedown = resetTimer; // catches touchscreen presses as well
			window.ontouchstart = resetTimer; // catches touchscreen swipes as well
			window.onclick = resetTimer; // catches touchpad clicks as well
			window.onkeypress = resetTimer;
			window.addEventListener('scroll', resetTimer, true); // improved; see comments

			function yourFunction() {
				// your function for too long inactivity goes here
				// e.g. window.location.href = 'logout.php';
				sap.m.MessageBox.alert("Page expired, please login again!");
				window.top.location.href = "/";
			}

			function resetTimer() {
				clearTimeout(t);
				t = setTimeout(yourFunction, 3600000); // time is in milliseconds
			}
		},
		onLogout: function() {
			this.logOutApp();
		},
		onInit: function() {
			debugger;
			//var oModel = Models.createFruitModel();
			//sap.ui.getCore().setModel(oModel);
			this.idleLogout();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);

		},
		onSubmit: function() {
			this.Login();
		},

		onLivePassword: function(oEvent) {
			console.log("Test")
		},

		Login: function(oEvent) {
			debugger;

			var loginPayload = {
				"email": this.getView().byId("userid").getValue(),
				"password": this.getView().byId("pwd").getValue(),
			};
			var that = this;

			if (!loginPayload.email || !loginPayload.password) {
				sap.m.MessageBox.error("User/password cannot be empty");
				return; //--- Added - Swaroop
			}
			// debugger;

			debugger;
			$.post('/api/Users/login', loginPayload)
				.done(function(data, status) {
					debugger;
					that.getView().getModel("local").setProperty("/Authorization", data.id);
					that.getView().getModel().setHeaders({
						"Authorization": data.id
					});
					that.secureToken = data.id;
					that.getView().getModel("local").setProperty("/CurrentUser", data.userId);
					that.getView().getModel().setUseBatch(false);
					var that2 = that;
					debugger;
					//Check the role and set it after that navigate to App
					//that.oRouter.navTo("newlead");

					var aFilter = [new sap.ui.model.Filter("TechnicalId",
						sap.ui.model.FilterOperator.EQ, data.userId)];
					var oParameters = {
						filters: aFilter
					};
					var found = false;
					var AppUsers = [];
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
							"/AppUsers", "GET", {}, {}, that)
						.then(function(oData) {
							if (oData.results.length != 0) {
								for (var i = 0; i < oData.results.length; i++) {
									AppUsers[oData.results[i].TechnicalId] = oData.results[i];
									if (oData.results[i].TechnicalId === data.userId) {
										var role=oData.results[i].Role;
										that2.getView().getModel("local").setProperty("/Role", oData.results[i].Role);
										that2.getView().getModel("local").setProperty("/UserName", oData.results[i].UserName);
										found = true;
									} else {
										that2.getView().getModel("local").setProperty("/Authorization", "");

									}
								}
								if (found === true) {
									that2.getView().getModel("local").setProperty("/AppUsers", AppUsers);
									if(role==="Admin"){
										that2.oRouter.navTo("Customers");
										
									}else if(role==="Content"){
										that2.oRouter.navTo("dayBook");
									}else if(role==="Sales"){
										that2.oRouter.navTo("sales");
									}else if(role==="Order"){
										that2.oRouter.navTo("customerOrders");
									}else if(role==="Kacchi"){
										that2.oRouter.navTo("Kacchi");
									}else if(role==="Booking"){
										that2.oRouter.navTo("Suppliers");
									}else if(role==="Stock"){
										that2.oRouter.navTo("Stock");
									}
									// that2.oRouter.navTo("Customers");
that2.onDropDownSelect();

								} else {
									sap.m.MessageBox.error("The user is not authorized, Contact Anubhav");
								}
							}
						}).catch(function(oError) {

						});

				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error("Login Failed, Please enter correct credentials");
				});
			// var selectedItem = this.getView().byId("languageSelect").getSelectedKey()
			//
			// var language=sap.ui.getCore().getConfiguration().getLanguage()
			// if(selectedItem==='Hindi'){
			// 	sap.ui.getCore().getConfiguration().setLanguage('hi');
			// 	// this.getView().byId("languageSelect").setSelectedKey("Hindi");
			// 	location.replace("http://localhost:3000?sap-ui-language=hi/#/Customers")
			// 	that.oRouter.navTo("Customers");
			// }
			// else {
			// 	sap.ui.getCore().getConfiguration().setLanguage('en');
			//
			// 	location.replace("http://localhost:3000/#/Customers")
			// // this.getView().byId("languageSelect").setSelectedKey("English")
			// that.oRouter.navTo("Customers");
			// }
		},
		// 		onAfterRendering: function(){debugger;
		// 	this.UserInfoService = sap.ushell.Container.getService("UserInfo");
		// 	var that = this;
		// 	this.UserInfoService.getLanguageList().then(function(langJSON){
		// 		var oModel = new sap.ui.model.json.JSONModel();
		// 		oModel.setData(langJSON);
		// 		that.getView().setModel(oModel, "AvailableLanguages");
		//
		// 		var user = that.UserInfoService.getUser();
		// 		var userLanguage = user.getLanguage();
		//
		// 		var languageSelect = that.getView().byId("languageSelect");
		// 		languageSelect.setSelectedKey(userLanguage);
		// 	});
		// },

		onDropDownSelect: function(oEvent) {
				debugger;

				// var selectedItem = oEvent.getParameter("selectedItem");
				var selectedlaunguage = this.getView().byId("languageSelect").getSelectedKey();
				if (selectedlaunguage === 'Hi') {
					sap.ui.getCore().getConfiguration().setLanguage('Hi');
					// window.location.hash="sap-ui-language=hi";
					window.navigator.browserLanguage="?sap-ui-language=hi";
					// window.location.search = "?sap-ui-language=hi";
					window.navigator.language="?sap-ui-language=hi";

					// this.oRouter.navTo("Customers");

				}
				// else {
				// 	window.location.href = "http://localhost:3000";
				// 	this.getView().byId("languageSelect").setSelectedKey("En")
				// 	// oRouter.navTo("Customers");
				// }
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf victoria.view.App
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf victoria.view.App
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf victoria.view.App
		 */
		//	onExit: function() {
		//
		//	}

	});

});
