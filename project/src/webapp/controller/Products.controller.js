/*global location*/
// jQuery.sap.require("victoria.utils.google");
// jQuery.sap.require("victoria.utils.test");
sap.ui.define([
	"victoria/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"victoria/models/formatter",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"victoria/libs/googletrans",
	"victoria/libs/googletransapi"
], function(
	BaseController,
	JSONModel,
	History,
	formatter,
	MessageToast,
	Filter,
	googletrans,
	googletransapi
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
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			//Actual Tunch : StandardCost
			//Wastage : ReorderLevel , Customer Tunch : ListPrice
			//Alarm Below : TargetLevel
			//Price per pc/gm : QuantityPerUnit
			//Making : MinimumReorderQuantity
			var that = this;
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			loginUser = "Hey " + loginUser;
			this.getView().byId("idUser").setText(loginUser);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					"Id": "",
					"ProductCode": "",
					"ProductName": "",
					"Type": "",
					"Karat": "",
					"HindiName": "",
					"Tunch": 0,
					"Wastage": 0,
					"CustomerTunch": 0,
					"AlertQuantity": 0,
					"Making": 0,
					"Category": "",
					"PricePerUnit": 0
				});
			var oViewModel1 = new JSONModel({
				"items": [{
					"text": "Silver"
				}, {
					"text": "Gold"
				}, {
					"text": "GS"
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
					"text": "22/20"
				}, {
					"text": "22/22"
				}]
			});

			//				this.getRouter().getRoute("Products").attachPatternMatched(this._onObjectMatched, this);
			//
			//				// Store original busy indicator delay, so it can be restored later on
			//				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "productModel");
			this.setModel(oViewModel1, "fixed");
			this.setModel(oViewModel2, "per");
			this.setModel(oViewModel3, "Karat");
			var oViewDetailModel = new JSONModel({
				"buttonText": "Save",
				"deleteEnabled": false,
				"typeEnabled": false

			});
			this.setModel(oViewDetailModel, "viewModel");

			// setTimeout(function() {
			// 		google.load("elements", "1", {
			// 							packages : "keyboard"
			// });
			//
			// function onLoad() {
			// 							var kbd = new google.elements.keyboard.Keyboard(
			// 																	[ google.elements.keyboard.LayoutCode.HINDI ]);
			// 		}
			// 		google.setOnLoadCallback(onLoad);
			// 	 }, 5000);
			//
			// 	 google.load("elements", "1", {
			// 						 packages : "keyboard"
			// });

			//  google.load("elements", "1", {
			// 						packages : "keyboard"
			// });
			//  function onLoad() {
			// 							 var kbd = new google.elements.keyboard.Keyboard(
			// 																	 [ google.elements.keyboard.LayoutCode.HINDI ]);
			// 		 }
			// 		 google.setOnLoadCallback(onLoad);

			// 				sap.ui.getCore().attachInit(function(){
			//
			// 					google.load("elements", "1", {
			// 											packages : "keyboard"
			// 				});
			//
			// 				function onLoad() {
			// 											var kbd = new google.elements.keyboard.Keyboard(
			// 																					[ google.elements.keyboard.LayoutCode.HINDI ]);
			// 						}
			// 						google.setOnLoadCallback(onLoad);
			//
			// });

			var oRouter = this.getRouter();
			oRouter.getRoute("Products").attachMatched(this._onRouteMatched, this);

		},
		onPressMaterialDownload: function() {
			var reportType = "Materials";
			//   $.post("/materialDownload",{type: reportType}).then(function(oData)
			// {
			//
			//   MessageToast.show("Data downloaded successfully");
			// },function(oError){
			//   MessageToast.show("Data could not be downloaded");
			// });
			window.open("/materialDownload?type=Materials");
		},


		onKeyPress: function(oEvent) {

			var input = oEvent.getSource();
			input.setValue(input.getValue().toUpperCase());
		},

		toggleFullScreen: function() {

			var btnId = "idFullScreenBtn";
			var headerId = "__component0---idProducts--ProductHeader";
			this.toggleUiTable(btnId, headerId)
		},

		onAfterRendering: function() {


			// var state = this.getView().byId("idHindiName").getState();
			// if(state=== true){
			google.load("elements", "1", {
				packages: "transliteration"
			});

			// function onLoad() {
			var options = {
				sourceLanguage: google.elements.transliteration.LanguageCode.ENGLISH,
				destinationLanguage: [google.elements.transliteration.LanguageCode.HINDI],
				shortcutKey: 'ctrl+g',
				transliterationEnabled: true
			};

			// Create an instance on TransliterationControl with the required
			// options.

			var control =
				new google.elements.transliteration.TransliterationControl(options);

			// Enable transliteration in the textbox with id
			// 'transliterateTextarea'.
			control.makeTransliteratable(['__component0---idProducts--idHindi-inner']);
			control.showControl('translControl');
			// }


			window.focus = this;
			this.getView().byId("idProductCode").attachBrowserEvent("focusout", newFunction);

			function newFunction() {

				var focusthis = window.focus;
				var productModel = focusthis.getView().getModel("productModel");
				var selProd = focusthis.getView().byId("idProductCode").getValue();
				var oFilter = new sap.ui.model.Filter("ProductCode", "EQ", selProd);
				var that = focusthis;

				focusthis.ODataHelper.callOData(focusthis.getOwnerComponent().getModel(),
						"/Products", "GET", {
							filters: [oFilter]
						}, {}, focusthis)
					.then(function(oData) {

						if (oData.results.length > 0) {

							that.getView().byId("idProductCode").setValue(oData.results[0].ProductCode);
							// that.getView().byId("idCustomerCode").setEditable(false);
							that.getView().byId("idProductName").setValue(oData.results[0].ProductName);
							that.getView().byId("idType").setSelectedKey(oData.results[0].Type);
							that.getView().byId("idKarat").setSelectedKey(oData.results[0].Karat);
							that.getView().byId("idHindi").setValue(oData.results[0].HindiName);
							that.getView().byId("idStandardCost").setValue(oData.results[0].Tunch);
							that.getView().byId("idCustomerTunch").setValue(oData.results[0].CustomerTunch);
							that.getView().byId("idReorderLevel").setValue(oData.results[0].Wastage);
							that.getView().byId("idListPrice").setValue(oData.results[0].CustomerTunch);
							that.getView().byId("idTargetLevel").setValue(oData.results[0].AlertQuantity);
							that.getView().byId("idMinimumReorderQuantity").setValue(oData.results[0].Making);
							that.getView().byId("idCustomerMaking").setValue(oData.results[0].CustomerMaking);
							that.getView().byId("idCategory").setValue(oData.results[0].Category);
							that.getView().byId("idPricePerUnit").setValue(oData.results[0].MakingD);
							var viewModel = that.getView().getModel("viewModel");
							var prodModInfo = oData.results[0];
							productModel.setProperty("/ProductCode", prodModInfo.id);
							productModel.setProperty("/ProductName", prodModInfo.ProductName);
							var oCat = that.getView().byId("idCategory");
							oCat.setSelectedKey(prodModInfo.Category);
							productModel.setProperty("/Category", prodModInfo.Category);
							var oType = that.getView().byId("idType");
							oType.setSelectedKey(prodModInfo.Type);
							productModel.setProperty("/Type", prodModInfo.Type);
							productModel.setProperty("/Making", prodModInfo.Making);
							productModel.setProperty("/CustomerMaking", prodModInfo.CustomerMaking);
							productModel.setProperty("/CustomerTunch", prodModInfo.CustomerTunch);
							productModel.setProperty("/PricePerUnit", prodModInfo.PricePerUnit);
							productModel.setProperty("/Wastage", prodModInfo.Wastage);
							productModel.setProperty("/Tunch", prodModInfo.Tunch);
							productModel.setProperty("/CustomerTunch", prodModInfo.CustomerTunch);
							productModel.setProperty("/AlertQuantity", prodModInfo.AlertQuantity);
							productModel.setProperty("/HindiName", prodModInfo.HindiName);
							productModel.setProperty("/Id", prodModInfo.id);
							if (prodModInfo.Type === "Gold") {
								viewModel.setProperty("/typeEnabled", true);
								productModel.setProperty("/Karat", prodModInfo.Karat);
								var oKarat = that.getView().byId("idKarat");
								oKarat.setSelectedKey(prodModInfo.Karat);
							} else {
								var karatType = that.getView().byId("idKarat");
								karatType.setSelectedKey("");
							}

							viewModel.setProperty("/buttonText", "Update");
							viewModel.setProperty("/deleteEnabled", true);
							viewModel.setProperty("/codeEnabled", false);

						} else {
							// that.getView().byId("idCustomerCode").setEditable(true);
						}

					}).catch(function(oError) {
						// MessageToast.show("cannot fetch the data");
					});

			}

			// this.getView().byId("idProductCode").addEventDelegate({
			//     onfocusout : function(focusthat) {
			//
			//       // alert("focus");
			//     }
			//   });
			// this.getView().byId("idProductCode").addEventListener("focusout", fncFocusOut);
			// function fncFocusOut(){
			//
			// }
		},

		// onSubmit:function(oEvent){
		//
		// 	var state = oEvent.getParameters().state;
		// 	if(state=== false){
		//
		// }
		// else{
		//
		// 				}
		// },

		onSelectChange: function(oEvent) {
			var oSelect = oEvent.getParameter("selectedItem").getText();
			this.getView().getModel("productModel").setProperty("/Karat", oSelect);
		},
		onCatChange: function(oEvent) {
			var oSelectCat = oEvent.getParameter("selectedItem").getText();
			this.getView().getModel("productModel").setProperty("/Category", oSelectCat);
		},

		onTypeChange: function(oEvent) {
			// var oSelectType = oEvent.getParameter("selectedItem").get;
			this.getView().byId("idHindi").focus();
			var oSelectType = oEvent.getParameter("selectedItem").getText();
			var viewModel = this.getView().getModel("viewModel");
			var productModel = this.getView().getModel("productModel");
			productModel.setProperty("/Type", oSelectType);
			if (oSelectType === "Gold") {
				viewModel.setProperty("/typeEnabled", true);
				var oKarat = this.getView().byId("idKarat").getSelectedKey();
				productModel.setProperty("/Karat", oKarat);
			} else {
				viewModel.setProperty("/typeEnabled", false);
				productModel.getProperty("/Karat");
				productModel.setProperty("/Karat", "");
				var karatType = this.getView().byId("idKarat");
				karatType.setSelectedKey("");
			}
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
			viewModel.setProperty("/typeEnabled", false);
			var odataModel = new JSONModel({
				"ProductCodeState": "None"

			});
			this.setModel(odataModel, "dataModel");

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/Products", "GET", {}, {}, this)
				.then(function(oData) {
					var oModelProduct = new JSONModel();
					oModelProduct.setData(oData);
					that.getView().setModel(oModelProduct, "productModelInfo");

				}).catch(function(oError) {
					MessageToast.show(that.resourceBundle.getText("ReqField"));
				});
			this.clearProduct();
		},

		additionalInfoValidation: function() {
			var productModel = this.getView().getModel("productModel");
			var oDataModel = this.getView().getModel("dataModel");
			if (productModel.getData().ProductCode === "") {
				oDataModel.setProperty("/ProductCodeState", "Error");
			} else {
				oDataModel.setProperty("/ProductCodeState", "None");
			}
			if (productModel.getData().Type === "") {
				var oSelKey = this.byId("idType").getSelectedKey();
				productModel.setProperty("/Type", oSelKey);
			} else {
				oDataModel.setProperty("/TypeState", "None");
			}
		},

		ValueChangeMaterial: function(oEvent) {
			var oSource = oEvent.getSource();
			var oFilter = new sap.ui.model.Filter("ProductCode",
				sap.ui.model.FilterOperator.Contains, oEvent.getParameter("suggestValue").toLocaleUpperCase());
			oSource.getBinding("suggestionItems").filter(oFilter);
		},

		productCodeEnter: function(oEvent) {

			this.getView().byId("idProductName").focus();
			// $(function() {
			// 				$('input:text:first').focus();
			// 				var $inp = $('input:text');
			// 				$inp.bind('keypress', function(e) {
			// 						//var key = (e.keyCode ? e.keyCode : e.charCode);
			// 						var key = e.which;
			// 						if (key == 13) {
			// 								e.preventDefault();
			// 								var nxtIdx = $inp.index(this) + 1;
			// 								$(":input:text:eq(" + nxtIdx + ")").focus();
			// 						}
			// 				});
			// 		});
			var that = this;
			// var productModel = this.getView().getModel("Products");
			var productModel = this.getView().getModel("productModel");
			var selData = oEvent.getParameter("value").toLocaleUpperCase();
			productModel.setProperty("/ProductCode", selData);
			var oFilter = new sap.ui.model.Filter("ProductCode", "EQ", selData);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/Products", "GET", {
						filters: [oFilter]
					}, {}, this)
				.then(function(oData) {
					var oModelProduct = new JSONModel();
					oModelProduct.setData(oData);
					// that.getView().setModel(oModelCustomer, "customerModInfo");
					var prodModInfo = oModelProduct.getData().results[0];
					var viewModel = that.getView().getModel("viewModel");
					that.getView().byId("idProductCode").setValue(selData);
					var oProdCode = that.getView().byId("idProductCode").getValue();
					// var found = getProductCode(productCode);
					if (prodModInfo.id.length > 0) {
						// productModel.setProperty("/ProductCode", productCode);
						// productModel.setProperty("/id", selectedMatData.id);
						productModel.setProperty("/ProductCode", prodModInfo.id);
						productModel.setProperty("/ProductName", prodModInfo.ProductName);
						var oCat = that.getView().byId("idCategory");
						oCat.setSelectedKey(prodModInfo.Category);
						productModel.setProperty("/Category", prodModInfo.Category);
						var oType = that.getView().byId("idType");
						oType.setSelectedKey(prodModInfo.Type);
						productModel.setProperty("/Type", prodModInfo.Type);
						productModel.setProperty("/Making", prodModInfo.Making);
						productModel.setProperty("/CustomerMaking", prodModInfo.CustomerMaking);
						productModel.setProperty("/CustomerTunch", prodModInfo.CustomerTunch);
						productModel.setProperty("/PricePerUnit", prodModInfo.PricePerUnit);
						productModel.setProperty("/Wastage", prodModInfo.Wastage);
						productModel.setProperty("/Tunch", prodModInfo.Tunch);
						productModel.setProperty("/CustomerTunch", prodModInfo.CustomerTunch);
						productModel.setProperty("/AlertQuantity", prodModInfo.AlertQuantity);
						productModel.setProperty("/HindiName", prodModInfo.HindiName);
						productModel.setProperty("/Id", prodModInfo.id);
						if (prodModInfo.Type === "Gold") {
							viewModel.setProperty("/typeEnabled", true);
							productModel.setProperty("/Karat", prodModInfo.Karat);
							var oKarat = that.getView().byId("idKarat");
							oKarat.setSelectedKey(prodModInfo.Karat);
						} else {
							var karatType = that.getView().byId("idKarat");
							karatType.setSelectedKey("");
						}
						viewModel.setProperty("/buttonText", "Update");
						viewModel.setProperty("/deleteEnabled", true);
						viewModel.setProperty("/codeEnabled", false);
						// that.additionalInfoValidation();
						// this.getView().byId("idProductName").focus();
						productModel.refresh();
					} else {
						productModel.getData().Category = "";
						productModel.getData().Type = "";
						productModel.getData().Karat = "";
						productModel.getData().CustomerTunch = 0;
						productModel.getData().Making = 0;
						productModel.getData().ProductName = "";
						productModel.getData().PricePerUnit = 0;
						productModel.getData().Wastage = 0;
						productModel.getData().Tunch = 0;
						productModel.getData().AlertQuantity = 0;
						productModel.getData().HindiName = "";
						viewModel.setProperty("/buttonText", "Save");
						viewModel.setProperty("/deleteEnabled", false);
						viewModel.setProperty("/codeEnabled", false);
						that.additionalInfoValidation();
						that.getView().byId("idProductName").focus();
						productModel.refresh();

					}
				}).catch(function(oError) {
					// MessageToast.show("cannot fetch the data");
				});
		},
		productCodeCheck: function(oEvent) {

			// var productModel = this.getView().getModel("Products");
			var productModel = this.getView().getModel("productModel");
			var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext()
				.getPath());
			var productCode = selectedMatData.ProductCode;
			var viewModel = this.getView().getModel("viewModel");
			var oProdCode = this.getView().byId("idProductCode").getValue();
			var found = productCode;
			// var found = getProductCode(productCode);
			if (found.length > 0) {
				// productModel.setProperty("/ProductCode", productCode);
				// productModel.setProperty("/id", selectedMatData.id);
				productModel.setProperty("/ProductCode", selectedMatData.id);
				productModel.setProperty("/ProductName", selectedMatData.ProductName);
				var oCat = this.getView().byId("idCategory");
				oCat.setSelectedKey(selectedMatData.Category);
				productModel.setProperty("/Category", selectedMatData.Category);
				var oType = this.getView().byId("idType");
				oType.setSelectedKey(selectedMatData.Type);
				productModel.setProperty("/Type", selectedMatData.Type);
				productModel.setProperty("/Making", selectedMatData.Making);
				productModel.setProperty("/CustomerMaking", prodModInfo.CustomerMaking);
				productModel.setProperty("/CustomerTunch", selectedMatData.CustomerTunch);
				productModel.setProperty("/PricePerUnit", selectedMatData.PricePerUnit);
				productModel.setProperty("/Wastage", selectedMatData.Wastage);
				productModel.setProperty("/Tunch", selectedMatData.Tunch);
				productModel.setProperty("/CustomerTunch", selectedMatData.CustomerTunch);
				productModel.setProperty("/AlertQuantity", selectedMatData.AlertQuantity);
				productModel.setProperty("/HindiName", selectedMatData.HindiName);
				productModel.setProperty("/Id", selectedMatData.id);
				if (selectedMatData.Type === "Gold") {
					viewModel.setProperty("/typeEnabled", true);
					productModel.setProperty("/Karat", selectedMatData.Karat);
				} else {
					var karatType = this.getView().byId("idKarat");
					karatType.setSelectedKey("");
				}
				viewModel.setProperty("/buttonText", "Update");
				viewModel.setProperty("/deleteEnabled", true);
				viewModel.setProperty("/codeEnabled", false);
				this.additionalInfoValidation();
				this.getView().byId("idProductName").focus();
				productModel.refresh();
			} else {
				productModel.getData().Category = "";
				productModel.getData().Type = "";
				productModel.getData().Karat = "";
				productModel.getData().CustomerTunch = 0;
				productModel.getData().Making = 0;
				productModel.getData().ProductName = "";
				productModel.getData().PricePerUnit = 0;
				productModel.getData().Wastage = 0;
				productModel.getData().Tunch = 0;
				productModel.getData().AlertQuantity = 0;
				productModel.getData().HindiName = "";
				viewModel.setProperty("/buttonText", "Save");
				viewModel.setProperty("/deleteEnabled", false);
				viewModel.setProperty("/codeEnabled", false);
				this.additionalInfoValidation();
				this.getView().byId("idProductName").focus();
				productModel.refresh();

			}
		},

		onChange: function(oEvent) {
			// var oInput = oEvent.getSource();
			//  this.handleGoldSilverValidation(oInput);
			var oTunch = this.getView().byId("idStandardCost").getValue();
			var oWaste = this.getView().byId("idReorderLevel").getValue();
			var oCustTunch = this.getView().byId("idListPrice");
			oCustTunch.setValue(+oTunch + +oWaste);
		},
		onProductNameSubmit: function() {
			this.getView().byId("idType").focus();
		},
		onSubmitHindiName: function() {
			this.getView().byId("idStandardCost").focus();
			this.getView().byId("idStandardCost").$().find("input").select();
		},
		onSubmitStandardCost: function() {
			this.getView().byId("idReorderLevel").focus();
			this.getView().byId("idReorderLevel").$().find("input").select();
		},
		onSubmitReorderLevel: function() {
			this.getView().byId("idListPrice").focus();
			this.getView().byId("idListPrice").$().find("input").select();
		},
		onSubmitListPrice: function() {
			this.getView().byId("idTargetLevel").focus();
			this.getView().byId("idTargetLevel").$().find("input").select();
		},
		onSubmitTargetLevel: function() {
			this.getView().byId("idMinimumReorderQuantity").focus();
			this.getView().byId("idMinimumReorderQuantity").$().find("input").select();
		},
		onSubmitMinimumReorderQuantity: function() {
			this.getView().byId("idCategory").focus();
		},
		onSubmitCategory: function() {
			this.getView().byId("idPricePerUnit").focus();
			this.getView().byId("idPricePerUnit").$().find("input").select();
		},
		onSubmitPricePerUnit: function() {
			this.getView().byId("acceptButton").focus();
		},

		clearProduct: function() {

			var productModel = this.getView().getModel("productModel");
			var viewModel = this.getView().getModel("viewModel");
			var dataModel = this.getView().getModel("dataModel");
			var typeModel = this.getView().getModel("fixed");
			var catType = this.getView().byId("idCategory");
			catType.setSelectedKey("");
			productModel.getData().Category = "";
			productModel.getData().Type = "";
			var karatType = this.getView().byId("idKarat");
			karatType.setSelectedKey("");
			productModel.getData().Id = "";
			productModel.getData().ProductCode = "";
			productModel.getData().CustomerTunch = 0;
			productModel.getData().Making = 0;
			productModel.getData().CustomerMaking = 0;
			productModel.getData().ProductName = "";
			productModel.getData().PricePerUnit = 0;
			productModel.getData().Wastage = 0;
			productModel.getData().Tunch = 0;
			productModel.getData().AlertQuantity = 0;
			productModel.getData().HindiName = "";
			var prodId = this.getView().byId("idProductCode");
			prodId.setSelectedKey("");
			prodId.setValue("");
			// var prodType = this.getView().byId("idType");
			// prodType.setSelectedKey("");
			var typeValue = typeModel.getData().items[0].text;
			var oType = this.getView().byId("idType");
			oType.setSelectedKey(typeValue);
			viewModel.setProperty("/codeEnabled", true);
			viewModel.setProperty("/buttonText", "Save");
			viewModel.setProperty("/deleteEnabled", false);
			viewModel.setProperty("/typeEnabled", false);
			dataModel.setProperty("/ProductCode", "None");
			productModel.refresh();

		},

		SaveProduct: function(oEvent) {

			var that = this;
			var productModel = that.getView().getModel("productModel");
			var prodId = productModel.getData().Id;
			// var prodId = productModel.getData().ProductCode;
			var productCode = that.getView().byId("idProductCode").getValue();
			productModel.setProperty("/ProductCode", productCode);
			var oProdcode = productModel.getProperty("/ProductCode").toLocaleUpperCase();
			productModel.setProperty("/ProductCode", oProdcode);
			var prodType = productModel.getProperty("/Type");
			if (prodType === "") {
				var typeKey = this.getView().byId("idType").getSelectedKey();
				productModel.setProperty("/Type", typeKey);
			}
			var prodCat = productModel.getProperty("/Category");
			if (prodCat === "") {
				var catKey = this.getView().byId("idCategory").getSelectedKey();
				productModel.setProperty("/Category", catKey);
			}

			that.additionalInfoValidation();
			if (productCode === "") {
				this.additionalInfoValidation();
				MessageToast.show(that.resourceBundle.getText("Fields"));
				return;
			}
			// var aFilters = [];
			// var oFilter = new Filter("ProductCode", "EQ", productModel.getProperty("/ProductCode"));
			// aFilters.push(oFilter);
			// that.getModel().read("/Products",{
			// 	filters: aFilters,
			// 	success: function(data){
			// 		if(data.results.length > 0){

			if (prodId.length > 0) {
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/Products('" + prodId + "')", "PUT", {}, productModel.getData(), this)
					.then(function(oData) {
						MessageToast.show(that.resourceBundle.getText("Data"));
						// that._onRouteMatched();
						that.clearProduct();
					}).catch(function(oError) {
						MessageToast.show(that.resourceBundle.getText("Data1"));
					});

			} else {
				var oFilter = new sap.ui.model.Filter("ProductCode", "EQ", oProdcode);

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/Products", "GET", {
							filters: [oFilter]
						}, {}, this)
					.then(function(oData) {
						if (oData.results.length > 0) {
							MessageToast.show(that.resourceBundle.getText("Product11"));
						} else {

							that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
									"/Product", "POST", {}, productModel.getData(), that)
								.then(function(oData) {
									MessageToast.show(that.resourceBundle.getText("Data"));
									// that._onRouteMatched();
									that.clearProduct();
								}).catch(function(oError) {
									MessageToast.show(that.resourceBundle.getText("Data1"));
								});
						}
					}).catch(function(oError) {
						MessageToast.show(that.resourceBundle.getText("Data1"));
					});

			}
			// if(data.results.length === 0){
			// 	that.createNewProduct();
			// }
			// else{
			// 	that.updateProduct();
			// 		// }
			// 	}
			// } );

			// var productJson = this.getView().getModel("productModelInfo").getData().results;

			// if(productModel.getData().ProductCode === "" ){
			// function getProductCode(prodId) {
			// 		return productJson.filter(
			// 			function (data) {
			// 				return data.ProductCode === productCode;
			// 			}
			// 		);
			// 	}
			//
			// // 	// var found = productModel.id;
			// 	var found = getProductCode(prodId);
			// // var found = selectedMatData;

		},

		deleteProduct: async function() {
			var that = this;
			var productModel = this.getView().getModel("productModel");
			var productCode = productModel.getData().ProductCode;
			var productJson = this.getView().getModel("productModelInfo").getData().results;

			function getProductCode(productCode) {
				return productJson.filter(
					function(data) {
						return data.id === productCode;
					}
				);
			}


			var flg = true;
			var that = this;
			var tables = ["/Entrys", "/OrderItems", "/WSOrderItems", "/CustomerOrders"];
			var oFilter = new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.Contains, "'" + productCode + "'");

			for (var i = 0; i < tables.length; i++) {


				await this.ODataHelper.callOData(this.getOwnerComponent().getModel(), tables[i],
						"GET", {
							filters: [oFilter]
						}, {}, this)
					.then(function(oData) {

						if (oData.results.length > 0) {
							that.Errmsgprd();
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

			if (flg === false) {
				this.deleteCnfProduct(productCode, productModel);
				this.getView().setBusy(false);
			}

			// var found = getProductCode(productCode);
			// if(found.length > 0){
			// if(productCode.length > 0){
			//
			// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			// 		 "/Products('" + productCode + "')", "DELETE", {},{}, this)
			// 			.then(function(oData) {
			// 			MessageToast.show("Deleted successfully");
			// 			productModel.getData().Category = "";
			// 			productModel.getData().Type = "";
			// 			productModel.getData().Karat = "";
			// 			productModel.getData().CustomerTunch = 0;
			// 			productModel.getData().Making = 0;
			// 			productModel.getData().ProductCode = "";
			// 			productModel.getData().ProductName = "";
			// 			productModel.getData().PricePerUnit = 0;
			// 			productModel.getData().Wastage = 0;
			// 			productModel.getData().Tunch = 0;
			// 			productModel.getData().AlertQuantity = 0;
			// 			productModel.getData().HindiName = "";
			// 			productModel.refresh();
			// 			that.clearProduct();
			// 			// that._onRouteMatched();
			//
			// 			}).catch(function(oError) {
			// 					MessageToast.show("Could not delete the entry");
			// 			});
			//
			// 	}
			// 	else{
			// 		MessageToast.show("Data not available");
			// 	}

		},

		Errmsgprd: function() {
			MessageToast.show(that.resourceBundle.getText("Product12"));
			this.getView().setBusy(false);
		},
		deleteCnfProduct: function(productCode, productModel) {
			var that = this;

			sap.m.MessageBox.confirm(
				"Do you want to delete Customer", {
					title: "Confirm",
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: "",
					onClose: function(sAction) {

						if (sAction === "OK") {


							that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
									"/Products('" + productCode + "')", "DELETE", {}, {}, that)
								.then(function(oData) {
									MessageToast.show(that.resourceBundle.getText("Delete1"));
									productModel.getData().Category = "";
									productModel.getData().Type = "";
									productModel.getData().Karat = "";
									productModel.getData().CustomerTunch = 0;
									productModel.getData().Making = 0;
									productModel.getData().ProductCode = "";
									productModel.getData().ProductName = "";
									productModel.getData().PricePerUnit = 0;
									productModel.getData().Wastage = 0;
									productModel.getData().Tunch = 0;
									productModel.getData().AlertQuantity = 0;
									productModel.getData().HindiName = "";
									productModel.refresh();
									that.clearProduct();
								}).catch(function(oError) {
									MessageToast.show(that.resourceBundle.getText("Delete2"));
								});

							// sap.m.MessageToast.show("Selected records are deleted");
						}
					}
				}
			);

		},

		selectedProduct: function(oEvent) {
			var item = oEvent.getParameter("selectedItem");
			var key = item.getText();
			var keya = item.getKey();
			var that = this;
			console.log(key);
			console.log(keya);
			this.getModel().read("/Products(" + keya + ")", {
				urlParameters: {
					"$expand": "CategoryDetails"
				},
				success: function(data) {
					that.getModel("productModel").setData(data);
					that.getModel("productModel").setProperty("/Category", data.CategoryDetails.Category);
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
		createNewProduct: function() {
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
				"CategoryDetails": {
					"__metadata": {
						"uri": "http://localhost:8080/bhavysoft" +
							"/galaxyService.svc/Categorys(" + this.getView().byId("idCategory").getSelectedKey() + ")"
					}
				}
			};

			this.getModel().create("/Products", updatedData, {
				success: function() {
					MessageToast.show(that.resourceBundle.getText("create1"));
				}
			});
		},
		updateProduct: function() {
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
				"CategoryDetails": {
					"__metadata": {
						"uri": "http://localhost:8080/bhavysoft" +
							"/galaxyService.svc/Categorys(" + this.getView().byId("idCategory").getSelectedKey() + ")"
					}
				}
			};
			this.getModel().update("/Products(" + that.getModel("productModel").getProperty("/Id") + ")", updatedData, {
				success: function() {
					MessageToast.show(that.resourceBundle.getText("Update1"));
				}
			});
		},
		clearValues: function() {
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
		// deleteProduct: function(){
		// 	var that = this;
		// 	this.getModel().remove("/Products("+ that.getModel("productModel").getProperty("/Id")+ ")",{
		// 		success: function(){
		// 			MessageToast.show("Deleted successfully");
		// 			that.clearValues();
		// 		}
		// 	});
		// },
		Save: function() {
			var that = this;
			var aFilters = [];
			var oFilter = new Filter("ProductCode", "EQ", that.getModel("productModel").getProperty("/ProductCode"));
			aFilters.push(oFilter);
			this.getModel().read("/Products", {
				filters: aFilters,
				success: function(data) {

					if (data.results.length === 0) {
						that.createNewProduct();
					} else {
						that.updateProduct();
					}
				}
			});
		},
		Delete: function() {

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
