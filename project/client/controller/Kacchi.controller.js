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
  var customerId;
  return BaseController.extend("victoria.controller.Kacchi", {
      formatter: formatter,

  onInit:function(){
    debugger;
    this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
    // that = this;
    BaseController.prototype.onInit.apply(this);
    var oRouter = this.getRouter();
    oRouter.getRoute("Kacchi").attachMatched(this._onRouteMatched, this);
    // this.createModel();
    this.byId("idTransferButton").setEnabled(false);
},
getRouter: function(){
    return this.getOwnerComponent().getRouter();
},
_onRouteMatched: function(oEvent){
    var that = this;
    that.clearScreen();
    that.createModel();
    that.byId("idSaveIcon").setColor('green');
},
//Delete the selected rows from the UI table
  onSelDelete: function(){
    debugger;
    var oTable = this.byId("idCustTable");
    var nRows = oTable.getBinding("rows").getLength();
    var oTableData = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");
    var selIdxs = this.getView().byId("idCustTable").getSelectedIndices();
    for(var i = selIdxs.length - 1; i >= 0; --i){
      // var oContext= oTable.getContextByIndex(i);
      // var deleteInd = oContext.getProperty('deleteInd');
      // if(deleteInd === "X"){
         oTableData.splice(selIdxs[i], 1); // removed i with selIdNo
         oTableData.push({
           id:"",
           deleteInd: "",
           Date: "",
           Customer:"",
           PaggaNo: 0,
           Weight: 0.00,
           Tunch: 0.00,
           Fine: 0.00
         });
      // }
    }
    this.getView().getModel("kachhiLocalModel").setProperty("/kachhiData", oTableData);
    oTable.clearSelection();

  },
  toggleFullScreen: function(oEvent){
    debugger;
    var btnId = "idFullScreenBtn";
    var headerId = "idKacchiHead";
    this.toggleUiTable(btnId,headerId)
  },
  getTotals: function(){
    debugger;
    var paggaCount = 0,count = 0,tWeight = 0.00,
    tTunch = 0.00,cntTunch = 0,tFine = 0.00;
    this.byId("idItemsCount").setText("");
    this.byId("idTotalWeight").setText("");
    this.byId("idTotalFine").setText("");
    this.byId("idTotalTunch").setText("");
    var oTable = this.byId("idCustTable");
    var oCount = this.byId("idItemsCount");
    var oWeight = this.byId("idTotalWeight");
    var oTunch = this.byId("idTotalTunch");
    var oFine = this.byId("idTotalFine");
    var nRows = oTable.getBinding("rows").getLength();
    var oTableData = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");
    // oTableData.splice(selIdxNo, 1); // removed i with selIdNo
    for(var i=0 ; i< nRows ; i++){
      var oContext= oTable.getContextByIndex(i);
      var recordsCnt = oContext.getProperty('PaggaNo');
      var totalWeight = oContext.getProperty('Weight');
      var avgTunch = oContext.getProperty('Tunch');
      var totalFine = oContext.getProperty('Fine');

      if(recordsCnt){
       count = count + 1;
        oCount.setText(count);
        if(totalWeight){
          tWeight = +tWeight + +totalWeight;
          tWeight=tWeight.toFixed(2);
          oWeight.setText(tWeight);
        }
        if(avgTunch){
          cntTunch = cntTunch + 1;
          tTunch = (+tTunch + +avgTunch) / cntTunch;
          tTunch=tTunch.toFixed(2);
          oTunch.setText(tTunch);
        }
        if(totalFine){
          tFine = (+tFine + +totalFine);
          tFine=tFine.toFixed(2);
          oFine.setText(tFine);
        }
      }
    }
  },
// this method is called as and when the used performs any action on input fields like putting the value setColor
// at this time we have the flexibility to perform any real time operation/calculations on the ui fields
  onliveChange: function(oEvent){
    debugger;
    var fine = 0.00;
    this.byId("idSaveIcon").setColor('red');
    var oCurrentRow = oEvent.getSource().getParent();
    var cells = oCurrentRow.getCells();
    var paggaNo  = cells[0].getValue;
    var aWeight  = cells[1].getValue;
    var aTunch   = cells[2].getValue;

    if(aWeight !== 0 || aWeight !== ""){
      cells[1].setValueState(sap.ui.core.ValueState.None);
    }
    if(aTunch !== 0 || aTunch !== ""){
      cells[2].setValueState(sap.ui.core.ValueState.None);
    }
    if(paggaNo){
      fine = (cells[1].getValue() * cells[2].getValue() / 100);
      if(fine != 0){
      fine = fine.toFixed(2);
      cells[3].setValue(fine);
    }else {
      cells[3].setValue(fine);
    }
    var tunch = cells[2].getValue();
    if(tunch > 100) {
      cells[2].setValueState("Error").setValueStateText("Tunch can not be greater then 100");
    }else {
      cells[2].setValueState(sap.ui.core.ValueState.None);
    }
    }

   this.getTotals();
  },
  onliveChangeWeight: function(oEvent){
    debugger;
    var fine = 0.00;
    this.byId("idSaveIcon").setColor('red');
    var oCurrentRow = oEvent.getSource().getParent();
    var cells = oCurrentRow.getCells();
    var paggaNo  = cells[0].getValue;
    var aWeight  = cells[1].getValue;
    var aTunch   = cells[2].getValue;

    if(aWeight !== 0 || aWeight !== ""){
      cells[1].setValueState(sap.ui.core.ValueState.None);
      // console.log(cells[1])

      if (this.getView().byId("idRb1").getSelected()) {
        var dQty = oEvent.mParameters.value.match(/^[+-]?\d{0,5}(\.\d{0,2})?/)[0];
        cells[1].setValue(dQty);
			} else if (this.getView().byId("idRb2").getSelected()) {
        var dQty = oEvent.mParameters.value.match(/^[+-]?\d{0,6}(\.\d{0,3})?/)[0];
        cells[1].setValue(dQty);
			}
    }
    if(aTunch !== 0 || aTunch !== ""){
      cells[2].setValueState(sap.ui.core.ValueState.None);
    }
    if(paggaNo){
      fine = (cells[1].getValue() * cells[2].getValue() / 100);
      if(fine != 0){
      fine = fine.toFixed(3);
      cells[3].setValue(fine);
    }else {
      cells[3].setValue(fine);
    }
    var tunch = cells[2].getValue();
    if(tunch > 100) {
      cells[2].setValueState("Error").setValueStateText("Tunch can not be greater then 100");
    }else {
      cells[2].setValueState(sap.ui.core.ValueState.None);
    }
    }

   this.getTotals();
  },
  onTransfer: function(){
    debugger;
    var that=this;
    var color = this.byId("idSaveIcon").getColor();
    var totalFine = this.byId("idTotalFine").getText();
    if(this.validateCustomer() === true && color == "green" && totalFine !== ""){
    that.getView().setBusy(true);
    var myData = this.getView().getModel("local").getProperty("/EntryData");
    myData.Date = this.getView().byId("idDate").getDateValue();
    myData.Remarks = "[Auto-Entry]kachhi parchi on"+ " " +myData.Date;
    myData.Silver = "-"+this.byId("idTotalFine").getText();
    myData.Customer = this.customerId;
    this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Entrys",
                              "POST", {}, myData, this)
    .then(function(oData) {
      that.getView().setBusy(false);
      sap.m.MessageToast.show(that.resourceBundle.getText("Transferred"));

    }).catch(function(oError) {
      that.getView().setBusy(false);
      var oPopover = that.getErrorMessage(oError);
    });
    this.kachhiBackup();
  }else if (color == "red"){
    MessageBox.show(
      that.resourceBundle.getText("Please12"), {
        icon: MessageBox.Icon.ERROR,
        title: "Error",
        actions: [MessageBox.Action.OK],
        onClose: function(oAction) { }
        });
  }else if(totalFine == "" || totalFine == 0){
    MessageBox.show(
      that.resourceBundle.getText("Please13"), {
        icon: MessageBox.Icon.ERROR,
        title: "Error",
        actions: [MessageBox.Action.OK],
        onClose: function(oAction) { }
        });
  }
  },
  kachhiBackup: function(){
    var that = this;
    this.getView().setBusy(true);
    var model = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");
    for(var i=0; i < model.length; i++){
      var myData = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData")[i];
      if (myData.PaggaNo !== 0){
         myData.Customer = this.getView().getModel("local").getProperty("/kacchiData").Customer
         myData.Date = this.getView().byId("idDate").getDateValue();
       if(this.validateAll(myData,i) === true){
        this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/KacchisBackup",
                                      "POST", {}, myData, this)

          .then(function(oData) {
            that.getView().setBusy(false);
            // sap.m.MessageToast.show("Transfer Data Saved Successfully");
            //read the data which is Saved
            that.byId("idSaveIcon").setColor('green');

          }).catch(function(oError) {
            that.getView().setBusy(false);
            var oPopover = that.getErrorMessage(oError);
          });
          var id  = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData")[i].id;
          var myUrl = "/Kacchis('" + id + "')"
          if(id !== ""){
            that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,
                                      "DELETE", {}, {}, that);
        }
      }
    }
  }
      that.getView().byId("idCustTable").clearSelection();
      that.byId("idTransferButton").setEnabled(false);
      that.clearScreen();
      that.createModel();
      that.getView().setBusy(false);
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
        deleteInd: "",
        Date: "",
        Customer:"",
        PaggaNo: 0,
        Weight: 0.00,
        Tunch: 0.00,
        Fine: 0.00
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
         debugger;
         // this.getKachhiCustPopup(oEvent)
      this.getCustomerPopup(oEvent);
  },
  onPressKacchiDownload: function() {
    debugger;
    var test = this.getView().getModel("local");
    debugger;
    var reportType = "Kacchi";
    var custId = test.oData.kacchiData.Customer;
    var name = test.oData.kachhiHeaderTemp.CustomerName;
    // var city = test.oData.City;
    // window.open("/kaachiDownload?type=Kacchi&id="+custId+"&name="+name+"&city="+city);
    window.open("/kaachiDownload?type=Kacchi&id="+custId+"&name="+name);

},
  validateCustomer: function(){
    var that = this;
    var retResult = true;
    var CustNo = this.byId("idCustNo").getValue()
    if ( CustNo === "" ) {
      retResult = false;
      MessageBox.show(
        "Please Select Customer first", {
          icon: MessageBox.Icon.ERROR,
          title: "Error",
          actions: [MessageBox.Action.OK],
          onClose: function(oAction) {
            if (oAction === MessageBox.Action.OK){
              that.getView().byId("idCustNo").setValueState("Error").setValueStateText("Customer is Mandatory Input");
            }
          }
        }
      );
    }
    return retResult;
  },

  validateAll: function(myData,i){
    debugger;
    var retVal = true;
    var model = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");
    var table = this.getView().byId("idCustTable");
    var tableBinding = table.getBinding("rows");
    if(myData.PaggaNo  !== 0 || myData.PaggaNo  !== ""){
      if(myData.Weight  == 0 || myData.Weight  === ""){
        table.getRows()[i].getCells()[1].setValueState("Error").setValueStateText("Weight Can't be Initial");
          retVal = false;
        return;
      }else {
        table.getRows()[i].getCells()[1].setValueState("None");
      }
      if(myData.Tunch  == 0 || myData.Tunch  === ""){
        table.getRows()[i].getCells()[2].setValueState("Error").setValueStateText("Tunch Can't be Initial");
          retVal = false;
        return;
      }else{
        table.getRows()[i].getCells()[2].setValueState("None");
      }
    }
    return retVal;
  },
  // Save the data entered in the UI table to the dataBase
  onSave: function(oEvent){
    debugger;
    var that = this;
    var recCount = that.byId("idItemsCount").getText();
    if(recCount == 0 || recCount == ""){
      MessageBox.show(
        that.resourceBundle.getText("Save11"), {
          icon: MessageBox.Icon.ERROR,
          title: "Error",
          actions: [MessageBox.Action.OK],
          onClose: function(oAction) { }
          });
    } else if(this.validateCustomer() === true){
      this.getView().setBusy(true);
      var model = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");
      var table = this.getView().byId("idCustTable");
      var tableBinding = table.getBinding("rows");
      for(var i=0; i < tableBinding.getLength(); i++){
         var myData = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData")[i];
         if (myData.PaggaNo !== 0){
            myData.Customer = this.getView().getModel("local").getProperty("/kacchiData").Customer
            myData.Date = this.getView().byId("idDate").getDateValue();
          if(this.validateAll(myData,i) === true &&
              myData.id        == ""){
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                                        "/Kacchis","POST", {}, myData, this)

              .then(function(oData) {
                that.getView().setBusy(false);
                sap.m.MessageToast.show(that.resourceBundle.getText("dataSave"));
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
                that.byId("idTransferButton").setEnabled(true);

              }).catch(function(oError) {
                that.getView().setBusy(false);
                var oPopover = that.getErrorMessage(oError);
          });
        }
      }
         else{}
    }
  }
   this.getView().setBusy(false);
  },
  onConfirmMessageBox:function(type,text,action1,action2,action3){

  },
  onClear:function(){
    debugger;
    var that = this;
    var saveStatusIconColor = this.byId("idSaveIcon").getColor();
    if(saveStatusIconColor == "red"){
      sap.m.MessageBox.confirm(that.resourceBundle.getText("Are11"),{
      title: "Confirm",
      styleClass: "",
      initialFocus: null,
      textDirection: sap.ui.core.TextDirection.Inherit,
      actions: ["Save & Clear","Clear", MessageBox.Action.CANCEL] ,
      onClose : function(oAction){
        if (oAction === "Clear") {
            that.clearScreen();
            that.createModel();
            that.byId("idSaveIcon").setColor('green');
            sap.m.MessageToast.show(that.resourceBundle.getText("Screen11"));
        }else if(oAction === "Save & Clear"){
          that.onSave();
          that.clearScreen();
          that.createModel();
          that.byId("idSaveIcon").setColor('green');
          sap.m.MessageToast.show(that.resourceBundle.getText("Screen12"));
        }
      }
    });
  }else if(saveStatusIconColor == "green"){
      sap.m.MessageBox.confirm(that.resourceBundle.getText("Are11"),{
      title: "Confirm",
      styleClass: "",
      initialFocus: null,
      textDirection: sap.ui.core.TextDirection.Inherit,
      actions: ["Clear", MessageBox.Action.CANCEL] ,
      onClose : function(oAction){
        if (oAction === "Clear") {
            that.clearScreen();
            that.createModel();
            that.byId("idSaveIcon").setColor('green');
            sap.m.MessageToast.show(that.resourceBundle.getText("Screen11"));
          }
        }
      });
    }
  },
  clearScreen: function(){
    var that=this;
    that.byId("idCustNo").setValue("");
    that.byId("idCustName").setValue("");
    that.byId("idDate").setDateValue(new Date());
    that.byId("idItemsCount").setText("");
    that.byId("idTotalWeight").setText("");
    that.byId("idTotalFine").setText("");
    that.byId("idTotalTunch").setText("");
  },
  onDelete: function(oEvent) {
    debugger;
    var that = this;
    var recCount = that.byId("idItemsCount").getText();
    if(recCount == 0 || recCount == ""){
      MessageBox.show(
        that.resourceBundle.getText("Screen13"), {
          icon: MessageBox.Icon.ERROR,
          title: "Error",
          actions: [MessageBox.Action.OK],
          onClose: function(oAction) { }
          });
    }else{
      sap.m.MessageBox.confirm(that.resourceBundle.getText("Screen14"),{
      title: "Confirm",                                    // default
      styleClass: "",                                      // default
      initialFocus: null,                                  // default
      textDirection: sap.ui.core.TextDirection.Inherit,     // default
      onClose : function(sButton){
        debugger;
      if (sButton === MessageBox.Action.OK) {
        var selIdxs = that.getView().byId("idCustTable").getSelectedIndices();
        var AllData = that.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");

        if (selIdxs.length) {
          for(var i=0; i < selIdxs.length; i++){
            var selIdxNo = selIdxs[i];
            var idToDelete = AllData[selIdxNo].id;
  // In order to delete the entries from DB table, the ID has to be there
  // Cases where the data is not saved before delete, will be handeled in method onSelDelete
            if(idToDelete !== ""){
              var myUrl = "/Kacchis('" + idToDelete + "')";

              that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,
                                        "DELETE", {}, {}, that);
            }
          }
  // on SelDelete will delete the selected rows from the UI table
          that.onSelDelete();
  // getTotal will recalculate the Totals of Pagga, Fine, Weight and Tunch
          that.getTotals();
          sap.m.MessageToast.show(that.resourceBundle.getText("Selected12"));
        }else{
          MessageBox.show(
            that.resourceBundle.getText("Screen15"), {
              icon: MessageBox.Icon.ERROR,
              title: "Error",
              actions: [MessageBox.Action.OK],
              onClose: function(oAction) { }
              });
            }
          }
        }
      });
    }
},
clearHeaderTotal: function(){
  // that = this;
  this.byId("idItemsCount").setText("");
  this.byId("idTotalWeight").setText("");
  this.byId("idTotalFine").setText("");
  this.byId("idTotalTunch").setText("");
},
getCustDataFromDB: function(oFilter){
  var that = this;
  this.getView().setBusy(true);
  this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
      "/Kacchis", "GET", {filters: [oFilter]}, {}, this)
    .then(function(oData) {
      debugger;
      that.getView().setBusy(false);
      if(oData.results.length > 0){          // that.clearScreen();
        that.createModel();
        var allItems = that.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");
        for(var i = 0 ; i<oData.results.length ; i++){
          debugger;
            allItems[i].PaggaNo  = oData.results[i].PaggaNo;
            allItems[i].id       = oData.results[i].id;
            allItems[i].Tunch    = oData.results[i].Tunch;
            allItems[i].Weight   = oData.results[i].Weight;
            allItems[i].Fine     = oData.results[i].Fine;
        }
        that.getView().getModel("kachhiLocalModel").setProperty("/kachhiData", allItems);
        that.byId("idSaveIcon").setColor('green');
        that.byId("idTransferButton").setEnabled(true);
        that.getTotals();
      }else{
        that.createModel();
        that.clearHeaderTotal();
        that.byId("idSaveIcon").setColor('green');
        that.byId("idTransferButton").setEnabled(false);
        sap.m.MessageToast.show(that.resourceBundle.getText("Screen16"));
      }
    }).catch(function(oError) {
  });
  this.getView().setBusy(false);
},
onConfirm: function(oEvent){
  debugger;
  var that = this;
  //Push the selected customer id to the local model
    var myData = this.getView().getModel("local").getProperty("/kacchiData");
    myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
    this.customerId = myData.Customer;
    // var CustFilter  = myData.Customer;
    this.getView().getModel("local").setProperty("/kacchiData", myData);
    var selCust = oEvent.getParameter("selectedItem").getLabel();
    var selCustName = oEvent.getParameter("selectedItem").getValue();
    if(selCust){
      var custHeader = this.getView().getModel("local").getProperty("/kachhiHeaderTemp");
          custHeader.CustomerId = selCust;
          custHeader.CustomerName = selCustName;
          this.getView().getModel("local").setProperty("/kachhiHeaderTemp", custHeader);
          this.getView().byId("idCustNo").setValueState();
    }
    var oFilter = new sap.ui.model.Filter("Customer","EQ", "'" + myData.Customer + "'");
    this.getCustDataFromDB(oFilter); // Get the data from DB for selected customer



    var selectedCust = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
    var that = this;
    var myData = this.getView().getModel("local").getProperty("/kacchiData");
    var selCust = oEvent.getParameter("selectedItem").getLabel();
    var selCustName = oEvent.getParameter("selectedItem").getValue();
    this.getView().byId("idCustNo").setValue(selCust);
    // this.getView().byId("idCustText").setText(selCustName);
    this.getView().getModel("local").setProperty("/kacchiData/Customer",
      oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
    this.getView().getModel("local").setProperty("/kachhiHeaderTemp/customerId",
      selCust);
    // myData.Customer=;
    this.getView().getModel("local").getProperty("/kacchiData", myData);
    var oFilter = new sap.ui.model.Filter("Customer", "EQ", "'" + myData.Customer + "'");
    // this.getView().byId("idTable").getBinding("items").filter(oFilter);
this.getCustDataFromDB(oFilter);
  },


  onEnter: function (oEvent) {
    debugger;
    this.getCustomer(oEvent);

    this.getView().byId("idTotalFine").focus();
    this.getView().byId("idTotalFine").$().find("input").select();
  },
  //
  // onConfirm: function (oEvent) {debugger;
  //   var selCust = oEvent.getParameter("selectedItem").getLabel();
  //   this.getView().byId("idCustNo").setValue(selCust);
  //   this.getView().getModel("local").setProperty("/kachhiData/CustomerName",
  //   oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
  //   // this.cusId= oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
  // },

});
});
