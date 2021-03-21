sap.ui.define([
	"victoria/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"sap/ui/model/FilterOperator"
], function(Controller, MessageBox, MessageToast, Filter, exportLibrary,Spreadsheet,FilterOperator) {
	"use strict";
	var EdmType = exportLibrary.EdmType;
	return Controller.extend("victoria.controller.dayBook", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf acc.fin.ar.view.View2
		 */

		onInit: function() {debugger;
			var that = this;
			that.getView().setBusy(true);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Entrys", "GET", null, null, this)
				.then(function (oData) {
					that.getView().setBusy(false);
				}).catch(function (oError) {
					var oPopover = that.getErrorMessage(oError);
				});


			Controller.prototype.onInit.apply(this);
			var oRouter = this.getRouter();
			oRouter.getRoute("dayBook").attachMatched(this._onRouteMatched, this);
			var that = this;
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			loginUser = "Hey " + loginUser;
			this.getView().byId("idUser").setText(loginUser);
		},
		getRouter: function () {debugger;
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		_onRouteMatched: function () {debugger
			var that = this;
			that.getView().getModel("local").setProperty("/EntryData/Date", new Date());
			this.getView().byId("DateId1").setDateValue(new Date());


		},

		onValueHelpRequest: function (oEvent) {debugger;
			this.inpField = oEvent.getSource().getId();
			this.getCustomerPopup(oEvent);
		},


		onEnter: function (oEvent) {
			this.getCustomer(oEvent);

			this.getView().byId("idCash1").focus();
		},
		_getSecureDetails: function() {
			var that = this;
			//that.getView().byId("viewSecureTable").setBusy(true);
			//TODO: Set data to local model
		},

		onPressEntryDownload: function () {debugger;
			var cust= this.getView().byId("idCustDay").getValue();
			var minDate=this.getView().byId("dateRangeId").getDateValue();
			var maxDate=this.getView().byId("dateRangeId").getSecondDateValue();
			var myData = this.getView().getModel("local").getProperty("/EntryData");
			var city=null;
			var name=null;
			this.getView().getModel("local").getProperty("/EntryData", myData);

			if(minDate===null && maxDate===null){
				window.open("/entryDownload?id="+myData.Customer+"&type=DayBook&name="+name+"&city="+city+"&min="+minDate+"&max="+maxDate);
			}
			else if(cust===""){
				window.open("/entryDownloadDate?id="+cust+"&type=DayBook&name="+name+"&city="+city+"&min="+minDate.toISOString()+"&max="+maxDate.toISOString());
			}
			else{
				window.open("/entryDownloadBetween?id="+myData.Customer+"&type=DayBook&name="+name+"&city="+city+"&min="+minDate.toISOString()+"&max="+maxDate.toISOString());
			}


		},

		onBeforeExport: function(oEvt) {
			var mExcelSettings = oEvt.getParameter("exportSettings");

			// Disable Worker as Mockserver is used in Demokit sample
			mExcelSettings.worker = false;
		},



		onExportExcel: function() {
			var that=this;
			debugger;
			var data= this.getView().getModel().oData;
			// var data = sap.ui.getCore().getModel("ojsonModel").getData();

			this.JSONToExcelConvertor(data, "Report", true);

		},
		JSONToExcelConvertor: function(JSONData, ReportTitle, ShowLabel) {
			debugger;

			// If JSONData is not an object then JSON.parse will parse the JSON
			// string in an Object

			var arrData = typeof JSONData.tableDetails != 'object' ? JSON.parse(JSONData.tableDetails) : JSONData.tableDetails;
			var CSV = "";
			//CSV+= ReportTitle + '\r\n\n';

			// Set Report title in first row or line
			if (ShowLabel) {
				var row = "";
				row = row.slice(0, -1);
				// CSV+= row + '\r\n';
			}
			/*row+="'" + this.getView().byId("delvQtyId").getText() + "'"+this.getView().byId("delvQtyId").getText()+"'"+this.getView().byId("delvQtyId").getText() +"'"+this.getView().byId("delvQtyId").getText() +"'"+this.getView().byId("delvQtyId").getText() +"'"
			+this.getView().byId("delvQtyId").getText() +"'"+this.getView().byId("delvQtyId").getText() +"'";*/
			row += '"' + this.getView().byId("id1").getText() + '",';
			row += '"' + this.getView().byId("id2").getText() + '",';
			row += '"' + this.getView().byId("id3").getText() + '",';
			row += '"' + this.getView().byId("id4").getText() + '",';
			row += '"' + this.getView().byId("cashid").getText() + '",';
			row += '"' + this.getView().byId("id5").getText() + '",';
			row += '"' + this.getView().byId("id6").getText() + '",';
			row += '"' + this.getView().byId("id7").getText() + '",';
			CSV += row + '\r\n';
			//loop is to extract each row
			for (var i = 0; i < arrData.length; i++) {
				var row = "";
				for (var index in arrData[i]) {
					row += '"' + arrData[i][index] + '",';
				}

				/*row+="'" + arrData[i].delvqty + "'"+arrData[i].pickedqty +"'"+arrData[i].Variance +"'"+arrData[i].totalpickedwt +"'"+arrData[i].Unitwt +"'"
				+arrData[i].totalpickedvolume +"'"+arrData[i].UnitVolume +"'";*/
				row.slice(1, row.length);
				CSV += row + '\r\n';

			}
			var endrow = "";
			endrow += '"",';
			endrow += '"",';
			endrow += '"",';
			endrow += '"Total:' + this.getView().byId("totalPickedWtId").getText() + '",';
			endrow += '"",';
			endrow += '"Total:' + this.getView().byId("totalPickedVolId").getText() + '",';
			endrow += '"",';
			CSV += endrow + '\r\n';
			if (CSV == "") {
				alert("Invalid data");
				return;
			}
			var fileName = "MyReport_";
			fileName += ReportTitle.replace(/ /g, "_");
			// Initialize file format you want csv or xls

			// var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
			var uri = 'data:application/vnd.ms-excel:base64,' + encodeURIComponent(CSV);
			var link = document.createElement("a");
			link.href = uri;

			// set the visibility hidden so it will not effect on your web layout

			link.style = "visibility:hidden";
			link.download = fileName + ".xls";

			// this part will append the anchor tag and remove it after automatic

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

		},




		onConfirm: function (oEvent) {
			var selCust = oEvent.getParameter("selectedItem").getLabel();
			this.getView().byId("idCustDay").setValue(selCust);
			this.getView().getModel("local").setProperty("/EntryData/Customer",
									 oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
			// this.cusId= oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
		},



		onUpdateFinished: function (oEvent) {
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
								this.getView().byId("idTable1").setBlocked(false);
								this.getView().byId("idTable1").setShowOverlay(false)
							for (var i = 0; i < noOfItems; i++) {
									var customerId = oTable.getItems()[i].getCells()[2].getText();
									var productId = oTable.getItems()[i].getCells()[3].getText();
									var customerData = this.allMasterData.customers[customerId];
									var productData = this.allMasterData.materials[productId];
									oTable.getItems()[i].getCells()[1].setText(customerData.CustomerCode + ' - ' + customerData.Name);
									// oTable.getItems()[i].getCells()[3].setText(productData.ProductCode + ' - ' + productData.ProductName);
									if(productId !== "" && productData !== undefined){
										oTable.getItems()[i].getCells()[3].setText(productData.ProductCode + ' - ' + productData.ProductName);
									}
							}
							this.getView().byId("idTable1").setBlocked(false);

		},



		onFilterSearch: function(oEvent) {
			debugger;
			var that=this;
			var cust= this.getView().byId("idCustDay").getValue();
			var minDate=this.getView().byId("dateRangeId").getDateValue();
			var maxDate=this.getView().byId("dateRangeId").getSecondDateValue();
			var myData = this.getView().getModel("local").getProperty("/EntryData");
			var oFilter=[];
			// if(cust === ""){
			// 	MessageToast.show("Customer is Mandatory");
			// 	return;
			// }
			if(minDate!==null && maxDate!==null){
				var oFilter1 = new Filter([
						new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.BT, minDate,maxDate)
					], true);
				oFilter.push(oFilter1);
			}
			if(cust !== ""){
				this.getView().getModel("local").getProperty("/EntryData", myData);
							 var oFilter2 = new sap.ui.model.Filter("Customer", "EQ", "'" + myData.Customer + "'");

				// var oFilter2=new Filter([
				// 		new sap.ui.model.Filter("CustomerCode", sap.ui.model.FilterOperator.EQ,"'"+ this.cusId+"'")
				// 	], true);
				oFilter.push(oFilter2);
			}
				this.getView().byId("idTable1").getBinding("items").filter(oFilter);
				if(minDate===null && maxDate===null){
						$.post("/getTotalEntryCustomer", {
		                    Customer: myData.Customer,
												// max:maxDate.toISOString(),
												// min:minDate.toISOString()
		                }).then(function (result) {
													debugger;
													that.byId("idTC1").setText(parseFloat(result.CashTotal).toFixed(0));
													that.byId("idTC1").getText();
													parseFloat(that.byId("idTC1").getText());
													if (parseFloat(that.byId("idTC1").getText()) > 0 ) {
														that.byId("idTC1").setState('Success');
														debugger;
													} else {
														that.byId("idTC1").setState('Warning');
													}
													that.getView().byId("idG1").setText(parseFloat(result.GoldTotal.toFixed(3)));
													that.byId("idG1").getText();
													parseFloat(that.byId("idG1").getText());
													if (parseFloat(that.byId("idG1").getText()) > 0) {
														that.byId("idG1").setState('Success');
														debugger;
													} else {
														that.byId("idG1").setState('Warning');
													}
													that.getView().byId("idS1").setText(parseFloat(result.SilverTotal.toFixed(2)));
													that.byId("idS1").getText();
													parseFloat(that.byId("idS1").getText());
													parseFloat(that.byId("idS1").getText()).toFixed(3);
													// parseFloat(that.byId("idS").getText());
													// parseFloat(that.byId("idS").getText()).toFixed(3);
													// parseFloat(parseFloat(that.byId("idS").getText()).toFixed(3));
													if (parseFloat(parseFloat(that.byId("idS1").getText()).toFixed(3)) > 0) {
														that.byId("idS1").setState('Success');
														debugger;
													} else {
														that.byId("idS1").setState('Warning');
													}debugger;
		                });
					}
					else{
						$.post("/getTotalEntryCustomerBetween", {
		                    Customer: myData.Customer,
												max:maxDate.toISOString(),
												min:minDate.toISOString()
		                }).then(function (result) {
													debugger;
													that.byId("idTC1").setText(parseFloat(result.CashTotal).toFixed(0));
													that.byId("idTC1").getText();
													parseFloat(that.byId("idTC1").getText());
													if (parseFloat(that.byId("idTC1").getText()) > 0 ) {
														that.byId("idTC1").setState('Success');
														debugger;
													} else {
														that.byId("idTC1").setState('Warning');
													}
													that.getView().byId("idG1").setText(parseFloat(result.GoldTotal.toFixed(3)));
													that.byId("idG1").getText();
													parseFloat(that.byId("idG1").getText());
													if (parseFloat(that.byId("idG1").getText()) > 0) {
														that.byId("idG1").setState('Success');
														debugger;
													} else {
														that.byId("idG1").setState('Warning');
													}
													that.getView().byId("idS1").setText(parseFloat(result.SilverTotal.toFixed(2)));
													that.byId("idS1").getText();
													parseFloat(that.byId("idS1").getText());
													parseFloat(that.byId("idS1").getText()).toFixed(3);
													// parseFloat(that.byId("idS").getText());
													// parseFloat(that.byId("idS").getText()).toFixed(3);
													// parseFloat(parseFloat(that.byId("idS").getText()).toFixed(3));
													if (parseFloat(parseFloat(that.byId("idS1").getText()).toFixed(3)) > 0) {
														that.byId("idS1").setState('Success');
														debugger;
													} else {
														that.byId("idS1").setState('Warning');
													}debugger;
		                });
					}


		},


		onPayDateChange: function(oEvent) {debugger;




		},


		createColumnConfig: function() {
			var aCols = [];
			var aRows=[];
			aCols.push({
				label: 'Date',
				property: ['Date'],
				type: EdmType.Date,

			});

			aCols.push({
				property: ['Name','CustomerCode'],

			});

			aCols.push({
				property: 'Customer',
				type: EdmType.String
			});

			aCols.push({
				property: 'Product',
				type: EdmType.String
			});

			aCols.push({
				property: 'Cash',
				type: EdmType.Number
			});

			aCols.push({
				property: 'Gold',
				type: EdmType.Number,

			});

			aCols.push({
				property: 'Silver',
				type: EdmType.Number
			});

			aCols.push({
				property: 'Remarks',
				type: EdmType.String,

			});

			aRows.push({
				property:"TA",
				type:EdmType.Number
			});

			return aCols;
		},


		onExport: function() {
			var aCols, oRowBinding, oSettings, oSheet, oTable;

			if (!this._oTable) {
				this._oTable = this.byId('idTable1');
			}

			oTable = this._oTable;
			oRowBinding = oTable.getBinding('items');

			aCols = this.createColumnConfig();

			var oModel = oRowBinding.getModel();

			oSettings = {
				workbook: {
					columns: aCols,
					hierarchyLevel: 'Level'
				},
				dataSource: {
					type: 'OData',
					dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
					serviceUrl: this._sServiceUrl,
					headers: oModel.getHeaders ? oModel.getHeaders() : null,
					count: oRowBinding.getLength ? oRowBinding.getLength() : null,
					useBatch: true // Default for ODataModel V2
				},
				fileName: 'Table export sample.xlsx',
				worker: false // We need to disable worker because we are using a MockServer as OData Service
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				oSheet.destroy();
			});
		},


		totalFormatter:function(results) {debugger;
			return results.length;
	},



	decimalvalidator1: function (oEvent) {
		debugger;
		if (oEvent.mParameters.id === "__component0---idEntry--idCash") {
			$(function () {
				$('input').on('input.idCash', function (event) {
					if (event.currentTarget.id == "__component0---idEntry--idCash-inner") {
						debugger;
						this.value = this.value.match(/^[+-]?\d{0,8}(\.\d{0,2})?/)[0];
					}
				});
			});
		}
	},
	decimalvalidator2: function (oEvent) {
		debugger;
		if (oEvent.mParameters.id === "__component0---idEntry--idGold") {

			$(function () {
				$('input').on('input.idGold', function (event) {
					if (event.currentTarget.id == "__component0---idEntry--idGold-inner") {
						debugger;
						this.value = this.value.match(/^[+-]?\d{0,6}(\.\d{0,3})?/)[0];
					}
				});
			});
		}
	},
	decimalvalidator3: function (oEvent) {
		debugger;
		if (oEvent.mParameters.id === "__component0---idEntry--idSilver") {
			$(function () {
				$('input').on('input.idSilver', function (event) {
					if (event.currentTarget.id == "__component0---idEntry--idSilver-inner") {
						debugger;
						this.value = this.value.match(/^[+-]?\d{0,5}(\.\d{0,2})?/)[0];
					}
				});
			});
		}
	},
	decimalvalidator4: function (oEvent) {
		debugger;
		if (oEvent.mParameters.id === "__component0---idEntry--idweight") {
			$(function () {
				$('input').on('input.idweight', function (event) {
					if (event.currentTarget.id == "__component0---idEntry--idweight-inner") {
						debugger;
						this.value = this.value.match(/^[+-]?\d{0,5}(\.\d{0,3})?/)[0];
					}
				});
			});
		}
	},
	decimalvalidator5: function (oEvent) {
		debugger;
		if (oEvent.mParameters.id === "__component0---idEntry--idtunch") {
			$(function () {
				$('input').on('input.idtunch', function (event) {
					if (event.currentTarget.id == "__component0---idEntry--idtunch-inner") {
						debugger;
						this.value = this.value.match(/^[+-]?\d{0,5}(\.\d{0,3})?/)[0];
					}
				});
			});
		}
	},
	onMaterialSelect: function (oEvent) {
		var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
		var selMat = oEvent.getParameter("selectedItem").getText();
		var selMatName = oEvent.getParameter("selectedItem").getAdditionalText();
		var selType = oEvent.getParameter("selectedItem").getKey();
		// this.getView().byId("idMatType").setText(selType);
		this.getView().byId("idMat").setValue(selMat);
		this.getView().byId("idMatText").setText(selMatName + " - " + selType);
	},
	onRemarksSubmit: function (oEvent) {
		this.getView().byId("sendButton").focus();
	},

	onSubmit: function (evt) {
		$(function () {
			$('input:text:first').focus();
			var $inp = $('input:text');
			$inp.bind('keypress', function (e) {
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
	onCashSubmit: function (evt) {
		this.getView().byId("idGold").focus();
	},
	onGoldSubmit: function (evt) {
		this.getView().byId("idSilver").focus();
	},
	onSilverSubmit: function (evt) {
		this.getView().byId("idRemarks").focus();
	},
	onRemarksSubmit: function (evt) {
		this.getView().byId("sendButton").focus();
	},
	onSubmitSideWeight: function (evt) {
		this.getView().byId("idtunch").focus();
	},
	onSubmitSideTunch: function (evt) {
		this.getView().byId("calculateButton").focus();
	},
	onSelect: function (oEvent) {
		jQuery.sap.delayedCall(500, this, function () {
			// this.getView().byId("idCust").focus();
		});

	},
	inpField: "",
	onSelectValue: function(oEvent){debugger;
		var selectedItem = oEvent.getParameter("selectedItem");
		var sTitle = selectedItem.getLabel();
		sap.ui.getCore().byId(this.inpField).setValue(sTitle);
		var that = this;

			this.getView().byId("idCustDay").setValue(sTitle);


},



	});

});
