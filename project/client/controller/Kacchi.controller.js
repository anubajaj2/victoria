/*global location*/
sap.ui.define(
    ["victoria/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "victoria/models/formatter",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/m/MessageBox"],
  function (BaseController,JSONModel,History,formatter,MessageToast,Filter,MessageBox) {
        "use strict";

  return BaseController.extend("victoria.controller.Kacchi", {
      formatter: formatter,

  onInit:function(){
    debugger;
    // that = this;
    BaseController.prototype.onInit.apply(this);
    this.createModel(); // Create Json Model for SAP.UI.Tabel
    // var oTable = this.getView().byId("idCustTable");
    // this.setupTabHandling(oTable);
    //populate the view table with all the data present in DB Table
    // var that = this;
    // debugger;
    // this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
  	//  "/Kacchis", "GET", {}, {}, this)
    //   .then(function(oData) {
    //     debugger;
    //     for (var i = 0; i < oData.results.length; i++) {
    //       that.allMasterData.Kacchis[oData.results[i].id] = oData.results[i];
    //     }
    //   }).catch(function(oError) {
    //     var oPopover = that.getErrorMessage(oError);
    //   });
},

  getTotals: function(){
    debugger;
    var paggaCount = 0;
    var count  = 0;
    var tWeight = 0.00;
    var tTunch = 0.00;
    var cntTunch = 0;
    var tFine = 0.00;
    var oTable = this.byId("idCustTable");
    var oCount = this.byId("idItemsCount");
    var oWeight = this.byId("idTotalWeight");
    var oTunch = this.byId("idTotalTunch");
    var oFine = this.byId("idTotalFine");
    var nRows = oTable.getBinding("rows").getLength();
    for(var i=0 ; i< nRows ; i++){
      var oContext= oTable.getContextByIndex(i);
      var recordsCnt = oContext.getProperty('PaggaNo');
      var totalWeight = oContext.getProperty('Weight');
      var avgTunch = oContext.getProperty('Tunch');
      var totalFine = oContext.getProperty('Fine');
      if(recordsCnt){
       count = count + 1;
        oCount.setText(count);
      }
      if(totalWeight){
        tWeight = +tWeight + +totalWeight;
        oWeight.setText(tWeight);
      }
      if(avgTunch){
        cntTunch = cntTunch + 1;
        tTunch = (+tTunch + +avgTunch) / cntTunch;
        oTunch.setText(tTunch);
      }
      if(totalFine){
        tFine = (+tFine + +totalFine);
        oFine.setText(tFine);
      }
    }
  },
// this method is called as and when the used performs any action on input fields like putting the value setColor
// at this time we have the flexibility to perform any real time operation/calculations on the ui fields
  onliveChange: function(oEvent){

    debugger;
    this.byId("idSaveIcon").setColor('red');
    var oCurrentRow = oEvent.getSource().getParent();
    var cells = oCurrentRow.getCells();
    cells[3].setValue(cells[1].getValue() * cells[2].getValue() / 100);
        // this.setHeaderData();
     this.getTotals();
  },
  onPrint: function(oEvent){
    var i;
    // This function has been implemented to give the user's flexibility to print the document
    debugger;

    var header = 	'<center><h3>Kachhi Report</h3></center><hr>'
                  +
                  "<table width='40%'><tr><td><b>Date:</b></td><td>"+this.byId('idDate').getValue()+"</td></tr>" +
                  '<tr><td><b>Customer Name:</b></td><td>'+this.byId('idCustName').getValue()+'</td></tr></table><br>';
    var footer = 	"<table width='40%'><tr><td><b>Total Weight:</b></td><td>"+this.byId('idTotalWeight').getText()+"</td></tr>" +
                  '<tr><td><b>Total Fine:</b></td><td>'+this.byId('idTotalFine').getText()+'</td></tr></table><br>';
    var table = "<table style='border-collapse: collapse;border:1px solid black;'width='95%'';'text-align:center';'border-spacing: 5px';><tr><th style=border:1px solid black;>pagga</th><th style=border:1px solid black;>Weight</th><th style=border:1px solid black;>Tunch</th><th style=border:1px solid black;>Fine</th></tr>";

    var data = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");
    for(i=0 ; i<data.length ; i++){
      if(data[i].PaggaNo){
        table += '<tr>';
        table += "</td><td style='border: 1px solid black;'>" + data[i].PaggaNo+"</td><td style='border: 1px solid black;'>" +
                 data[i].Weight + "</td><td style='border: 1px solid black;'>" + data[i].Tunch +
                 "</td><td style='border: 1px solid black;'>" + data[i].Fine + "</td></tr>";
                 // "<td style='border: 1px solid black;'>" + (i + 1) +
      }
    }
    table +='</table>'

    var myWindow = window.open("", "PrintWindow", "width=200,height=100");
        myWindow.document.write(header+table+'<br>'+footer);
  			myWindow.print();
  			myWindow.stop();

  },
  createModel : function(){
    var oKacchiItem = new JSONModel();
		//create array
		var array=[];
		//loop the array values
		for (var i=1;i<=20;i++){
			var oItem={
        id:"",
        Date: "",
        Customer:"",
        PaggaNo: 0,
        Weight: 0.00,
        Tunch: 0.00,
        Fine: 0.00,
        status:true
			};
      	array.push(oItem);
      }

    oKacchiItem.setData({
				"kachhiData": array,
        "kacchiHeader": {
          "cdate": new Date(),
          "customer": ""
        }
		});
		this.getView().setModel(oKacchiItem, "kachhiLocalModel");
    this.byId("idDate").setDateValue(new Date());

  },
//  Get the F4 help for Customers
  onCustValueHelp: function(oEvent){

      this.getCustomerPopup(oEvent);
  },
  // Save the data entered in the UI table to the dataBase
  onSave: function(oEvent){
    debugger;
    var that = this;
      this.getView().setBusy(true);
    var CustNo = this.byId("idCustNo").getValue()
    if ( CustNo === "" ) {
      sap.m.MessageBox.error("Customer is mandatory input",{
      title: "Error",
      styleClass: "",
      initialFocus: null,
      textDirection: sap.ui.core.TextDirection.Inherit,
      actions: MessageBox.Action.OK ,
      onClose : function(oAction){
        debugger;
        if (oAction === MessageBox.Action.OK) {
            that.getView().byId("idCustNo").setValueState("Error").setValueStateText("Mandatory Input");
            that.getView().setBusy(false);
        }
      }
    });
    }else{
      for(var i=0; i < 20; i++){
         var myData = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData")[i];
         myData.Customer = this.getView().getModel("local").getProperty("/kacchiData").Customer
         myData.Date = this.getView().byId("idDate").getDateValue();
        if(myData.PaggaNo  !== 0 &&
           myData.Weight   !== 0 &&
           myData.Tunch    !== 0 &&
           myData.Fine     !== 0 &&
           myData.Customer !== "" &&
           myData.id        == ""){
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Kacchis",
                                        "POST", {}, myData, this)

            .then(function(oData) {
              that.getView().setBusy(false);
              sap.m.MessageToast.show("Data Saved Successfully");
              //read the data which is Saved
              debugger;
              var id = oData.id;
              var pagga = oData.PaggaNo;
              var allItems = that.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");
              for (var i = 0; i < allItems.length; i++) {
                if( allItems[i].PaggaNo == oData.PaggaNo){
                  allItems[i].id = id;
                  break;
                }
              }
              that.getView().getModel("kachhiLocalModel").setProperty("/kachhiData",allItems);
              that.byId("idSaveIcon").setColor('green');

            }).catch(function(oError) {
              that.getView().setBusy(false);
              var oPopover = that.getErrorMessage(oError);
            });
          }
          this.getView().setBusy(false);
        }
      }
  },
  onClear:function(){
    debugger;
    var that = this;
           sap.m.MessageBox.confirm("Are you sure to clear entries",{
           title: "Confirm",
           styleClass: "",
           initialFocus: null,
           textDirection: sap.ui.core.TextDirection.Inherit,
           actions: ["Save & Clear","Clear", MessageBox.Action.CANCEL] ,
           onClose : function(oAction){
             debugger;
             if (oAction === "Clear") {
                 that.byId("idCustNo").setValue("");
                 that.byId("idCustName").setValue("");
                 that.byId("idDate").setDateValue(new Date());
                 that.byId("idItemsCount").setText("");
                 that.byId("idTotalWeight").setText("");
                 that.byId("idTotalFine").setText("");
                 that.byId("idTotalTunch").setText("");
                 that.createModel();
                 that.byId("idSaveIcon").setColor('green');
                 sap.m.MessageToast.show("Screen Cleared Successfully!");
             }else if(oAction === "Save & Clear"){
               that.onSave();
               that.byId("idCustNo").setValue("");
               that.byId("idCustName").setValue("");
               that.byId("idDate").setDateValue(new Date());
               that.byId("idItemsCount").setText("");
               that.byId("idTotalWeight").setText("");
               that.byId("idTotalFine").setText("");
               that.byId("idTotalTunch").setText("");
               that.createModel();
               that.byId("idSaveIcon").setColor('green');
               sap.m.MessageToast.show("Data Saved! Screen Cleared Successfully !");

             }

           }
         });
  },
  onDelete: function(oEvent) {
    debugger;
    var that = this;
    sap.m.MessageBox.confirm("Are you sure to delete the selected entries",{
    title: "Confirm",                                    // default
    styleClass: "",                                      // default
    initialFocus: null,                                  // default
    textDirection: sap.ui.core.TextDirection.Inherit,     // default
    onClose : function(sButton){
      debugger;
    if (sButton === MessageBox.Action.OK) {
      var selIdxs = that.getView().byId("idCustTable").getSelectedIndices();
      if (selIdxs.length) {
        for(var i=0; i < selIdxs.length; i++){
          var id  = that.getView().getModel("kachhiLocalModel").getProperty("/kachhiData")[i].id;
          var myUrl = "/Kacchis('" + id + "')"
          that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,
                                    "DELETE", {}, {}, that);
          var oTableData = that.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");
          oTableData.splice(i, 1);
          that.getView().getModel("kachhiLocalModel").setProperty("/kachhiData",oTableData);
          that.getView().byId("idCustTable").clearSelection();
        }
      }
      sap.m.MessageToast.show("Selected lines are deleted");
    }
  }
});
},
onConfirm: function(oEvent){
  debugger;
  //whatever customer id selected push that in local model
    var myData = this.getView().getModel("local").getProperty("/kacchiData");
    myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
    this.getView().getModel("local").setProperty("/kacchiData", myData);
  // added by sweta to populate the selected cust and text to the input field
    var selCust = oEvent.getParameter("selectedItem").getLabel();
    var selCustName = oEvent.getParameter("selectedItem").getValue();
    if(selCust){
      var custHeader = this.getView().getModel("local").getProperty("/kachhiHeaderTemp");
          custHeader.CustomerId = selCust;
          custHeader.CustomerName = selCustName;
          this.getView().getModel("local").setProperty("/kachhiHeaderTemp", custHeader);
          this.getView().byId("idCustNo").setValueState();
    }
  }
});
});
