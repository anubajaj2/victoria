sap.ui.define(["victoria/controller/BaseController","sap/ui/model/json/JSONModel",
"sap/m/MessageBox","sap/m/MessageToast","victoria/models/formatter","sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"],
function (BaseController,JSONModel,formatter,Filter,FilterOperator,MessageBox,MessageToast) {
  "use strict";
  return BaseController.extend("victoria.controller.Entry",{
    // formatter:formatter,
    onInit: function () {
        BaseController.prototype.onInit.apply(this);
        debugger;
      //
        var oRouter = this.getRouter();
      oRouter.getRoute("Entry").attachMatched(this._onRouteMatched, this);

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
				// if	(event.path[0].id=="__component0---idEntry--idCash-inner"){
					debugger;

 			    this.value = this.value.match(/^[+-]?\d{0,8}(\.\d{0,1})?/)[0];
				}
					// }
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
				// if	(event.path[0].id=="__component0---idEntry--idCash-inner"){
					debugger;

 			    this.value = this.value.match(/^[+-]?\d{0,6}(\.\d{0,3})?/)[0];
				}
					// }
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
				// if	(event.path[0].id=="__component0---idEntry--idCash-inner"){
					debugger;

 			    this.value = this.value.match(/^[+-]?\d{0,5}(\.\d{0,2})?/)[0];
				}
					// }
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
				// if	(event.path[0].id=="__component0---idEntry--idCash-inner"){
					debugger;

 			    this.value = this.value.match(/^[+-]?\d{0,5}(\.\d{0,3})?/)[0];
				}
					// }
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
				// if	(event.path[0].id=="__component0---idEntry--idCash-inner"){
					debugger;

 			    this.value = this.value.match(/^[+-]?\d{0,5}(\.\d{0,3})?/)[0];
				}
					// }
 				});
 			});
}
		},
		// decimalvalidator2: function (oEvent) {
		// 	$(function() {
		//
		// 		$('input.').on('input.idGold',function(event) {
		// 	    this.value = this.value.match(/^[+-]?\d{0,4}(\.\d{0,3})?/)[0];
		// 		});
		// 	});
		// },
		// decimalvalidator3: function (oEvent) {
		// 	// debugger;
		// 	// var that = this;
		// 	$(function() {
		//
		// 	jQuery('input').on('input',function () {
		// 	  this.value= this.value.match(/^[+-]?\d{0,1}(\.\d{0,2})?/)[0];
		// 		});
		// 	});
		// },

    onSubmit: function (evt) {
          $(function() {
                  $('input:text:first').focus();
                  var $inp = $('input:text');
                  $inp.bind('keydown', function(e) {
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
    jQuery.sap.delayedCall(500, this, function() {
        this.getView().byId("idweight").focus();
    });
},

    onConfirm: function (oEvent) {
      debugger;

     var myData = this.getView().getModel("local").getProperty("/EntryData");
     var selCust = oEvent.getParameter("selectedItem").getLabel();
     var selCustName = oEvent.getParameter("selectedItem").getValue();
     this.getView().byId("idCust").setValue(selCust);
     this.getView().byId("idCustText").setValue(selCustName);
     myData.Customer=oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
     this.getView().getModel("local").getProperty("/EntryData",myData);
		 var oFilter = new sap.ui.model.Filter("Customer","EQ", "'" + myData.Customer + "'");
		 this.getView().byId("idTable").getBinding("items").filter(oFilter);

		 $.post("/getTotalEntryCustomer",{Customer: myData.Customer}).then(function(result){
			 console.log(result);
		 });


   },

   onSend: function (oEvent) {
     debugger;
     var that=this;
     that.getView().setBusy(true);
     var myData = this.getView().getModel("local").getProperty("/EntryData");
     myData.Date = this.getView().byId("DateId").getDateValue();
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
			 this.getTotals();


   },
	 getTotals: function (oEvent, numbers) {
		  // var myData = this.getView().getModel("local").getProperty("/EntryData");
		 var oTable = this.byId("idTable");
		 // var model = oTable.getModel();
		 // var negatives = [];
		 var nRows= oTable.getBinding("items").getLength();
		 var nCash=0;
		 // var Amount = oTable.mAggregations.columns[2].getHeader().mProperties.text;
		 var data=[];
	  	for(var i=0; i<nRows; i++){
				var amt = this.getView().byId("idTable").getItems()[i].getCells()[2].getText()
				var amt1=parseInt(amt);

				if(amt1>0){
					nCash+=nCash+amt1;
					debugger;
				}


		// 	debugger;
		// 	var col_Array = $('#idTable Column:nth-child(3)').map(function(){
   //     return $(this).text();
   // }).get()​;
		// 	var oContext= oTable.getItems(i);
	 //
		// 	nSum+= Number(nRows[i].myData.Cash);
		// 	// debugger;
		}
	 },

   onDelete: function(){
     var that=this;
     debugger;
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
            if(x.length){
              for(var i=0; i<x.length; i++){
                debugger;
                var myUrl = x[i].getBindingContext().sPath;
                that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,"DELETE",{},{},that);
              }
            }
          sap.m.MessageToast.show("Selected records are deleted");
        }
       }
     }
     );
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
       this.byId("idCustText").getValue();
       this.byId("idweight").setValue("0");
       this.byId("idRemarks").setValue("");
       this.byId("idCash").setValue("0");
       this.byId("idGold").setValue("0");
       this.byId("idSilver").setValue("0");
       this.byId("idtunch").setValue("0");
       this.byId("DueDateId").setValue("");

     }else if (check === false){
       // alert("unsuccessful");
       this.getView().byId("DateId").setDateValue( new Date());
			 jQuery.sap.delayedCall(500, this, function() {
					 this.getView().byId("idCust").focus();
			 });

       this.byId("idCust").setValue("");
       this.byId("idCustText").setValue("");
     this.byId("idweight").setValue("0");
     this.byId("idRemarks").setValue("");
     this.byId("idCash").setValue("0");
     this.byId("idGold").setValue("0");
     this.byId("idSilver").setValue("0");
     this.byId("idtunch").setValue("0");
     this.byId("DueDateId").setValue("");
     }

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
        var customerId = oTable.getItems()[i].getCells()[1].getText();
        var customerData = this.allMasterData.customers[customerId];
        oTable.getItems()[i].getCells()[1].setText(customerData.CustomerCode + ' - ' + customerData.Name );

      }
     //  var aFilter=[];
     //      var data = myData.Customer;
     //      if (data) {
     //        aFilter.push(new sap.ui.model.Filter({path: "Customer",
     //        operator:FilterOperator.EQ,
     //        value1: data
     // }
     //      ));
     //      }
     //      // var oFilter = new sap.ui.model.Filter("Customer Name(code),sap.ui.model.FilterOperator.Contains,data");
     //      var oList = this.getView().byId("idTable");
     //    var oBinding = oList.getBinding("items");
     //    oBinding.filter(aFilter);
		 //
		 //

   }
  });

});
