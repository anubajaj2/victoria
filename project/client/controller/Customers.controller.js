/*global location*/
sap.ui.define([
	"victoria/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"victoria/models/formatter",
	"sap/m/MessageToast",
	"sap/ui/model/Filter"
], function(
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
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			//Actual Tunch : StandardCost
			//Wastage : ZipPostalCode , Customer Tunch : MobilePhone
			//Alarm Below : TargetLevel
			//Price per pc/gm : QuantityPerUnit
			//Making : Address
			var that = this;
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			loginUser = "Hey " + loginUser;
			this.getView().byId("idUser").setText(loginUser);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
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
				"items": [{
					"text": "Sikar"
				}, {
					"text": "Churu"
				}, {
					"text": "Jaipur"
				}]
			});
			var oViewModel2 = new JSONModel({
				"items": [{
					"text": "gm"
				}, {
					"text": "pcs"
				}]
			});
			var oViewModel3 = new JSONModel({
				"items": [{
					"text": "Retail Customer"
				}, {
					"text": "Agent"
				}, {
					"text": "Karigar"
				}, {
					"text": "Retailer"
				}, {
					"text": "Maker"
				}, {
					"text": "Kata Center"
				}]
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
			BaseController.prototype.onInit.apply(this);

			// var typeValue = this.getModel("oViewModel3").getProperty("/selectedKey");
			// this.getView().getModel("customerModel").setProperty("/Type", typeValue);
			var oViewDetailModel = new JSONModel({
				"buttonText": "Save",
				"deleteEnabled": false,
				"codeEnabled": true

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
		onSuggestionItemSelected: function(oEvent) {
			//debugger;
			var sId = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath())
				.id;
			this.getView().getModel("customerModel").setProperty("/City", sId);
		},
		onPressCustCodeDownload: function() {
    //   var reportType = "Customer_Codes";
    //   $.post("/custCodeDownload",{type: reportType}).then(function(oData)
    // {
    //   debugger;
    //   MessageToast.show("Data downloaded successfully");
    // },function(oError){debugger;
    //   MessageToast.show("Data could not be downloaded");
    // });
    window.open("/custCodeDownload?type=Customer_Codes");
    },
		onSelectChange: function(oEvent) {
			debugger;
			var oValue = oEvent.getSource().getId();
			// var oSelect = oEvent.getParameter("selectedItem").getText();
			var oSelect = oEvent.getParameter("selectedItem").mProperties.key;
			// if(oValue === "__component0---idCustomers--idCity"){
			// 	this.getView().getModel("customerModel").setProperty("/City", oSelect);
			// }
			if (oValue === "__component0---idCustomers--idType") {
				this.getView().getModel("customerModel").setProperty("/Type", oSelect);
				this.getView().byId("idCityField").focus();
			}
			if (oValue === "__component0---idCustomers--idGroup") {
				this.getView().getModel("customerModel").setProperty("/Group", oSelect);
				this.getView().byId("idType").focus();
			}
		},
		onSelectChangeGroup: function(oEvent) {
			var oSelect = oEvent.getParameter("selectedItem").getText();
			this.getView().getModel("customerModel").setProperty("/Group", oSelect);
		},
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		_onRouteMatched: function() {
			var that = this;
			var viewModel = this.getView().getModel("viewModel");
			viewModel.setProperty("/codeEnabled", true);
			viewModel.setProperty("/buttonText", "Save");
			viewModel.setProperty("/deleteEnabled", false);
			var odataModel = new JSONModel({
				"CustomerCodeState": "None",
				"CityState": "None",
				"GroupState": "None",
				"NameState": "None",
				"TypeState": "None"

			});
			this.setModel(odataModel, "dataModel");

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/Customers", "GET", {}, {}, this)
				.then(function(oData) {
					var oModelCustomer = new JSONModel();
					oModelCustomer.setData(oData);
					that.getView().setModel(oModelCustomer, "customerModelInfo");

				}).catch(function(oError) {
					MessageToast.show(that.resourceBundle.getText("ReqField"));
				});

			// this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			// 		"/Cities", "GET", {}, {}, this)
			// 	.then(function(oData) {
			// 		var oModelCity = new JSONModel();
			// 		oModelCity.setData(oData);
			// 		that.getView().setModel(oModelCity, "cityModelInfo");
			//
			// 	}).catch(function(oError) {
			// 		MessageToast.show(that.resourceBundle.getText("ReqField"));
			// 	});

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/Groups", "GET", {}, {}, this)
				.then(function(oData) {
					var oModelGroup = new JSONModel();
					oModelGroup.setData(oData);
					that.getView().setModel(oModelGroup, "groupModelInfo");

				}).catch(function(oError) {
					MessageToast.show(that.resourceBundle.getText("ReqField"));
				});
			this.clearCustomer();

			$(document).keydown(function(evt) {

				var elm = document.URL.split('/');

				if (elm[elm.length - 1] === 'Customers') {
					if (evt.keyCode == 68 && (evt.ctrlKey) && (evt.altKey)) {
						evt.preventDefault();
						// alert('Ctr + Alt + D Pressed');
						that.deleteAllCustomers();
					} else if (evt.keyCode == 69 && (evt.ctrlKey) && (evt.altKey)) {
						evt.preventDefault();
						// alert('Ctr + Alt + E Pressed');
						that.deleteAllEntrys();
					} else if (evt.keyCode == 65 && (evt.ctrlKey) && (evt.altKey)) {
						evt.preventDefault();
						// alert('Ctr + Alt + A Pressed');
						that.deleteAllTables();
					}
				}
			});

		},

		// onAfterRendering: function() {
		// 	var focusthis = this;
		//
		// 	this.getView().byId("idCustomerCode").attachBrowserEvent("focusout", myFunction);
		//
		// 	function myFunction() {
		// 		var selCust = document.getElementById("__component0---idCustomers--idCustomerCode-inner").value;
		// 		var that = focusthis;
		// 		var customerModel = focusthis.getView().getModel("customerModel");
		// 		// var selData = oEvent.getParameter("value").toLocaleUpperCase();
		// 		customerModel.setProperty("/CustomerCode", selCust);
		// 		var oFilter = new sap.ui.model.Filter("CustomerCode", "EQ", selCust);
		// 		focusthis.ODataHelper.callOData(focusthis.getOwnerComponent().getModel(),
		// 				"/Customers", "GET", {
		// 					filters: [oFilter]
		// 				}, {}, focusthis)
		// 			.then(function(oData) {
		// 				debugger;
		// 				if (oData.results.length > 0) {
		// 					console.log(focusthis.allMasterData.cities[oData.results[0].City].cityCode)
		// 					that.getView().byId("idCustomerCode").setValue(oData.results[0].CustomerCode);
		// 					// that.getView().byId("idCustomerCode").setEditable(false);
		// 					that.getView().byId("idName").setValue(oData.results[0].Name);
		// 					that.getView().byId("idCityField").setSelectedKey(oData.results[0].City);
		// 					that.getView().byId("idGroup").setSelectedKey(oData.results[0].Group);
		// 					that.getView().byId("idAddress").setValue(oData.results[0].Address);
		// 					that.getView().byId("idType").setValue(oData.results[0].Type);
		// 					that.getView().byId("idMobilePhone").setValue(oData.results[0].MobilePhone);
		// 					that.getView().byId("idSecondaryPhone").setValue(oData.results[0].SecondaryPhone);
		//
		// 					customerModel.setProperty("/CustomerCode", oData.results[0].id);
		// 					customerModel.setProperty("/City", oData.results[0].City);
		// 					customerModel.setProperty("/Name", oData.results[0].Name);
		// 					customerModel.setProperty("/MobilePhone", oData.results[0].MobilePhone);
		// 					customerModel.setProperty("/Address", oData.results[0].Address);
		// 					customerModel.setProperty("/SecondaryPhone", oData.results[0].SecondaryPhone);
		// 					var oGroup = that.getView().byId("idGroup");
		// 					oGroup.setSelectedKey(oData.results[0].Group);
		// 					customerModel.setProperty("/Group", oData.results[0].Group);
		// 					var oCity = that.getView().byId("idCityField");
		// 					oCity.setSelectedKey(oData.results[0].City);
		// 					customerModel.setProperty("/Id", oData.results[0].id);
		// 					var oType = that.getView().byId("idType");
		// 					oType.setSelectedKey(oData.results[0].Type);
		// 					customerModel.setProperty("/Type", oData.results[0].Type);
		//
		// 					var viewModel = that.getView().getModel("viewModel");
		// 					viewModel.setProperty("/buttonText", "Update");
		// 					viewModel.setProperty("/deleteEnabled", true);
		// 					viewModel.setProperty("/codeEnabled", false);
		//
		// 				} else {
		// 					that.getView().byId("idCustomerCode").setEditable(true);
		// 				}
		//
		// 			}).catch(function(oError) {
		// 				// MessageToast.show("cannot fetch the data");
		// 			});
		//
		// 	}
		//
		// },

		_myFunction1: function() {
			debugger;
		},
		onKeyPress: function(oEvent) {

			var input = oEvent.getSource();
			input.setValue(input.getValue().toUpperCase());
		},

		toggleFullScreen: function() {
			debugger;
			var btnId = "idFullScreenBtn";
			var headerId = "__component0---idCustomers--CustomerHeader";
			this.toggleUiTable(btnId, headerId)
		},

		deleteAllCustomers: function() {
			debugger;
			var that = this;
			sap.m.MessageBox.confirm(
				"Do you want to Delete All Customers?", {
					title: "Confirm",
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: "",
					onClose: function(sAction) {
						debugger;
						if (sAction === "OK") {
							$.post("/deleteRecords", {
								// customerId: "",
								entityName: "Customer"
							}).done(function(response) {
								sap.m.MessageToast.show(response.msg);
								// sap.m.MessageToast.show("Selected records are deleted");
							});
						}
					}
				}
			);

		},

		deleteAllEntrys: function() {
			debugger;
			var that = this;
			sap.m.MessageBox.confirm(
				"Do you want to Delete All Entrys?", {
					title: "Confirm",
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: "",
					onClose: function(sAction) {
						debugger;
						if (sAction === "OK") {
							debugger;

							$.post("/deleteRecords", {
								// customerId: "",
								entityName: "EntryD"
							}).done(function(response) {
								sap.m.MessageToast.show(response.msg);
								// sap.m.MessageToast.show("Selected records are deleted");
							});
						}
					}
				}
			);

		},

		deleteAllTables: function() {
			debugger;
			var that = this;
			sap.m.MessageBox.confirm(
				"Do you want to Delete All Tables?", {
					title: "Confirm",
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: "",
					onClose: function(sAction) {
						debugger;
						if (sAction === "OK") {

							$.post("/deleteRecords", {
								// customerId: "",
								entityName: "DelAll"
							}).done(function(response) {
								sap.m.MessageToast.show(response.msg);
								// sap.m.MessageToast.show("Selected records are deleted");
							});
						}
					}
				}
			);

		},

		additionalInfoValidation: function() {
			debugger;
			var customerModel = this.getView().getModel("customerModel");
			var oDataModel = this.getView().getModel("dataModel");
			if (customerModel.getData().CustomerCode === "") {
				oDataModel.setProperty("/CustomerCodeState", "Error");
			} else {
				oDataModel.setProperty("/CustomerCodeState", "None");
			}
			if (customerModel.getData().Name === "") {
				oDataModel.setProperty("/NameState", "Error");
			} else {
				oDataModel.setProperty("/NameState", "None");
			}
			if (customerModel.getData().Group === "") {
				var oSelKey = this.byId("idGroup").getSelectedKey();
				customerModel.setProperty("/Group", oSelKey);
			} else {
				oDataModel.setProperty("/GroupState", "None");
			}
			if (customerModel.getData().City === "") {
				var oSelKey = this.byId("idCityField").getSelectedKey();
				customerModel.setProperty("/City", oSelKey);
			} else {
				oDataModel.setProperty("/CityState", "None");
			}
			if (customerModel.getData().Type === "") {
				var oSelKey = this.byId("idType").getSelectedKey();
				customerModel.setProperty("/Type", oSelKey);
			} else {
				oDataModel.setProperty("/TypeState", "None");
			}
		},

		ValueChangeCustomer: function(oEvent) {
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

		customerCodeEnter: function(oEvent) {
			debugger;
			this.getView().byId("idName").focus();
			// $(function () {
			// 	$('input:text:first').focus();
			// 	var $inp = $('input:text');
			// 	$inp.bind('keypress', function (e) {
			// 		//var key = (e.keyCode ? e.keyCode : e.charCode);
			// 		var key = e.which;
			// 		if (key == 13) {
			// 			e.preventDefault();
			// 			var nxtIdx = $inp.index(this) + 1;
			// 			$(":input:text:eq(" + nxtIdx + ")").focus();
			// 		}
			// 	});
			// });
			var firstThat = this;
			var that = this;
			debugger;
			var customerModel = this.getView().getModel("customerModel");
			var selData = oEvent.getParameter("value").toLocaleUpperCase();
			customerModel.setProperty("/CustomerCode", selData);
			var oFilter = new sap.ui.model.Filter("CustomerCode", "EQ", selData);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/Customers", "GET", {
						filters: [oFilter]
					}, {}, this)
				.then(function(oData) {
					var oModelCustomer = new JSONModel();
					oModelCustomer.setData(oData);
					// that.getView().setModel(oModelCustomer, "customerModInfo");
					var customerModInfo = oModelCustomer.getData().results[0];
					var dataModel = that.getView().getModel("dataModel");
					var viewModel = that.getView().getModel("viewModel");
					that.getView().byId("idCustomerCode").setValue(selData);
					var oCustCode = that.getView().byId("idCustomerCode").getValue();
					if (customerModInfo.id.length > 0) {
						customerModel.setProperty("/CustomerCode", customerModInfo.id);
						customerModel.setProperty("/City", customerModInfo.City);
						customerModel.setProperty("/Name", customerModInfo.Name);
						customerModel.setProperty("/MobilePhone", customerModInfo.MobilePhone);
						customerModel.setProperty("/Address", customerModInfo.Address);
						customerModel.setProperty("/SecondaryPhone", customerModInfo.SecondaryPhone);
						var oGroup = that.getView().byId("idGroup");
						oGroup.setSelectedKey(customerModInfo.Group);
						customerModel.setProperty("/Group", customerModInfo.Group);
						var oCity = that.getView().byId("idCityField");
						// oCity.setSelectedKey(customerModInfo.City);
						oCity.setSelectedKey(that.allMasterData.cities[customerModInfo.City].cityCode);
						that.getView().byId("idCityField").setValue(that.allMasterData.cities[customerModInfo.City].cityCode)
						console.log(that.allMasterData.cities);
						console.log(customerModInfo.City);
						console.log(that.allMasterData.cities[customerModInfo.City]);
						customerModel.setProperty("/Id", customerModInfo.id);
						var oType = that.getView().byId("idType");
						oType.setSelectedKey(customerModInfo.Type);
						customerModel.setProperty("/Type", customerModInfo.Type);
						viewModel.setProperty("/buttonText", "Update");
						viewModel.setProperty("/deleteEnabled", true);
						viewModel.setProperty("/codeEnabled", false);
						dataModel.setProperty("/typeEnabled", true);
						// this.additionalInfoValidation();
						// this.getView().byId("idName").focus();
						customerModel.refresh();
					} else {
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
						// customerModel.refresh();
					}
				}).catch(function(oError) {
					// MessageToast.show("cannot fetch the data");
				});

		},
		customerNameSubmit: function() {
			this.getView().byId("idAddress").focus();
		},
		customerAddressSubmit: function() {
			this.getView().byId("idGroup").focus();
		},
		customerCitySubmit: function() {
			this.getView().byId("idMobilePhone").focus();
			this.getView().byId("idMobilePhone").$().find("input").select();
		},
		customerMobilePhoneSubmit: function() {
			this.getView().byId("idSecondaryPhone").focus();
			this.getView().byId("idSecondaryPhone").$().find("input").select();
		},
		customerSecondaryPhoneSubmit: function() {
			this.getView().byId("customerAccept").focus();
		},
		customerCodeCheck: function(oEvent) {
			var customerModel = this.getView().getModel("customerModel");
			var selectedCustData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext()
				.getPath());
			var customerCode = selectedCustData.CustomerCode;
			var dataModel = this.getView().getModel("dataModel");
			// var productCode = customerModel.getData().ProductCode;
			// var productJson = this.getView().getModel("customerModelInfo").getData().results;
			var viewModel = this.getView().getModel("viewModel");
			var oCustCode = this.getView().byId("idCustomerCode").getValue();
			var found = customerCode;
			debugger;
			if (found.length > 0) {
				customerModel.setProperty("/CustomerCode", selectedCustData.id);
				customerModel.setProperty("/City", selectedCustData.City);
				customerModel.setProperty("/Name", selectedCustData.Name);
				customerModel.setProperty("/MobilePhone", selectedCustData.MobilePhone);
				customerModel.setProperty("/Address", selectedCustData.Address);
				customerModel.setProperty("/SecondaryPhone", selectedCustData.SecondaryPhone);
				var oGroup = this.getView().byId("idGroup");
				oGroup.setSelectedKey(selectedCustData.Group);
				customerModel.setProperty("/Group", selectedCustData.Group);
				var oCity = this.getView().byId("idCityField");
				//oCity.setSelectedKey(selectedCustData.City);
				customerModel.setProperty("/Id", selectedCustData.id);
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
			} else {
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
				// this.additionalInfoValidation();
				that.getView().byId("idName").focus();
				customerModel.refresh();
			}
		},

		clearCustomer: function() {
			// document.getElementById("__component0---idCustomers--idCustomerCode").addEventListener("focusout",myFunction);
			this.getView().byId("idCustomerCode").setEditable(true);
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
			// customerModel.getData().Group = "";
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
			// var groupVal = groupModel.getData().results[0];
			var oGroup = this.getView().byId("idGroup");
			oGroup.setSelectedKey("");
			var oCity = this.getView().byId("idCityField");
			oCity.setSelectedKey("");
			dataModel.setProperty("/CityState", "None");
			dataModel.setProperty("/GroupState", "None");
			dataModel.setProperty("/NameState", "None");
			customerModel.refresh();
			// this.clearValues();
			var custid = this.getView().byId("idCustomerCode");
			custid.setSelectedKey("");
			custid.setValue("");
		},

		SaveCustomer: function() {
			debugger;
			var that = this;
			var customerModel = this.getView().getModel("customerModel");
			var custId = customerModel.getData().Id;
			var customerCode = that.getView().byId("idCustomerCode").getValue();
			customerModel.setProperty("/CustomerCode", customerCode);
			var oCuscode = customerModel.getProperty("/CustomerCode").toLocaleUpperCase();
			customerModel.setProperty("/CustomerCode", oCuscode);
			debugger;
			that.additionalInfoValidation();
			var oret = true;
			if (customerModel.getData().Name === "" || customerModel.getData().CustomerCode === "") {
				that.additionalInfoValidation();
				MessageToast.show(that.resourceBundle.getText("Fields"));
				oret = false;
			}
			debugger;
			if (oret === true) {

				if (custId.length > 0) {

					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							"/Customers('" + custId + "')", "PUT", {}, customerModel.getData(), this)
						.then(function(oData) {
							MessageToast.show(that.resourceBundle.getText("Data"));
							// that._onRouteMatched();
							that.clearCustomer();
						}).catch(function(oError) {
							MessageToast.show(that.resourceBundle.getText("Data1"));
						});

				} else {
					var that = this;
					var oFilter = new sap.ui.model.Filter("CustomerCode", "EQ", oCuscode);
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							"/Customers", "GET", {
								filters: [oFilter]
							}, {}, this)
						.then(function(oData) {
							debugger;
							if (oData.results.length > 0) {
								MessageToast.show(that.resourceBundle.getText("Data2"));
							} else {
								that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
										"/Customer", "POST", {}, customerModel.getData(), that)
									.then(function(oData) {
										MessageToast.show(that.resourceBundle.getText("Data"));
										// that.clearCustomer();
										// that._onRouteMatched();
										that.clearCustomer();
									}).catch(function(oError) {
										MessageToast.show(that.resourceBundle.getText("Data1"));
									});
							}

						}).catch(function(oError) {
							// MessageToast.show("cannot fetch the data");
						});

				}
			}

		},

		deleteCustomer: async function() {
			debugger;
			var that = this;
			that.getView().setBusy(true);
			var customerModel = this.getView().getModel("customerModel");
			var customerCode = customerModel.getData().Id;
			var customerJson = this.getView().getModel("customerModelInfo").getData().results;
			if (customerModel.getData().CustomerCode === "" || customerModel.getData().Name === "" || customerModel.getData().City === "" ||
				customerModel.getData().Group === "") {
				MessageToast.show(that.resourceBundle.getText("Fields"));
				that.getView().setBusy(false);
				return;
			}

			function getCustomerCode(customerCode) {
				return customerJson.filter(
					function(data) {
						return data.CustomerCode === customerCode;
					}
				);
			}

			var found = getCustomerCode(customerCode);
			var typeModel = this.getView().getModel("typec");
			debugger;
			var flg = true;
			// await this.validateCustomer(customerCode,flg);

			var that = this;
			var tables = ["/Entrys", "/OrderHeaders", "/WSOrderHeaders", "/CustomerOrders", "/BookingDetails", "/BookingDlvDetails", "/Kacchis"];
			var oFilter = new sap.ui.model.Filter("Customer", "EQ", "'" + customerCode + "'");
			for (var i = 0; i < tables.length; i++) {
				debugger;

				await this.ODataHelper.callOData(this.getOwnerComponent().getModel(), tables[i],
						"GET", {
							filters: [oFilter]
						}, {}, this)
					.then(function(oData) {
						debugger;
						if (oData.results.length > 0) {
							that.Errmsg();
							flg = true;
							// break;
						} else {
							flg = false;
						}

					}).catch(function(oError) {
						var oPopover = that.getErrorMessage(oError);
					});

				if (flg === true) {
					// this.deleteCnfCustomer();
					break;
					that.getView().setBusy(false);
				}
			}
			debugger;
			if (flg === false) {
				this.deleteCnfCustomer(customerCode, customerModel);
				this.getView().setBusy(false);
			}

			debugger;

		},

		// validateCustomer:async function(customerCode,flg){
		// 	debugger;
		// 	var that=this;
		// 	var tables=["/Entrys","/OrderHeaders","/OrderHeaders","/CustomerOrders"];
		// 	var oFilter = new sap.ui.model.Filter("Customer","EQ",  "'"+customerCode+"'");
		// 	for(var i=0; i<tables.length; i++){
		// 		debugger;
		//
		// 		await this.ODataHelper.callOData(this.getOwnerComponent().getModel(), tables[i],
		// 															"GET", {filters: [oFilter]}, {}, this)
		// 										 .then(function(oData) {
		// 											 debugger;
		// 											 if(oData.results.length > 0 ){
		// 												 that.Errmsg();
		// 												 flg = true;
		// 												 break;
		// 											 }else{
		// 												 flg = false;
		//
		// 											 }
		//
		// 										 }).catch(function(oError) {
		// 											 var oPopover = that.getErrorMessage(oError);
		// 										 });
		//
		// 										 if(flg === false){
		// 				 							this.deleteCnfCustomer();
		// 				 							break;
		// 				 						}
		// 	}
		// },

		Errmsg: function() {
			MessageToast.show(that.resourceBundle.getText("Customer1"));
			this.getView().setBusy(false);
		},
		deleteCnfCustomer: function(customerCode, customerModel) {
			var that = this;

			sap.m.MessageBox.confirm(
				"Do you want to delete Customer", {
					title: "Confirm",
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: "",
					onClose: function(sAction) {
						debugger;
						if (sAction === "OK") {
							debugger;

							that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
									"/Customers('" + customerCode + "')", "DELETE", {}, {}, that)
								.then(function(oData) {
									MessageToast.show(that.resourceBundle.getText("Delete1"));
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
									MessageToast.show(that.resourceBundle.getText("Delete2"));
								});

							// sap.m.MessageToast.show("Selected records are deleted");
						}
					}
				}
			);

		},
		selectedCustomer: function(oEvent) {
			var item = oEvent.getParameter("selectedItem");
			var key = item.getText();
			var keya = item.getKey();
			var that = this;
			console.log(key);
			console.log(keya);
			this.getModel().read("/Customers(" + keya + ")", {
				success: function(data) {
					that.getModel("customerModel").setData(data);
					that.getModel("customerModel").setProperty("/City", data.CitycodeDetails.Code);
				}
			});
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
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},
		createNewCustomer: function() {
			var that = this;
			//var updatedData = that.getModel("customerModel").getProperty("/");
			var updatedData = {
				"Address": this.byId("idAddress").getValue(),
				"Attachments": "",
				"BusinessPhone": "",
				"Citycode": parseInt(this.byId("idCityField").getSelectedKey()),
				"Company": this.byId("customerCode").getValue(),
				"CountryRegion": "",
				"Customgroup": parseInt(this.byId("idCustomGrp").getSelectedKey()),
				"EmailAddress": null,
				"FaxNumber": "",
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
						"uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Citycodes(" + this.byId("idCityField").getSelectedKey() + ")"
					}
				},
				"CustomgroupDetails": {
					"__metadata": {
						"uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Customgroups(" + this.byId("idCustomGrp").getSelectedKey() + ")"
					}
				},
				"StandardgroupDetails": {
					"__metadata": {
						"uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Standardgroups(" + this.byId("idGroup").getSelectedKey() + ")"
					}
				}
			};
			this.getModel().create("/Customers", updatedData, {
				success: function() {
					MessageToast.show(that.resourceBundle.getText("create1"));
					// that.clearCustomer();
				}
			});
		},
		updateCustomer: function() {
			var that = this;
			//var updatedData = that.getModel("customerModel").getProperty("/");
			var updatedData = {
				"Address": this.byId("idAddress").getValue(),
				"Attachments": "",
				"BusinessPhone": "",
				"Citycode": parseInt(this.byId("idCityField").getSelectedKey()),
				"Company": this.byId("customerCode").getValue(),
				"CountryRegion": "",
				"Customgroup": parseInt(this.byId("idCustomGrp").getSelectedKey()),
				"EmailAddress": null,
				"FaxNumber": "",
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
						"uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Citycodes(" + this.byId("idCityField").getSelectedKey() + ")"
					}
				},
				"CustomgroupDetails": {
					"__metadata": {
						"uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Customgroups(" + this.byId("idCustomGrp").getSelectedKey() + ")"
					}
				},
				"StandardgroupDetails": {
					"__metadata": {
						"uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Standardgroups(" + this.byId("idGroup").getSelectedKey() + ")"
					}
				}
			};
			this.getModel().update("/Customers(" + that.getModel("customerModel").getProperty("/Id") + ")", updatedData, {
				success: function() {
					MessageToast.show(that.resourceBundle.getText("Update1"));
				}
			});
		},
		clearValues: function() {
			this.getModel("customerModel").setProperty("/Id", "");
			this.getModel("customerModel").setProperty("/City", "");
			this.getModel("customerModel").setProperty("/Company", "");
			this.getModel("customerModel").setProperty("/FirstName", "");
			this.getModel("customerModel").setProperty("/LastName", "");
			this.getModel("customerModel").setProperty("/MobilePhone", 0);
			this.getModel("customerModel").setProperty("/Address", 0);
			this.getModel("customerModel").setProperty("/ZipPostalCode", 0);
		},
		deleteProduct: function() {
			var that = this;
			this.getModel().remove("/Customers(" + that.getModel("customerModel").getProperty("/Id") + ")", {
				success: function() {
					MessageToast.show(that.resourceBundle.getText("Delete1"));
					that.clearValues();
				}
			});
		},
		Save: function() {
			debugger;
			var that = this;
			var aFilters = [];
			var oFilter = new Filter("Company", "EQ", that.getModel("customerModel").getProperty("/Company"));
			aFilters.push(oFilter);
			this.getModel().read("/Customers", {
				filters: aFilters,
				success: function(data) {

					if (data.results.length === 0) {
						that.createNewCustomer();
						// that.clearCustomer();
					} else {
						that.updateCustomer();
						// that.clearCustomer();
					}
				}
			});
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
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("Customers", {
					Id: sObjectId
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
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oDataModel.metadataLoaded().then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function() {
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

});
