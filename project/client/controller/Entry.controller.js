sap.ui.define(["victoria/controller/BaseController",
"sap/ui/model/json/JSONModel",
"sap/m/MessageBox",
"sap/ui/core/routing/History",
"sap/m/MessageToast",
"victoria/models/formatter",
"sap/ui/model/Filter"
	],
function (BaseController,
	MessageBox,
	MessageToast,
	JSONModel,
	History,
	formatter,
	Filter
) {
  "use strict";
  return BaseController.extend("victoria.controller.Entry",{
    // formatter:formatter,
    onInit: function () {
			var that=this;
			that.getView().setBusy(true);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Entrys", "GET", null, null, this)
				.then(function(oData) {
					that.getView().setBusy(false);
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});

        BaseController.prototype.onInit.apply(this);
        var oRouter = this.getRouter();
      oRouter.getRoute("Entry").attachMatched(this._onRouteMatched, this);
      },
			getRouter: function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},
      _onRouteMatched : function(){
      var that = this;
      that.getView().getModel("local").setProperty("/EntryData/Date", new Date());
      this.getView().byId("DateId").setDateValue(new Date());

      },
      onSearch: function (oEvent){
debugger;
      },
    onValueHelpRequest: function (oEvent) {
					this.getCustomerPopup(oEvent);
    },
    onCalculate: function (evt) {
      debugger;
      var wtValue = this.byId("idweight").getValue();
      var thValue = this.byId("idtunch").getValue();
      var X = wtValue * thValue / 100;
      var CR = "Silver Received @" + wtValue + 'x' + thValue;
      var SR = "Gold Received @" + wtValue + 'x' + thValue;
      var KR = "Kacchi Received @" + wtValue + 'x' + thValue;
			var CT = "Silver Given @" + wtValue + 'x' + thValue;
			var ST = "Gold Given @" + wtValue + 'x' + thValue;
			var KT = "Kacchi Given @" + wtValue + 'x' + thValue;
			var posMat = "ke jama " + wtValue + 'x' + thValue;
			var negMat = "ke naam " + wtValue + 'x' + thValue;
      if (X > 0 && this.getView().byId("RB-1").getSelected()){
        this.getView().byId("idSilver").setValue(X);
        this.getView().byId("idRemarks").setValue(CR);
      }
      else if (X > 0 && this.getView().byId("RB-2").getSelected()){
        this.getView().byId("idGold").setValue(X);
        this.getView().byId("idRemarks").setValue(SR);
      }
      else if (X > 0 && this.getView().byId("RB-3").getSelected()){
        this.getView().byId("idSilver").setValue(X);
        this.getView().byId("idRemarks").setValue(KR);
      }
			else if (X > 0 && this.getView().byId("RB-4").getSelected() && this.getView().byId("idMatText").getText().split(" ")[3]==="Gold"){
				debugger;
					this.getView().byId("idGold").setValue(X);
				this.getView().byId("idRemarks").setValue(posMat);
			}
			else if (X > 0 && this.getView().byId("RB-4").getSelected() && this.getView().byId("idMatText").getText().split(" ")[2]==="Silver"){
				debugger;
					this.getView().byId("idSilver").setValue(X);
					this.getView().byId("idRemarks").setValue(posMat);
			}
			else if (X < 0 && this.getView().byId("RB-4").getSelected() && this.getView().byId("idMatText").getText().split(" ")[3]==="Gold"){
				debugger;
				this.getView().byId("idGold").setValue(X);
				this.getView().byId("idRemarks").setValue(negMat);
			}
			else if (X < 0 && this.getView().byId("RB-4").getSelected() && this.getView().byId("idMatText").getText().split(" ")[2]==="Silver"){
				debugger;
				this.getView().byId("idSilver").setValue(X);
				this.getView().byId("idRemarks").setValue(negMat);
			}
      else if (X < 0 && this.getView().byId("RB-1").getSelected()){
        this.getView().byId("idSilver").setValue(X);
        this.getView().byId("idRemarks").setValue(CT);
      }
      else if (X < 0 && this.getView().byId("RB-2").getSelected()){
        this.getView().byId("idGold").setValue(X);
        this.getView().byId("idRemarks").setValue(ST);
      }
      else if (X < 0 && this.getView().byId("RB-3").getSelected()){
        this.getView().byId("idSilver").setValue(X);
        this.getView().byId("idRemarks").setValue(KT);
      }
    },
		decimalvalidator1: function (oEvent) {
						debugger;
			if(oEvent.mParameters.id==="__component0---idEntry--idCash"){
			$(function() {
				$('input').on('input.idCash',function(event) {
					if(event.currentTarget.id=="__component0---idEntry--idCash-inner"){
					debugger;
 			    this.value = this.value.match(/^[+-]?\d{0,8}(\.\d{0,1})?/)[0];
				}
 				});
 			});
}
		},
		decimalvalidator2: function (oEvent) {
						debugger;
			if(oEvent.mParameters.id==="__component0---idEntry--idGold"){

			$(function() {
				$('input').on('input.idGold',function(event) {
					if(event.currentTarget.id=="__component0---idEntry--idGold-inner"){
							debugger;
 			    this.value = this.value.match(/^[+-]?\d{0,6}(\.\d{0,3})?/)[0];
				}
 				});
 			});
}
		},
		decimalvalidator3: function (oEvent) {
						debugger;
			if(oEvent.mParameters.id==="__component0---idEntry--idSilver"){
			$(function() {
				$('input').on('input.idSilver',function(event) {
					if(event.currentTarget.id=="__component0---idEntry--idSilver-inner"){
					debugger;
 			    this.value = this.value.match(/^[+-]?\d{0,5}(\.\d{0,2})?/)[0];
				}
 				});
 			});
}
		},
		decimalvalidator4: function (oEvent) {
						debugger;
			if(oEvent.mParameters.id==="__component0---idEntry--idweight"){
			$(function() {
				$('input').on('input.idweight',function(event) {
					if(event.currentTarget.id=="__component0---idEntry--idweight-inner"){
					debugger;
 			    this.value = this.value.match(/^[+-]?\d{0,5}(\.\d{0,3})?/)[0];
				}
 				});
 			});
}
		},
		decimalvalidator5: function (oEvent) {
						debugger;
			if(oEvent.mParameters.id==="__component0---idEntry--idtunch"){
			$(function() {
				$('input').on('input.idtunch',function(event) {
					if(event.currentTarget.id=="__component0---idEntry--idtunch-inner"){
					debugger;
 			    this.value = this.value.match(/^[+-]?\d{0,5}(\.\d{0,3})?/)[0];
				}
 				});
 			});
}
		},
		onMaterialSelect: function (oEvent) {
				debugger;
				var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
			var selMat = oEvent.getParameter("selectedItem").getText();
			var selMatName = oEvent.getParameter("selectedItem").getAdditionalText();
			var selType = oEvent.getParameter("selectedItem").getKey();
			// this.getView().byId("idMatType").setText(selType);
			this.getView().byId("idMat").setValue(selMat);
			this.getView().byId("idMatText").setText(selMatName + " - " + selType);

		},
		// ValueChangeMaterial: function (oEvent){
		// 	debugger;
		// 	var oSource = oEvent.getSource();
		// 	var oFilter = new sap.ui.model.Filter("ProductCode",
		// 	sap.ui.model.FilterOperator.Contains, oEvent.getParameter("suggestValue"));
		// 	oSource.getBinding("suggestionItems").filter(oFilter);
		//
		// },
    onSubmit: function (evt) {
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

    onRadioButtonSelect: function (oEvent) {
      debugger;
			if(this.getView().byId("RB-1").getSelected() ||
			this.getView().byId("RB-2").getSelected() ||
		  this.getView().byId("RB-3").getSelected()){
				this.getView().byId("idformMat").setVisible(false);
				this.getView().byId("idMat").setVisible(false);
				jQuery.sap.delayedCall(500, this, function() {
		        this.getView().byId("idweight").focus();
		    });
			}
			else if(this.getView().byId("RB-4").getSelected()){
				this.getView().byId("idformMat").setVisible(true);
				this.getView().byId("idMat").setVisible(true);
				jQuery.sap.delayedCall(500, this, function() {
						this.getView().byId("idMat").focus();
				});
			}
},

    onConfirm: function (oEvent) {
      debugger;
			var selectedCust = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
    var that=this;
     var myData = this.getView().getModel("local").getProperty("/EntryData");
     var selCust = oEvent.getParameter("selectedItem").getLabel();
     var selCustName = oEvent.getParameter("selectedItem").getValue();
     this.getView().byId("idCust").setValue(selCust);
     this.getView().byId("idCustText").setText(selCustName);
		 this.getView().getModel("local").setProperty("/EntryData/Customer",
		 oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
		 this.getView().getModel("local").setProperty("/entryHeaderTemp/customerId",
		selCust);
     // myData.Customer=;
     this.getView().getModel("local").getProperty("/EntryData",myData);
		 var oFilter = new sap.ui.model.Filter("Customer","EQ", "'" + myData.Customer + "'");
		 this.getView().byId("idTable").getBinding("items").filter(oFilter);
		 this.customerId = oEvent.getParameter("selectedItem").getModel("undefined").getProperty(oEvent.getParameter("selectedItem").getBindingContextPath()).id;
		 $.post("/getTotalEntryCustomer",{Customer: myData.Customer}).then(function(result){
			 console.log(result);
			 debugger;
			 that.byId("idTC").setText(result.CashTotal);
			 that.byId("idTC").getText();
			 parseFloat(that.byId("idTC").getText());
			 if(parseFloat(that.byId("idTC").getText())>0){
				 that.byId("idTC").setState('Success');
				 debugger;
			 }else{
				 that.byId("idTC").setState('Warning');
			 }
			 that.getView().byId("idG").setText(result.GoldTotal);
			 that.byId("idG").getText();
			parseFloat(that.byId("idG").getText());
			if(parseFloat(that.byId("idG").getText())>0){
				that.byId("idG").setState('Success');
				debugger;
			}else{
				that.byId("idG").setState('Warning');
			}
			 that.getView().byId("idS").setText(result.SilverTotal);
			 that.byId("idS").getText();
			parseFloat(that.byId("idS").getText());
			if(parseFloat(that.byId("idS").getText())>0){
				that.byId("idS").setState('Success');
				debugger;
			}else{
				that.byId("idS").setState('Warning');
			}
		 });


   },

   onSend: function (oEvent) {
		 if(this.getView().byId("idMat").getValue()==="" && this.getView().byId("RB-4").getSelected()){
			 sap.m.MessageBox.show("Please enter the Material");
		 }else{
     debugger;
     var that=this;
     that.getView().setBusy(true);
     var myData = this.getView().getModel("local").getProperty("/EntryData");
     myData.Date = this.getView().byId("DateId").getDateValue();
		 myData.Product=this.getView().byId("idMat").getValue();
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
       sap.m.MessageToast.show("Data Saved Successfully");


     }).catch(function(oError) {
       that.getView().setBusy(false);
       var oPopover = that.getErrorMessage(oError);
     });
		   this.getView().byId("DateId").setDateValue( new Date());
			 this.byId("DueDateId").setDateValue( new Date());
			 debugger;
			 var x=this.getView().byId("idTC").getText();
			 var x1=parseFloat(this.byId("idTC").getText());
			 var y=this.getView().byId("idCash").getValue();
			 var y1=parseFloat(this.byId("idCash").getValue());
			 var z = x1+y1;
			 this.byId("idTC").setText(z);
			 var z1 = this.byId("idTC").getText();
			 parseFloat(z1);
			if(parseFloat(z1)>0){
				that.byId("idTC").setState('Success');
				debugger;
			}else{
				that.byId("idTC").setState('Warning');
			}
			var x=this.getView().byId("idG").getText();
			var x1=parseFloat(this.byId("idG").getText());
			var y=this.getView().byId("idGold").getValue();
			var y1=parseFloat(this.byId("idGold").getValue());
			var z = x1+y1;
			this.byId("idG").setText(z);
			var z1 = this.byId("idG").getText();
			parseFloat(z1);
		 if(parseFloat(z1)>0){
			 that.byId("idG").setState('Success');
			 debugger;
		 }else{
			 that.byId("idG").setState('Warning');
		 }
		 var x=this.getView().byId("idS").getText();
		 var x1=parseFloat(this.byId("idS").getText());
		 var y=this.getView().byId("idSilver").getValue();
		 var y1=parseFloat(this.byId("idSilver").getValue());
		 var z = x1+y1;
		 this.byId("idS").setText(z);
		 var z1 = this.byId("idS").getText();
		 parseFloat(z1);
		if(parseFloat(z1)>0){
			that.byId("idS").setState('Success');
			debugger;
		}else{
			that.byId("idS").setState('Warning');
		}
	}
   },
	 // getTotals: function (oEvent, numbers) {
		//   // var myData = this.getView().getModel("local").getProperty("/EntryData");
		//  var oTable = this.byId("idTable");
		//  // var model = oTable.getModel();
		//  // var negatives = [];
		//  var nRows= oTable.getBinding("items").getLength();
		//  var nCash=0;
		//  // var Amount = oTable.mAggregations.columns[2].getHeader().mProperties.text;
		//  var data=[];
	 //  	for(var i=0; i<nRows; i++){
		// 		var amt = this.getView().byId("idTable").getItems()[i].getCells()[2].getText()
		// 		var amt1=parseFloat(amt);
	 //
				// if(amt1>0){
				// 	nCash+=nCash+amt1;
				// 	debugger;
				// }
	 //
	 //
		// // 	debugger;
		// // 	var col_Array = $('#idTable Column:nth-child(3)').map(function(){
   // //     return $(this).text();
   // // }).get()​;
		// // 	var oContext= oTable.getItems(i);
	 // //
		// // 	nSum+= Number(nRows[i].myData.Cash);
		// // 	// debugger;
		// }
	 // },

   onDelete: function(){
     var that=this;
     // debugger;
     sap.m.MessageBox.confirm(
"Deleting Selected Records", {
         title: "Confirm",
         actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
         styleClass: "",
         onClose: function(sAction) {
           debugger;
           if(sAction==="OK"){
             debugger;
             var x = that.getView().byId("idTable").getSelectedItems();
						 var nCash = 0;
						 var nGold = 0;
						 var nSilver = 0;
            if(x.length){
              for(var i=0; i<x.length; i++){
                debugger;
                var myUrl = x[i].getBindingContext().sPath;
                that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,"DELETE",{},{},that);
								var p = x[i].getBindingContext().getObject().Cash;
								var q = x[i].getBindingContext().getObject().Gold;
								var r = x[i].getBindingContext().getObject().Silver;
								if(p){
									nCash+= nCash + p -nCash;
								}
								if(q){
											nGold+= nGold + q -nGold;
								}
							  if(r){
											nSilver+= nSilver + r -nSilver;
								}
              }
							var CA = that.byId("idTC").getText();
							var CA1 = parseFloat(CA);
							var TCA = CA1 - nCash;
							that.byId("idTC").setText(TCA);
							that.byId("idTC").getText();
							parseFloat(that.byId("idTC").getText());
							if(parseFloat(that.byId("idTC").getText())>0){
								that.byId("idTC").setState('Success');
								debugger;
							}else{
								that.byId("idTC").setState('Warning');
							}

							var GA = that.byId("idG").getText();
							var GA1 = parseFloat(GA);
							var TGA = GA1 - nGold;
							that.byId("idG").setText(TGA);
							that.byId("idG").getText();
						 parseFloat(that.byId("idG").getText());
						 if(parseFloat(that.byId("idG").getText())>0){
							 that.byId("idG").setState('Success');
							 debugger;
						 }else{
							 that.byId("idG").setState('Warning');
						 }

							var SA = that.byId("idS").getText();
							var SA1 = parseFloat(SA);
							var TSA = SA1 - nSilver;
							that.byId("idS").setText(TSA);
							that.byId("idS").getText();
						 parseFloat(that.byId("idS").getText());
						 if(parseFloat(that.byId("idS").getText())>0){
							 that.byId("idS").setState('Success');
							 debugger;
						 }else{
							 that.byId("idS").setState('Warning');
						 }
            }

          sap.m.MessageToast.show("Selected records are deleted");
        }
       }
     }
     );
		 // debugger;
   },

   onClear: function(){
     debugger;
     var check = this.getView().byId("CBID").getSelected();
     if (check === true) {
       // alert("Successful");
        this.getView().byId("DateId").setDateValue( new Date());
				jQuery.sap.delayedCall(500, this, function() {
						this.getView().byId("idCash").focus();
				});
       this.byId("idCust").getValue();
       this.byId("idCustText").getText();
			 this.byId("idMat").setValue("");
			 this.byId("idMatText").setText("");
			 this.byId("idMatType").setText("");
       this.byId("idweight").setValue("0");
       this.byId("idRemarks").setValue("");
       this.byId("idCash").setValue("0");
       this.byId("idGold").setValue("0");
       this.byId("idSilver").setValue("0");
       this.byId("idtunch").setValue("0");
       this.byId("DueDateId").setDateValue( new Date());

     }else if (check === false){
       // alert("unsuccessful");
       this.getView().byId("DateId").setDateValue( new Date());
			 jQuery.sap.delayedCall(500, this, function() {
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
		 this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Entrys",
															 "GET", {}, myData, this)
		 // this.getView().getModel("local").getProperty("/EntryData");
     this.byId("DueDateId").setDateValue( new Date());
     }

   },
	 _getDialog: function (selectedEntry) {
		 	var oModel = new sap.ui.model.json.JSONModel();
		 	oModel.setData(selectedEntry);
		 	this.getView().setModel(oModel,"editPopup");
       if(!this.oDialog){
				 
				 this.oDialog= sap.ui.xmlfragment("entryDialog","victoria.fragments.entryDialog",this);
				 this.oDialog.setModel(oModel);

				 // this.getView().addDependent(this.oDialog);
			 }
			 this.oDialog.open();
			//  debugger;
			//  var title = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[1].mProperties.text;
			//  sap.ui.getCore().byId("entryDialog--idDialog-title").setText(title);
			//  var cell0 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[0].mProperties.text;
			//  sap.ui.getCore().byId("entryDialog--idDialogDate").setValue(cell0);
			//  var cell2 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[2].mProperties.text;
			// sap.ui.getCore().byId("entryDialog--idDialogCust").setValue(cell2);
			//  var cell3 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[4].mProperties.text;
			//   sap.ui.getCore().byId("entryDialog--idDialogAmt").setValue(cell3);
			//  var cell4 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[5].mProperties.text;
			//   sap.ui.getCore().byId("entryDialog--idDialogGold").setValue(cell4);
			//  var cell5 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[6].mProperties.text;
			//   sap.ui.getCore().byId("entryDialog--idDialogSil").setValue(cell5);
			//  var cell6 = this.getView().byId("idTable").getSelectedItem().mAggregations.cells[7].mProperties.text;
			//   sap.ui.getCore().byId("entryDialog--idDialogRem").setValue(cell6);


	 },
	 onPressHandleEntrySavePopup: function (oEvent){
		 debugger;
		 var that=this;
		 that.getView().setBusy(true);
		 var myData = this.getView().getModel("local").getProperty("/EntryData");
		 var id = myData.Customer;
		 var editEntry = this.getView().getModel("editPopup").getProperty("/");
		 //id = "5d0ac34f34e68004b91c4ee8";
		 // this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			// "/CustomCalculations('"+myData.id+"')", "PUT", {},myData , this)
			// var myData = {
      //    "Date": editEntry.Date,
      //           "Customer": editEntry.Customer,
      //           "Cash": editEntry.Cash,
      //           "Gold": editEntry.Gold,
      //           "Silver": editEntry.Silver,
      //           "Remarks": editEntry.Remarks,
      //           "Weight": editEntry,,
      //           "Tunch": 0,
      //           "CreatedOn": "/Date(1560986447086)/",
      //           "CreatedBy": "5cd2a47c82243354944969d7",
      //           "ChangedOn": "/Date(1560986447086)/",
      //           "ChangedBy": "5cd2a47c82243354944969d7",
      //           "Product":"5d01d095a94a61374402b277"
			// 				};
			var myData = JSON.parse(JSON.stringify(editEntry));
		  delete(myData.path);
			delete(myData.ToCustomers);
			delete(myData.ToProducts);
			delete(myData.__metadata);
		 this.ODataHelper.callOData(this.getOwnerComponent().getModel(), editEntry.path,
															 "PUT", {}, myData, this)
		 .then(function(oData) {
			 that.getView().setBusy(false);
			 sap.m.MessageToast.show("Data updated Successfully");

		 }).catch(function(oError) {
			 that.getView().setBusy(false);
			 var oPopover = that.getErrorMessage(oError);
		 });


	 },
	 onPressHandleEntryCancelPopup: function () {
		 this.oDialog.close();
	 },

	 onEdit: function (oEvent) {
		 debugger;

		 var recCount =this.getView().byId("idTable").getSelectedItems().length;
		 if(recCount>1){
			 sap.m.MessageBox.alert(
			 "Select one entry only");
		 }
		 else{
			 var selectedEntry = oEvent.getSource().getParent().getParent().getModel().getProperty(oEvent.getSource().getParent().getParent().getSelectedContextPaths()[0]);
			 selectedEntry.path = oEvent.getSource().getParent().getParent().getSelectedContextPaths()[0];

		  this._getDialog(selectedEntry);
     }

		 // var dialog = new sap.m.Dialog({
			//  title: '{Customer}',
			//  contentHeight:'25rem',
			//  contentWidth:'25rem',
			//  content: [
			// 	 new sap.m.Label({
			// 	 text: "Date"
			//  }),
			//  new sap.m.Input({
			// 	 value:""
			//  })
		 // ],
			//  beginButton: new sap.m.Button({
			// 	 text:'Submit'
			//  }),
			//  endButton: new sap.m.Button({
			// 	 text:'Close',
			// 	 press: function () {
	 		// 			 dialog.close();
	 		// 		 }
			//  })
		 //
		 // });
		 // dialog.open();

	 },

	 onMasterClear: function (oEvent){
debugger;
 var x = this.getView().byId("idCust").getValue();
if(!x){
  this.getView().byId("idCust").setValueState(sap.ui.core.ValueState.Error);
}
var count = this.getView().byId("idTable").getItems().length;
var that=this;

sap.m.MessageBox.confirm(
"Do u want to delete("  + count +   ")entries", {
		title: "Confirm",
		actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
		styleClass: "",
		onClose: function(sAction) {
			if(sAction==="OK"){
			debugger;
			$.post("/deleteRecords",{
				customerId: that.customerId
			, entityName: "Entry"}).done(function(response){
				sap.m.MessageToast.show(response.msg);

			});
	    Entrys.refresh(true);
			// var myData=that.getView().getModel("local").getProperty("/EntryData");
			// that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Entrys('"+ myData.Customer +"')",
			// 															 "DELETE", {}, {}, that)
			// .then(function(oData) {
			// 	that.getView().setBusy(false);
			// 	sap.m.MessageToast.show("Data deleted Successfully");
			//
			// }).catch(function(oError) {
			// 	that.getView().setBusy(false);
			// 	var oPopover = that.getErrorMessage(oError);
			// });


						}
						else if(sAction==="CANCEL"){
							this.getView().setBusy(false);
						}
			}
		});


	 },

   onUpdateFinished: function (oEvent) {
     debugger;
//
     var oTable = oEvent.getSource();
     var itemList = oTable.getItems();
      var noOfItems = itemList.length;
      var value1;
      var id;
      var cell;
      for (var i=0; i < noOfItems; i++) {
        var customerId = oTable.getItems()[i].getCells()[2].getText();
        var customerData = this.allMasterData.customers[customerId];
        oTable.getItems()[i].getCells()[1].setText(customerData.CustomerCode + ' - ' + customerData.Name );

      }
   }
  });

});
