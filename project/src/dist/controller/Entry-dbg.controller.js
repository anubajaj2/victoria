sap.ui.define(["victoria/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"sap/ui/core/routing/History",
		"sap/m/MessageToast",
		"victoria/models/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
	],
	function(BaseController,
		JSONModel,
		MessageBox,
		History,
		MessageToast,
		formatter,
		Filter,
		FilterOperator
	) {
		"use strict";
		return BaseController.extend("victoria.controller.Entry", {
			formatter: formatter,
			clearOnSend: false,
			onInit: function() {
				debugger
				var that = this;
				this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				// that.getView().setBusy(true);
				var that = this;
				var currentUser = this.getModel("local").getProperty("/CurrentUser");
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
				loginUser = "Hey " + loginUser;
				this.getView().byId("idUser").setText(loginUser);
				// this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Entrys", "GET", null, null, this)
				// 	.then(function (oData) {
				// 		that.getView().setBusy(false);
				// 	}).catch(function (oError) {
				// 		var oPopover = that.getErrorMessage(oError);
				// 	});
				debugger;
				this.getOwnerComponent().getModel("local").setProperty("/materialEnable", false);

				// if (this.getView().byId("RB-1").getSelected()) {
				// 	this.getView().byId("idformMat").setVisible(false);
				// 	this.getView().byId("idMat").setVisible(false);
				// 	jQuery.sap.delayedCall(500, this, function () {
				// 		this.getView().byId("idweight").focus();
				// });
				// }
				// var oViewDetailModel = new JSONModel({
				// 	"buttonText": "Save",
				// 	"deleteEnabled": false,
				// 	"codeEnabled": true
				//
				// });
				// this.setModel(oViewDetailModel, "viewModel");
				BaseController.prototype.onInit.apply(this);
				// var oViewDetailModel = new JSONModel({
				// 	// "buttonText": "Save",
				// 	// "deleteEnabled": false,
				// 	// "codeEnabled": true
				//
				// });
				// this.setModel(oViewDetailModel, "viewModel");
				var oRouter = this.getRouter();
				oRouter.getRoute("Entry").attachMatched(this._onRouteMatched, this);
			},
			getRouter: function() {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},

			onAfterRendering: function() {
				var oInput = this.getView().byId("idCust");
				oInput.attachBrowserEvent("“focus",
					function(event) {
						var oModel = new sap.ui.model.Filter("Customer", "EQ", oInput);
						// this model is for your reference , use the model that you want to use
						oInput.setModel(oModel); // set the model that you want to use
					});


			},
			_onRouteMatched: function() {
				debugger;
				var that = this;
				that.getView().getModel("local").setProperty("/EntryData/Date", new Date());
				that.getView().getModel("local").setProperty("/materialEnable", true);
				this.getView().byId("DateId").setDateValue(new Date());
				var oJson = new JSONModel();
				oJson.setData({
					materialEnable: false
				});
				that.getView().setModel(oJson, "material");
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

			onValueHelpRequest: function(oEvent) {
				this.getCustomerPopup(oEvent);
			},

			onEnter: function(oEvent) {
				debugger;
				this.getCustomer(oEvent);
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
				// oEvent.getSource().getBinding("suggestionItems").refresh(true);
				this.getView().byId("idCash").focus();
				this.getView().byId("idCash").$().find("input").select();
			},

			onPayDateChange: function(oEvent) {
				debugger;

				var that = this;
				var myData = that.getView().getModel("local").getProperty("/EntryData");
				// var selCust = oEvent.getParameter("selectedItem").getLabel();
				// var selCustName = oEvent.getParameter("selectedItem").getValue();

				debugger;

				// myData.Customer=;
				// this.getView().getModel("local").getProperty("/EntryData", myData);
				var minDate = that.getView().byId("DateId").getDateValue();
				var minDate1 = minDate;
				// minDate = minDate.getFullYear() + "-" + (minDate.getMonth() + 1) + "-" + minDate.getDate();
				// var yyyy = parseInt(minDate.split("-")[0]);
				// var mm = parseInt(minDate.split("-")[1]);
				// var dd = parseInt(minDate.split("-")[2]);
				// if (dd < 10) {
				// 	dd = '0' + dd;
				// }
				// if (mm < 10) {
				// 	mm = '0' + mm;
				// }
				// minDate = yyyy + '-' + mm + '-' + dd;
				minDate1.setHours(0,0,0,0);
				if (minDate1.getTimezoneOffset() > 0) {
				minDate1.setMinutes(minDate1.getMinutes() + minDate1.getTimezoneOffset());
			} else {
				minDate1.setMinutes(minDate1.getMinutes() - minDate1.getTimezoneOffset());
			}
				var maxDate=new Date(minDate1);
				maxDate.setHours(23,59,59,59);
				if (maxDate.getTimezoneOffset() > 0) {
					maxDate.setMinutes(maxDate.getMinutes() + maxDate.getTimezoneOffset());
				} else {
					maxDate.setMinutes(maxDate.getMinutes() - maxDate.getTimezoneOffset());
				}
				// var date = '/Date(' + minDate1.getTime() + ')/';
				var oFilter1 = new Filter([
					new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.BT, minDate1, maxDate)
				], true);

				// var oFilter = new sap.ui.model.Filter("Date", "EQ", minDate);
				// var oFilter1 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.EQ, minDate1);
				that.getView().byId("idTable").getBinding("items").filter(oFilter1);

				// this.Date = oEvent.getParameter("selectedItem").getModel("undefined").getProperty(oEvent.getParameter("selectedItem").getBindingContextPath()).Date;
				that.getView().byId("idCash").focus();
				that.getView().byId("idCash").$().find("input").select();
					minDate1.setHours(0,0,0,0);
					maxDate=new Date(minDate1);
					maxDate.setHours(23,59,59,59);
				$.post("/getTotalEntryCustomerBetween", {
					Customer: "",
					max: maxDate.toISOString(),
					min: minDate1.toISOString()
				}).then(function(result) {
					console.log(result);
					debugger;
					that.byId("idTC").setText(parseFloat(result.CashTotal).toFixed(2));
					that.byId("idTC").getText();
					parseFloat(that.byId("idTC").getText());
					if (parseFloat(that.byId("idTC").getText()) > 0) {
						that.byId("idTC").setState('Success');
						debugger;
					} else {
						that.byId("idTC").setState('Warning');
					}
					that.getView().byId("idG").setText(parseFloat(result.GoldTotal.toFixed(3)));
					that.byId("idG").getText();
					parseFloat(that.byId("idG").getText());
					if (parseFloat(that.byId("idG").getText()) > 0) {
						that.byId("idG").setState('Success');
						debugger;
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
						debugger;
					} else {
						that.byId("idS").setState('Warning');
					}
				});

				// that.getView().byId("idTable").getBinding("items").filter(oFilter);
				// that.getView().byId("idTable").getBinding("items").filter(oFilter1s);
			},



			onSearch1: function(oEvent) {debugger;
				// var key = oEvent.which || oEvent.keyCode || oEvent.charCode;
			const key = oEvent.key
			var id1 = oEvent.getParameter("id").split("--")[2]
			// if() alert('backspace');
				var searchStr = oEvent.getParameter("suggestValue");
				if(searchStr === "" || key == 8 || key === "Backspace" || key === "Delete"){
						this.getView().byId("idCust").setValue("");
					return;
				}
				if(!searchStr) {
					searchStr = oEvent.getParameter("newValue");
				}
				if(searchStr){
					var oFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("CustomerCode", sap.ui.model.FilterOperator.Contains, searchStr.toUpperCase()),
							new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, searchStr.toUpperCase())
						],
						and: false
					});
				}

				oEvent.getSource().getBinding("suggestionItems").filter(oFilter);
				this.getView().byId("idCust").setValue(searchStr);

								// this.getView().byId("idCash").focus();
								// this.getView().byId("idCash").$().find("input").select();
			},


			onSuggest1: function(oEvent) {
				debugger;
				var oBPListBinding = this.byId("idCust").getBinding("suggestionItems");

				if (oBPListBinding.isSuspended()) {
					aFilters.push(new Filter("CustomerCode", FilterOperator.Contains, oBPListBinding));
					aFilters.push(new Filter("Name", FilterOperator.Contains, oBPListBinding));
					// aFilters.push(new Filter("Name", FilterOperator.Contains, sTerm.toUpperCase()));
					oEvent.getSource().getBinding("suggestionItems").filter(new Filter({
						filters: aFilters,
						and: false
					}));
					oBPListBinding.resume();
				}
			},



			handleSuggest: function(oEvent) {
				var oInput = oEvent.getSource();
				if (!oInput.getSuggestionItems().length) {
					oInput.bindAggregation("suggestionItems", {
						path: "/Customers",
						template: new sap.ui.core.ListItem({
							text: "{CustomerCode}",
							additionalText: "{Name}"
						})
					});
					oEvent.getSource().getBinding("suggestionItems").filter(oInput);
					oEvent.getSource().getBinding("suggestionItems").refresh(true);
				}

			},


			onCustomerSelect1: function(oEvent, custName, custId) {
				debugger;
				// this.getView().byId("idCash").focus();
				// this.getView().byId("idCash").$().find("input").select();
				// var that = this;
				if (oEvent.getParameter("selectedItem")) {
					var selectedData = oEvent.getParameter("selectedItem").getBindingContext().getObject();
					this.setCustomerIdAndCustomerName(selectedData);
					// that.getView().byId("idCash").focus();
					// that.getView().byId("idCash").$().find("input").select();
					jQuery.sap.delayedCall(100, this, function() {
						this.getView().byId("idCash").focus();
						this.getView().byId("idCash").$().find("input").select();
					});

				}
			},
			valuesChangeMaterial: function(oEvent) {
				this.getView().byId("idweight").focus();
				this.getView().byId("idweight").$().find("input").select();
				const value = oEvent.getSource().mProperties.value;
				const data = this.allMasterData.materialsId[value];
				if (data == undefined) {
					this.getView().byId("idMatText").setText();
				} else {
					this.getView().byId("idMat").setValue(data.ProductCode);
					this.getView().byId("idMatText").setText(data.ProductName + " - " + data.Type);
				}
			},
			onCalculate: function(evt) {
				debugger;
				var wtValue = this.byId("idweight").getValue();
				var thValue = this.byId("idtunch").getValue();
				var X = wtValue * thValue / 100;
				if (X === 0 || X === "") {
					MessageToast.show("enter the correct Weight value");
				}
				var CR = "Silver Received @" + wtValue + 'x' + thValue;
				var SR = "Gold Received @" + wtValue + 'x' + thValue;
				var KR = "Kacchi Received @" + wtValue + 'x' + thValue;
				var CT = "Silver Given @" + wtValue + 'x' + thValue;
				var ST = "Gold Given @" + wtValue + 'x' + thValue;
				var KT = "Kacchi Given @" + wtValue + 'x' + thValue;
				var splitText = this.getView().byId("idMatText").getText().split("-")[1]
				var rem = this.getView().byId("idMatText").getText();
				var posMat = rem + " " + "ke jama " + wtValue + 'x' + thValue;
				var negMat = rem + " " + "ke naam " + wtValue + 'x' + thValue;
				if (X > 0 && this.getView().byId("RB-1").getSelected()) {
					this.getView().byId("idSilver").setValue(parseFloat(X.toFixed(2)));
					this.getView().byId("idRemarks").setValue(CR);
				} else if (X > 0 && this.getView().byId("RB-2").getSelected()) {
					this.getView().byId("idGold").setValue(parseFloat(X.toFixed(3)));
					this.getView().byId("idRemarks").setValue(SR);
				} else if (X > 0 && this.getView().byId("RB-3").getSelected()) {
					this.getView().byId("idSilver").setValue(parseFloat(X.toFixed(2)));
					this.getView().byId("idRemarks").setValue(KR);
				} else if (X > 0 && this.getView().byId("RB-4").getSelected() || splitText.split(" ")[1] === "Gold") {
					debugger;
					this.getView().byId("idGold").setValue(parseFloat(X.toFixed(3)));
					this.getView().byId("idRemarks").setValue(posMat);
				} else if (X > 0 && this.getView().byId("RB-4").getSelected() || splitText.split(" ")[1] === "Silver") {
					debugger;
					this.getView().byId("idSilver").setValue(parseFloat(X.toFixed(2)));
					this.getView().byId("idRemarks").setValue(posMat);
				} else if (X > 0 && this.getView().byId("RB-4").getSelected() || splitText.split(" ")[1] === "GS") {
					debugger;
					this.getView().byId("idSilver").setValue(parseFloat(X.toFixed(2)));
					this.getView().byId("idRemarks").setValue(posMat);
				} else if (X < 0 && this.getView().byId("RB-4").getSelected() || splitText.split(" ")[1] === "Gold") {
					debugger;
					this.getView().byId("idGold").setValue(parseFloat(X.toFixed(3)));
					this.getView().byId("idRemarks").setValue(negMat);
				} else if (X < 0 && this.getView().byId("RB-4").getSelected() || splitText.split(" ")[1] === "Silver") {
					debugger;
					this.getView().byId("idSilver").setValue(parseFloat(X.toFixed(2)));
					this.getView().byId("idRemarks").setValue(negMat);
				} else if (X < 0 && this.getView().byId("RB-4").getSelected() || splitText.split(" ")[1] === "GS") {
					debugger;
					this.getView().byId("idSilver").setValue(parseFloat(X.toFixed(2)));
					this.getView().byId("idRemarks").setValue(negMat);
				} else if (X < 0 && this.getView().byId("RB-1").getSelected()) {
					this.getView().byId("idSilver").setValue(parseFloat(X.toFixed(2)));
					this.getView().byId("idRemarks").setValue(CT);
				} else if (X < 0 && this.getView().byId("RB-2").getSelected()) {
					this.getView().byId("idGold").setValue(parseFloat(X.toFixed(3)));
					this.getView().byId("idRemarks").setValue(ST);
				} else if (X < 0 && this.getView().byId("RB-3").getSelected()) {
					this.getView().byId("idSilver").setValue(parseFloat(X.toFixed(2)));
					this.getView().byId("idRemarks").setValue(KT);
				}
			},
			onPressGWiseDownload: function() {
				debugger;
				var reportType = "Group_Wise_Report";
				// 	var oViewDetailModel = new JSONModel({
				// 		"buttonText": "Save",
				// 		"deleteEnabled": false,
				// 		"codeEnabled": true
				//
				// 	});
				// 	this.setModel(oViewDetailModel, "viewModel");
				// 	var that = this;
				// 	var viewModel = this.getView().getModel("viewModel");
				// 	// viewModel.setProperty("/codeEnabled", true);
				// 	// viewModel.setProperty("/buttonText", "Save");
				// 	// viewModel.setProperty("/deleteEnabled", false);
				// 	var odataModel = new JSONModel({
				// 		"CustomerCodeState": "None",
				// 		"CityState": "None",
				// 		"GroupState": "None",
				// 		"NameState": "None",
				// 		"TypeState": "None"
				//
				// 	});
				// 	this.setModel(odataModel, "dataModel");
				//
				// 	// this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				// 	// 		"/Customers", "GET", {}, {}, this)
				// 	// 	.then(function(oData) {
				// 	// 		var oModelCustomer = new JSONModel();
				// 	// 		oModelCustomer.setData(oData);
				// 	// 		that.getView().setModel(oModelCustomer, "customerModelInfo");
				// 	//
				// 	// 	}).catch(function(oError) {
				// 	// 		MessageToast.show(that.resourceBundle.getText("ReqField"));
				// 	// 	});
				//
				//
				// 	this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				// 			"/Groups", "GET", {}, {}, this)
				// 		.then(function(oData) {
				// 			debugger;
				// 			var oModelGroup = new JSONModel();
				// 			oModelGroup.setData(oData);
				// 			that.getView().setModel(oModelGroup, "groupModelInfo");
				//
				// 		}).catch(function(oError) {
				// 			MessageToast.show(that.resourceBundle.getText("ReqField"));
				// 		});
				// 	this.clearCustomer();
				//
				// 	$(document).keydown(function(evt) {
				//
				// 		var elm = document.URL.split('/');
				//
				// 		if (elm[elm.length - 1] === 'Customers') {
				// 			if (evt.keyCode == 68 && (evt.ctrlKey) && (evt.altKey)) {
				// 				evt.preventDefault();
				// 				// alert('Ctr + Alt + D Pressed');
				// 				that.deleteAllCustomers();
				// 			} else if (evt.keyCode == 69 && (evt.ctrlKey) && (evt.altKey)) {
				// 				evt.preventDefault();
				// 				// alert('Ctr + Alt + E Pressed');
				// 				that.deleteAllEntrys();
				// 			} else if (evt.keyCode == 65 && (evt.ctrlKey) && (evt.altKey)) {
				// 				evt.preventDefault();
				// 				// alert('Ctr + Alt + A Pressed');
				// 				that.deleteAllTables();
				// 			}
				// 		}
				// 	});
				// //   $.post("/groupWiseEntryDownload",{type: reportType}).then(function(oData)
				// // {
				// //   debugger;
				// //   MessageToast.show("Data downloaded successfully");
				// // },function(oError){debugger;
				// //   MessageToast.show("Data could not be downloaded");
				// // });
				if (!this.oDialog1) {
					this.oDialog1 = new sap.ui.xmlfragment(this.getView().getId(), "victoria.fragments.entryGroup", this);
					this.getView().addDependent(this.oDialog1);
				}
				this.oDialog1.open();
				// window.open("/groupWiseEntryDownload?type=Group_Wise_Report");
			},

			onGroupWiseRadioSelect: function(oEvent) {
				debugger;
				var select = this.getView().byId("id1").getSelected();
				if (select) {
					this.getView().byId("idGroup1").setEditable(true);
				} else {
					this.getView().byId("idGroup1").setEditable(false);
				}
			},

			onPressHandleEntrySavePopup1: function() {
				debugger;
				// var id11= this.getView().byId("idAll").getSelected();
				if (this.getView().byId("idAll").getSelected()) {
					// var id=this.getView().byId("idGroup1").getSelectedKey();
					debugger;
					window.open("/groupWiseEntryDownload?type=Group_Wise_Report&group=00");
				} else if (this.getView().byId("id1").getSelected()) {
					var id = this.getView().byId("idGroup1").getSelectedKey();
					var name = this.getView().byId("idGroup1").getSelectedItem().getText();
					window.open("/groupWiseEntryDownload?type=Group_Wise_Report&group=" + id + "&name=" + name);
				} else if (this.getView().byId("idNo").getSelected()) {
					window.open("/groupWiseEntryDownload?type=Group_Wise_Report&group=01");
				} else {
					MessageToast.show("Please Select A Option");
					return;
				}
				this.oDialog1.close();
			},

			onPressHandleEntrySavePopup11: function() {
				debugger;
				var password1 = this.getView().byId("pwd1").getValue();
				this.getView().byId("pwd1").setValue("");
				if (password1 === "Sarita@123") {
					this.oDialog2.close();
debugger;
					var x = this.getView().byId("idCust").getValue();
					if (!x) {
						// this.getView().byId("idCust").setValueState(sap.ui.core.ValueState.Error);
					}
					var count = this.getView().byId("idTable").getItems().length;
					var that = this;
					var that1 = this.getView();


					sap.m.MessageBox.confirm(that.resourceBundle.getText("Do11") + "(" + count + ")" + that.resourceBundle.getText("entries"), {
						title: "Confirm",
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						styleClass: "",
						onClose: function(sAction) {
							var that2 = that;
							if (sAction === "OK") {
								debugger;

								$.post("/deleteRecords", {
									customerId: that2.customerId,
									entityName: "Entry"
								}).done(function(response) {
									sap.m.MessageToast.show(response.msg);
									sap.ui.getCore().byId("__component0---idEntry--idTable").getModel().refresh(true);
									sap.ui.getCore().byId("__component0---idEntry--idTC").setText("0");
									var z1 = sap.ui.getCore().byId("__component0---idEntry--idTC").getText();
									if (parseFloat(z1) > 0) {
										sap.ui.getCore().byId("__component0---idEntry--idTC").setState('Success');
										debugger;
									} else {
										sap.ui.getCore().byId("__component0---idEntry--idTC").setState('Warning');
									}

									sap.ui.getCore().byId("__component0---idEntry--idG").setText("0");
									var z1 = sap.ui.getCore().byId("__component0---idEntry--idG").getText();
									if (parseFloat(z1) > 0) {
										sap.ui.getCore().byId("__component0---idEntry--idG").setState('Success');
										debugger;
									} else {
										sap.ui.getCore().byId("__component0---idEntry--idG").setState('Warning');
									}
									sap.ui.getCore().byId("__component0---idEntry--idS").setText("0");
									var z1 = sap.ui.getCore().byId("__component0---idEntry--idS").getText();
									if (parseFloat(z1) > 0) {
										sap.ui.getCore().byId("__component0---idEntry--idS").setState('Success');
										debugger;
									} else {
										sap.ui.getCore().byId("__component0---idEntry--idS").setState('Warning');
									}
									sap.ui.getCore().byId("__component0---idEntry--idTC").setState("Warning");
									sap.ui.getCore().byId("__component0---idEntry--idG").setText("Warning");
									sap.ui.getCore().byId("__component0---idEntry--idS").setText("Warning");
									// that.getView().byId("idTable").refresh(true);
								});
								// this.getView().byId("idTable").refresh(true);
								// Entrys.refresh(true);
							} else if (sAction === "CANCEL") {
								this.getView().setBusy(false);
							}
						}
					});
				} else {
					this.getView().byId("pwd1").setValueState("Error");
					this.getView().byId("pwd1").setValueStateText("Enter Correct Password");
					sap.m.MessageToast.show("Enter Correct Password");
				}

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

			toggleFullScreen: function() {
				debugger;
				var btnId = "idFullScreenBtn";
				var headerId = "__component0---idEntry--idcust1";
				this.toggleUiTable(btnId, headerId)
			},

			decimalvalidator1: function(oEvent) {
				debugger;
				if (oEvent.mParameters.id === "__component0---idEntry--idCash") {
					$(function() {
						$('input').on('input.idCash', function(event) {
							if (event.currentTarget.id == "__component0---idEntry--idCash-inner") {
								debugger;
								this.value = this.value.match(/^[+-]?\d{0,8}(\.\d{0,2})?/)[0];
							}
						});
					});
				}
			},
			decimalvalidator2: function(oEvent) {
				debugger;
				if (oEvent.mParameters.id === "__component0---idEntry--idGold") {

					$(function() {
						$('input').on('input.idGold', function(event) {
							if (event.currentTarget.id == "__component0---idEntry--idGold-inner") {
								debugger;
								this.value = this.value.match(/^[+-]?\d{0,6}(\.\d{0,3})?/)[0];
							}
						});
					});
				}
			},
			decimalvalidator3: function(oEvent) {
				debugger;
				if (oEvent.mParameters.id === "__component0---idEntry--idSilver") {
					$(function() {
						$('input').on('input.idSilver', function(event) {
							if (event.currentTarget.id == "__component0---idEntry--idSilver-inner") {
								debugger;
								this.value = this.value.match(/^[+-]?\d{0,5}(\.\d{0,2})?/)[0];
							}
						});
					});
				}
			},
			decimalvalidator4: function(oEvent) {
				debugger;
				if (oEvent.mParameters.id === "__component0---idEntry--idweight") {
					$(function() {
						$('input').on('input.idweight', function(event) {
							if (event.currentTarget.id == "__component0---idEntry--idweight-inner") {
								debugger;
								this.value = this.value.match(/^[+-]?\d{0,5}(\.\d{0,3})?/)[0];
							}
						});
					});
				}
			},
			decimalvalidator5: function(oEvent) {
				debugger;
				if (oEvent.mParameters.id === "__component0---idEntry--idtunch") {
					$(function() {
						$('input').on('input.idtunch', function(event) {
							if (event.currentTarget.id == "__component0---idEntry--idtunch-inner") {
								debugger;
								this.value = this.value.match(/^[+-]?\d{0,5}(\.\d{0,3})?/)[0];
							}
						});
					});
				}
			},
			onMaterialSelect: function(oEvent) {
				debugger;
				if (oEvent.getParameter("selectedItem")) {
					var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext()
						.getPath());
					var selMat = oEvent.getParameter("selectedItem").getText();
					var selMatName = oEvent.getParameter("selectedItem").getAdditionalText();
					var selType = oEvent.getParameter("selectedItem").getKey();
					// this.getView().byId("idMatType").setText(selType);
					this.getView().byId("idMat").setValue(selMat);
					this.getView().byId("idMatText").setText(selMatName + " - " + selMat);
					jQuery.sap.delayedCall(100, this, function() {
						this.getView().byId("idweight").focus();
						this.getView().byId("idweight").$().find("input").select();
					});
				}
			},
			onRemarksSubmit: function(oEvent) {
				this.getView().byId("sendButton").focus();
			},

			onSubmit: function(evt) {
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
			},
			onCashSubmit: function(evt) {
				this.getView().byId("idGold").focus();
				this.getView().byId("idGold").$().find("input").select();
			},
			onGoldSubmit: function(evt) {
				this.getView().byId("idSilver").focus();
				this.getView().byId("idSilver").$().find("input").select();
			},
			onSilverSubmit: function(evt) {
				this.getView().byId("idRemarks").focus();
			},
			onRemarksSubmit: function(evt) {
				this.getView().byId("sendButton").focus();
			},
			onSubmitSideWeight: function(evt) {
				this.getView().byId("idtunch").focus();
				this.getView().byId("idtunch").$().find("input").select();
			},
			onSubmitSideTunch: function(evt) {
				this.getView().byId("calculateButton").focus();
			},
			onKeyPress: function(oEvent) {
				var input = oEvent.getSource();
				input.setValue(input.getValue().toUpperCase());
			},
			onSelect: function(oEvent) {
				jQuery.sap.delayedCall(500, this, function() {
					this.getView().byId("idCust").focus();
				});

			},
			onPressEntryDownload: function() {
				debugger;
				// var test = this.getView().getModel("customerModel");
				var that = this;
				var reportType = "Entry";
				var custId = this.getView().getModel("local").getProperty("/EntryData/Customer");
				// var name = this.getView().getModel("local").getProperty("/EntryData/CustomerName");
				// var name=this.getView().getModel("local").getProperty("/entryHeaderTemp/CustomerName")
				var name = this.getView().byId("idCustText").getProperty("text").split("-")[0]
				// var city = this.getView().getModel("local").getProperty("/EntryData/CustomerCity");
				var city = this.getView().byId("idCustText").getProperty("text").split("-")[1]
				var custId1 = this.getView().byId("idCust").getValue();
				var custId2 = this.getView().byId("idCustText").getText();
				if (custId === "" || custId === undefined || custId1 === "" || custId1 === undefined || custId2 === ""  || custId2 === undefined) {
					sap.m.MessageBox.error(" Please Select a Customer ", {
						title: "Error"
					});
					return;
				}
				// $.get("/entryDownload", {
				// 	id: custId,
				// 	name: name,
				// 	city: city,
				// 	type: reportType
				// }).then(function (oData) {
				// 	debugger;
				// 	MessageToast.show("Data downloaded successfully");
				// 	console.log(that.getImageUrlFromContent(oData));
				// }, function (oError) {
				// 	debugger;
				// 	MessageToast.show("Data could not be downloaded");
				// });


				// if(name === "" || name=== undefined ){
				// 	sap.m.MessageBox.error(" Please Select a Customer Name", {
				// 		title: "Error"});
				// 	return;
				// }
				// if(city === "" || city=== undefined ){
				// 	sap.m.MessageBox.error(" Please Select a Customer City", {
				// 		title: "Error"});
				// 	return;
				// }
				window.open("/entryDownload?id=" + custId + "&type=Entry&name=" + name + "&city=" + city);
			},
			getImageUrlFromContent: function(base64Stream) {
				if (base64Stream) {
					var b64toBlob = function(dataURI) {
						var byteString = atob(dataURI.split(',')[1]);
						var ab = new ArrayBuffer(byteString.length);
						var ia = new Uint8Array(ab);
						for (var i = 0; i < byteString.length; i++) {
							ia[i] = byteString.charCodeAt(i);
						}
						return new Blob([ab], {
							type: 'image/jpeg'
						});
					};
					var x = b64toBlob(base64Stream);
					return URL.createObjectURL(x);
				}

			},
			// onSort : function(oEvent){
			// 	var aSorter = [];
			// 	aSorter.push(new sap.ui.model.Sorter("Date", true, false, function(value1, value2) {
			//   if (new Date(value1) < new Date(value2)) return -1;
			//   if (new Date(value1) == new Date(value2)) return 0;
			//   if (new Date(value1) > new Date(value2)) return 1;
			// }));
			// 	var oBinding = this.getView().byId("idTable").getBinding("items");
			// 	oBinding.sort(aSorter);
			// },
			onRadioButtonSelect: function(oEvent) {
				debugger;

				if (this.getView().byId("RB-1").getSelected() ||
					this.getView().byId("RB-2").getSelected() ||
					this.getView().byId("RB-3").getSelected()) {
					// this.getView().byId("idformMat").setVisible(false);
					// this.getView().byId("idMat").setVisible(false);
					this.getView().getModel("local").setProperty("/materialEnable", false);
					this.getView().byId("idMat").setValue("");
					jQuery.sap.delayedCall(500, this, function() {
						this.getView().byId("idweight").focus();
					});
				} else if (this.getView().byId("RB-4").getSelected()) {
					// this.getView().byId("idformMat").setVisible(true);
					// this.getView().byId("idMat").setVisible(true);
					this.getView().getModel("local").setProperty("/materialEnable", true);
					jQuery.sap.delayedCall(500, this, function() {
						this.getView().byId("idMat").focus();
					});
				}
			},

			onConfirm: function(oEvent) {
				debugger;
				var selectedCust = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext()
					.getPath());
				var that = this;
				var myData = this.getView().getModel("local").getProperty("/EntryData");
				// var selCust = oEvent.getParameter("selectedItem").getLabel();
				// var selCustName = oEvent.getParameter("selectedItem").getValue();
				var selCust = selectedCust.CustomerCode;
				var selCustName = selectedCust.Name;
				this.getView().byId("idCust").setValue(selCust);
				this.getView().byId("idCustText").setText(selCustName);
				this.getView().getModel("local").setProperty("/EntryData/Customer", selectedCust.id);
				debugger;
				this.getView().getModel("local").setProperty("/entryHeaderTemp/customerId",
					selCust);
				// myData.Customer=;
				this.getView().getModel("local").getProperty("/EntryData", myData);
				var oFilter = new sap.ui.model.Filter("Customer", "EQ", "'" + myData.Customer + "'");
				this.getView().byId("idTable").getBinding("items").filter(oFilter);
				this.customerId = selectedCust.id
				// this.customerId = oEvent.getParameter("selectedItem").getModel("undefined").getProperty(oEvent.getParameter("selectedItem").getBindingContextPath()).id;
				this.getView().byId("idCash").focus();
				this.getView().byId("idCash").$().find("input").select();
				$.post("/getTotalEntryCustomer", {
					Customer: myData.Customer
				}).then(function(result) {
					console.log(result);
					debugger;
					that.byId("idTC").setText(parseFloat(result.CashTotal).toFixed(2));
					that.byId("idTC").getText();
					parseFloat(that.byId("idTC").getText());
					if (parseFloat(that.byId("idTC").getText()) > 0) {
						that.byId("idTC").setState('Success');
						debugger;
					} else {
						that.byId("idTC").setState('Warning');
					}
					that.getView().byId("idG").setText(parseFloat(result.GoldTotal.toFixed(3)));
					that.byId("idG").getText();
					parseFloat(that.byId("idG").getText());
					if (parseFloat(that.byId("idG").getText()) > 0) {
						that.byId("idG").setState('Success');
						debugger;
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
						debugger;
					} else {
						that.byId("idS").setState('Warning');
					}
				});

			},

			onSend: function(oEvent) {
				debugger;
				var that = this;
				// if (this.getView().byId("idMat").getValue() === "" && this.getView().byId("RB-4").getSelected()) {
				// 	sap.m.MessageBox.show(that.resourceBundle.getText("MaterialEnter"));
				// }
				if (this.getView().byId("idCust").getValue() === "") {
					sap.m.MessageBox.show(that.resourceBundle.getText("Customer11"));
				} else {
					debugger;

					that.getView().setBusy(true);
					var myData = this.getView().getModel("local").getProperty("/EntryData");
					myData.Date = this.getView().byId("DateId").getDateValue();
					myData.Product = this.getView().byId("idMat").getSelectedKey();
					myData.Gold = this.getView().byId("idGold").getValue();
					myData.Cash = this.getView().byId("idCash").getValue();
					myData.Silver = this.getView().byId("idSilver").getValue();
					myData.Remarks = this.getView().byId("idRemarks").getValue();
					myData.Weight = this.getView().byId("idweight").getValue();
					myData.Tunch = this.getView().byId("idtunch").getValue();
					myData.DueDate = this.getView().byId("DueDateId").getDateValue();
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Entrys",
							"POST", {}, myData, this)
						.then(function(oData) {
							that.getView().setBusy(false);
							sap.m.MessageToast.show(that.resourceBundle.getText("Data"));
							that.clearOnSend = true;
							that.onClear();

						}).catch(function(oError) {
							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);
						});
					// this.getView().byId("DateId").setDateValue( new Date());
					// this.byId("DueDateId").setDateValue( new Date());
					var x = this.getView().byId("idTC").getText();
					var x1 = parseFloat(this.byId("idTC").getText());
					var y = this.getView().byId("idCash").getValue();
					var y1 = parseFloat(this.byId("idCash").getValue());
					var z = x1 + y1;
					z.toFixed(2);
					parseFloat(z.toFixed(2));
					this.byId("idTC").setText(parseFloat(z.toFixed(2)));
					var z1 = this.byId("idTC").getText();
					parseFloat(this.byId("idTC").getText()).toFixed(2);
					debugger;
					if (parseFloat(parseFloat(this.byId("idTC").getText()).toFixed(2)) > 0) {
						that.byId("idTC").setState('Success');
						debugger;
					} else {
						that.byId("idTC").setState('Warning');
					}
					var x = this.getView().byId("idG").getText();
					var x1 = parseFloat(this.byId("idG").getText());
					var y = this.getView().byId("idGold").getValue();
					var y1 = parseFloat(this.byId("idGold").getValue());
					var z = x1 + y1;
					z.toFixed(3);
					parseFloat(z.toFixed(3));
					this.byId("idG").setText(parseFloat(z.toFixed(3)));
					var z1 = this.byId("idG").getText();
					parseFloat(this.byId("idG").getText()).toFixed(3);
					if (parseFloat(parseFloat(this.byId("idG").getText()).toFixed(3)) > 0) {
						that.byId("idG").setState('Success');
						debugger;
					} else {
						that.byId("idG").setState('Warning');
					}
					var x = this.getView().byId("idS").getText();
					var x1 = parseFloat(this.byId("idS").getText());
					var y = this.getView().byId("idSilver").getValue();
					var y1 = parseFloat(this.byId("idSilver").getValue());
					var z = x1 + y1;
					z.toFixed(2);
					parseFloat(z.toFixed(2));
					this.byId("idS").setText(parseFloat(z.toFixed(2)));
					var z1 = this.byId("idS").getText();
					parseFloat(this.byId("idS").getText()).toFixed(2);
					if (parseFloat(parseFloat(this.byId("idS").getText()).toFixed(2)) > 0) {
						that.byId("idS").setState('Success');
					} else {
						that.byId("idS").setState('Warning');
					}
					this.getView().byId("idMat").setValue("");
				}

			},

			onDelete: function() {
				var that = this;
				sap.m.MessageBox.confirm(
					"Deleting Selected Records", {
						title: "Confirm",
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						styleClass: "",
						onClose: function(sAction) {
							debugger;
							if (sAction === "OK") {
								debugger;
								var x = that.getView().byId("idTable").getSelectedItems();
								var nCash = 0;
								var nGold = 0;
								var nSilver = 0;
								if (x.length) {
									for (var i = 0; i < x.length; i++) {
										debugger;
										var myUrl = x[i].getBindingContext().sPath;
										that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl, "DELETE", {}, {}, that);
										sap.ui.getCore().byId("__component0---idEntry--idTable").getModel().refresh(true);
										var p = x[i].getBindingContext().getObject().Cash;
										var q = x[i].getBindingContext().getObject().Gold;
										var r = x[i].getBindingContext().getObject().Silver;
										if (p) {
											nCash += nCash + p - nCash;
										}
										if (q) {
											nGold += nGold + q - nGold;
										}
										if (r) {
											nSilver += nSilver + r - nSilver;
										}
									}
									var CA = that.byId("idTC").getText();
									var CA1 = parseFloat(CA);
									var TCA = CA1 - nCash;
									TCA.toFixed(2);
									parseFloat(TCA.toFixed(2));
									that.byId("idTC").setText(parseFloat(TCA.toFixed(2)));
									// that.byId("idTC").setText(TCA);
									that.byId("idTC").getText();
									parseFloat(that.byId("idTC").getText());
									if (parseFloat(that.byId("idTC").getText()) > 0) {
										that.byId("idTC").setState('Success');
										debugger;
									} else {
										that.byId("idTC").setState('Warning');
									}

									var GA = that.byId("idG").getText();
									var GA1 = parseFloat(GA);
									var TGA = GA1 - nGold;
									TGA.toFixed(3);
									parseFloat(TGA.toFixed(3));
									that.byId("idG").setText(parseFloat(TGA.toFixed(3)));
									// that.byId("idG").setText(TGA);
									that.byId("idG").getText();
									parseFloat(that.byId("idG").getText());
									if (parseFloat(that.byId("idG").getText()) > 0) {
										that.byId("idG").setState('Success');
										debugger;
									} else {
										that.byId("idG").setState('Warning');
									}

									var SA = that.byId("idS").getText();
									var SA1 = parseFloat(SA);
									var TSA = SA1 - nSilver;
									TSA.toFixed(2);
									parseFloat(TSA.toFixed(2));
									that.byId("idS").setText(parseFloat(TSA.toFixed(2)));
									// that.byId("idS").setText(TSA);
									that.byId("idS").getText();
									parseFloat(that.byId("idS").getText());
									if (parseFloat(that.byId("idS").getText()) > 0) {
										that.byId("idS").setState('Success');
										debugger;
									} else {
										that.byId("idS").setState('Warning');
									}
								}

								sap.m.MessageToast.show(that.resourceBundle.getText("SelectedData1"));
							}
						}
					}
				);
			},
			_getEditClear: function() {
				debugger;
				var check = this.getView().byId("CBID").getSelected();
				if (check === true) {
					this.getView().byId("DateId").setDateValue(new Date());
					jQuery.sap.delayedCall(500, this, function() {
						this.getView().byId("idCust").focus();
					});
					this.byId("idCust").getValue();
					this.byId("idCustText").getText();

					this.byId("idweight").setValue("0");
					this.byId("idRemarks").setValue("");
					this.byId("idCash").setValue("0");
					this.byId("idGold").setValue("0");
					this.byId("idSilver").setValue("0");
					this.byId("idtunch").setValue("0");
					this.byId("DueDateId").setDateValue(new Date());
				} else if (check === false) {
					this.getView().byId("DateId").setDateValue(new Date());
					jQuery.sap.delayedCall(500, this, function() {
						this.getView().byId("idCust").focus();
					});

					this.byId("idCust").setValue("");
					this.byId("idCustText").setText("");
					// this.byId("idMat").setValue("");
					// this.byId("idMatText").setText("");
					// this.byId("idMatType").setText("");
					this.byId("idweight").setValue("0");
					this.byId("idRemarks").setValue("");
					this.byId("idCash").setValue("0");
					this.byId("idGold").setValue("0");
					this.byId("idSilver").setValue("0");
					this.byId("idtunch").setValue("0");
					this.byId("idTC").setText("");
					this.byId("idG").setText("");
					this.byId("idS").setText("");
					// this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Entrys",
					// 												 "GET", {}, myData, this)
					this.byId("DueDateId").setDateValue(new Date());
				}

			},

			onClear: function() {
				debugger;
				var oFilter = [];
				var check = this.getView().byId("CBID").getSelected();
				if (check === true) {
					if (this.clearOnSend) {
						this.clearOnSend = false;
						var myData = this.getView().getModel("local").getProperty("/EntryData");
						this.getView().byId("DateId").setDateValue(myData.Date);
						this.byId("idCust").getValue();
						this.byId("idCustText").getText();
					} else {
						this.getView().byId("DateId").setDateValue(new Date());
						this.byId("idCust").setValue("");
						this.byId("idCustText").setText("");
						this.getView().byId("idTable").getBinding("items").filter(oFilter);
					}
					jQuery.sap.delayedCall(100, this, function() {
						this.getView().byId("idCust").focus();
					});

					this.byId("idMat").setValue("");
					this.byId("idMatText").setText("");
					this.byId("idMatType").setText("");
					this.byId("idweight").setValue("0");
					this.byId("idRemarks").setValue("");
					this.byId("idCash").setValue("0");
					this.byId("idGold").setValue("0");
					this.byId("idSilver").setValue("0");
					this.byId("idtunch").setValue("0");
					this.byId("DueDateId").setDateValue(new Date());
				} else if (check === false) {
					if (this.clearOnSend) {
						this.clearOnSend = false;
						var myData = this.getView().getModel("local").getProperty("/EntryData");
						this.getView().byId("DateId").setDateValue(new Date());
					} else {
						this.getView().byId("DateId").setDateValue(new Date());
						this.getView().byId("idTable").getBinding("items").filter(oFilter);
					}
					jQuery.sap.delayedCall(100, this, function() {
						this.getView().byId("idCust").focus();
					});

					this.byId("idCust").setValue("");
					this.byId("idCustText").setText("");
					this.byId("idMat").setValue("");
					this.byId("idMatText").setText("");
					this.byId("idMatType").setText("");
					this.byId("idweight").setValue("0");
					this.byId("idRemarks").setValue("");
					this.byId("idCash").setValue("0");
					this.byId("idGold").setValue("0");
					this.byId("idSilver").setValue("0");
					this.byId("idtunch").setValue("0");
					this.byId("idTC").setText("");
					this.byId("idG").setText("");
					this.byId("idS").setText("");
					// this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Entrys",
					// 												 "GET", {}, myData, this)
					this.byId("DueDateId").setDateValue(new Date());
					this.getView().byId("idTable").getBinding("items").filter([]);
				}

			},
			_getDialog: function(oEvent) {
				if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment("entryDialog", "victoria.fragments.entryDialog", this);
					this.getView().addDependent(this.oDialog);
				}
				this.oDialog.open();
				var title = this.getView().byId("idTable").getSelectedItem().getCells()[1].getText();
				sap.ui.getCore().byId("entryDialog--idDialog-title").setText(title);
				var cell0 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[0].mProperties.text;
				sap.ui.getCore().byId("entryDialog--idDialogDate").setValue(cell0);
				var cell2 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[2].mProperties.text;
				sap.ui.getCore().byId("entryDialog--idDialogCust").setValue(cell2);
				var cell3 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[4].mProperties.text;
				var amt1 = parseFloat(cell3);
				sap.ui.getCore().byId("entryDialog--idDialogAmt").setValue(cell3);
				var cell4 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[5].mProperties.text;
				var gold = parseFloat(cell4);
				sap.ui.getCore().byId("entryDialog--idDialogGold").setValue(cell4);
				var cell5 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[6].mProperties.text;
				var silver = parseFloat(cell5);
				sap.ui.getCore().byId("entryDialog--idDialogSil").setValue(cell5);
				var cell6 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[7].mProperties.text;
				sap.ui.getCore().byId("entryDialog--idDialogRem").setValue(cell6);
			},
			onPressHandleEntrySavePopup: function(oEvent) {
				var that = this;
				that.getView().setBusy(true);
				var myData = this.getView().getModel("local").getProperty("/EntryData");
				myData.Date = sap.ui.getCore().byId("entryDialog--idDialogDate").getValue();
				myData.Gold = sap.ui.getCore().byId("entryDialog--idDialogGold").getValue();
				myData.Cash = sap.ui.getCore().byId("entryDialog--idDialogAmt").getValue();
				myData.Silver = sap.ui.getCore().byId("entryDialog--idDialogSil").getValue();
				myData.Remarks = sap.ui.getCore().byId("entryDialog--idDialogRem").getValue();

				var id = this.getView().byId("idTable").getSelectedContextPaths()[0].split("'")[1];

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Entrys('" + id + "')",
						"PUT", {}, myData, this)
					.then(function(oData) {
						that.getView().setBusy(false);
						sap.m.MessageToast.show(that.resourceBundle.getText("Update111"));
						that.oDialog.close();
						that._getEditClear();
					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
					});
				this.byId("idMat").setValue("");
				this.byId("idMatText").setText("");
				this.byId("idMatType").setText("");
				var g = sap.ui.getCore().byId("entryDialog--idDialogGold").getValue();
				var g1 = parseFloat(sap.ui.getCore().byId("entryDialog--idDialogGold").getValue());
				var s = sap.ui.getCore().byId("entryDialog--idDialogSil").getValue();
				var s1 = parseFloat(sap.ui.getCore().byId("entryDialog--idDialogSil").getValue());
				var c = sap.ui.getCore().byId("entryDialog--idDialogAmt").getValue();
				var c1 = parseFloat(sap.ui.getCore().byId("entryDialog--idDialogAmt").getValue());
				var x = this.getView().byId("idTC").getText();
				var x1 = parseFloat(this.byId("idTC").getText());
				if (x1 > c1) {
					var TGC = x1 - c1;
				}
				if (x1 < c1) {
					var TGC = x1 - c1;
				}
				if (x1 == c1) {
					var TGC = x1 - c1;
				}
				var TGC1 = x1 - TGC;
				var itemList = this.getView().byId("idTable").getItems();
				var noOfItems = itemList.length;
				var nCash = 0;
				var nGold = 0;
				var nSilver = 0;
				if (itemList.length) {
					for (var i = 0; i < itemList.length; i++) {
						var p = itemList[i].getBindingContext().getObject().Cash;
						if (p) {
							nCash += nCash + p - nCash;
						}

					}
				}
				var cash11 = nCash - parseFloat(this.getView().byId("idTable").getSelectedItem().getCells()[4].getText())
				var cash12 = cash11 + TGC1;
				var z = cash12;
				z.toFixed(2);
				parseFloat(z.toFixed(2));
				this.byId("idTC").setText(parseFloat(z.toFixed(2)));
				// this.byId("idTC").setText(z);
				var z1 = this.byId("idTC").getText();
				parseFloat(z1);
				if (parseFloat(z1) > 0) {
					that.byId("idTC").setState('Success');
					debugger;
				} else {
					that.byId("idTC").setState('Warning');
				}
				var x = this.getView().byId("idG").getText();
				var x1 = parseFloat(this.byId("idG").getText());
				if (x1 > g1) {
					var TGC = x1 - g1;
				}
				if (x1 < g1) {
					var TGC = x1 - g1;
				}
				if (x1 == g1) {
					var TGC = x1 - g1;
				}
				var TGC1 = x1 - TGC;
				var itemList = this.getView().byId("idTable").getItems();
				var noOfItems = itemList.length;
				var nCash = 0;
				var nGold = 0;
				var nSilver = 0;
				if (itemList.length) {
					for (var i = 0; i < itemList.length; i++) {
						var q = itemList[i].getBindingContext().getObject().Gold;
						if (q) {
							nGold += nGold + q - nGold;
						}

					}
				}
				var gold11 = nGold - parseFloat(this.getView().byId("idTable").getSelectedItem().getCells()[5].getText())
				var gold12 = gold11 + TGC1;
				var z = gold12;
				z.toFixed(3);
				parseFloat(z.toFixed(3));
				this.byId("idG").setText(parseFloat(z.toFixed(3)));
				// this.byId("idG").setText(z);
				var z1 = this.byId("idG").getText();
				parseFloat(z1);
				if (parseFloat(z1) > 0) {
					that.byId("idG").setState('Success');
					debugger;
				} else {
					that.byId("idG").setState('Warning');
				}
				var x = this.getView().byId("idS").getText();
				var x1 = parseFloat(this.byId("idS").getText());
				if (x1 > s1) {
					var TGC = x1 - s1;
				}
				if (x1 < s1) {
					var TGC = x1 - s1;
				}
				if (x1 == s1) {
					var TGC = x1 - s1;
				}
				var TGC1 = x1 - TGC;
				var itemList = this.getView().byId("idTable").getItems();
				var noOfItems = itemList.length;
				var nCash = 0;
				var nGold = 0;
				var nSilver = 0;
				if (itemList.length) {
					for (var i = 0; i < itemList.length; i++) {
						var r = itemList[i].getBindingContext().getObject().Silver;
						if (r) {
							nSilver += nSilver + r - nSilver;
						}

					}
				}
				var silver11 = nSilver - parseFloat(this.getView().byId("idTable").getSelectedItem().getCells()[6].getText())
				var silver12 = silver11 + TGC1;
				var z = silver12;
				z.toFixed(2);
				parseFloat(z.toFixed(2));
				this.byId("idS").setText(parseFloat(z.toFixed(2)));
				// this.byId("idS").setText(z);
				var z1 = this.byId("idS").getText();
				parseFloat(z1);
				if (parseFloat(z1) > 0) {
					that.byId("idS").setState('Success');
					debugger;
				} else {
					that.byId("idS").setState('Warning');
				}

			},
			onPressHandleEntryCancelPopup: function() {
				this.oDialog.close();
			},
			onPressHandleEntryCancelPopup1: function() {
				this.getView().byId("idGroup1").setEditable(false);

				this.oDialog1.close();
				if (this.getView().byId("id1").getSelected()) {
					this.getView().byId("idGroup1").setEditable(true);
				}
			},

			onPressHandleEntryCancelPopup11: function() {
				// this.getView().byId("idGroup1").setEditable(false);

				this.oDialog2.close();
				// if(this.getView().byId("id1").getSelected()){
				// 			 this.getView().byId("idGroup1").setEditable(true);
				// 		 }
			},

			onEdit: function(oEvent) {
				var recCount = this.getView().byId("idTable").getSelectedItems().length;
				if (recCount > 1) {
					sap.m.MessageBox.alert(
						that.resourceBundle.getText("Selectoneentryonly"));
				} else {
					this._getDialog();
				}
			},

			onMasterClear: function(oEvent) {
				// this.getView().byId("pwd1").setValue("");
				var custId = this.getView().getModel("local").getProperty("/EntryData/Customer");
				var custId1 = this.getView().byId("idCust").getValue();
			// var password11 = this.getView().byId("pwd1").getValue();
			// this.getView().byId("pwd1").setValue();
				var custId2 = this.getView().byId("idCustText").getText();
				if (custId === "" || custId === undefined || custId1 === "" || custId1 === undefined || custId2 === ""  || custId2 === undefined) {
					sap.m.MessageBox.error(" Please Select a Customer ", {
						title: "Error"
					});
					return;
				}
				if(this.getView().byId("idTable").getItems().length===0){
					MessageBox.error("No Data Found to delete in the Table");
					return;
				}
				this.customerId = custId;
				// "Do u want to delete(" + count + ")entries",
				if (!this.oDialog2) {
					this.oDialog2 = new sap.ui.xmlfragment(this.getView().getId(), "victoria.fragments.entryGroupMaster", this);
					this.getView().addDependent(this.oDialog1);
						$("#pwd1").val('');
				}
				$('input[type="password"]').val('');
				$("#pwd1").val('');
this.byId("pwd1").setValue("");
				this.oDialog2.open();
				this.byId("pwd1").setValue("");
				$('input[type="password"]').val('');
				$("#pwd1").val('');

				this.getView().byId("pwd1").setValue("");

			},

			onUpdateFinished: function(oEvent) {
				debugger;
				var oTable = oEvent.getSource();
				var itemList = oTable.getItems();
				var noOfItems = itemList.length;
				var value1 = noOfItems <= 20 ? 0 : noOfItems - 20;
				var id;
				var cell;
				console.log(noOfItems);
				var title = this.getView().getModel("i18n").getProperty("allEntries");
				this.getView().byId("idTitle").setText(title + " " + "(" + noOfItems + ")");
				for (var i = value1; i < noOfItems; i++) {
					var customerId = oTable.getItems()[i].getCells()[2].getText();
					var productId = oTable.getItems()[i].getCells()[3].getText();
					var customerData = this.allMasterData.customers[customerId];
					var productData = this.allMasterData.materials[productId];
					oTable.getItems()[i].getCells()[1].setText(customerData.CustomerCode + ' - ' + customerData.Name);
					if (productId !== "" && productData !== undefined) {
						oTable.getItems()[i].getCells()[3].setText(productData.ProductCode + ' - ' + productData.ProductName);
					}

				}
			}
		});
	});