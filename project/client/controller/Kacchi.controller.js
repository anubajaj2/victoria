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
    this.createModel(); // Create Json Model for SAP.UI.Tabel
},
  // onValidateFieldGroup: function(oEvent){
  //   debugger;
  // },
  onliveChange: function(oEvent){
    this.byId("idSaveIcon").setColor('red');
    var oCurrentRow = oEvent.getSource().getParent();
    var cells = oCurrentRow.getCells();
    cells[3].setValue(cells[1].getValue() * cells[2].getValue() / 100);
    this.byId("idTunch")

  },
  // onSubmit: function (evt) {
  //       $(function() {
  //         $('input:text:first').focus();
  //         var $inp = $('input:text');
  //         $inp.bind('keydown', function(e) {
  //             //var key = (e.keyCode ? e.keyCode : e.charCode);
  //             var key = e.which;
  //             if (key == 13) {
  //                 e.preventDefault();
  //                 var nxtIdx = $inp.index(this) + 1;
  //                 $(":input:text:eq(" + nxtIdx + ")").focus();
  //             }
  //         });
  //     });
  // },
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
        Weight: 0,
        Tunch: 0,
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
           actions: [MessageBox.Action.OK, MessageBox.Action.NO] ,
           onClose : function(oAction){
             debugger;
             if (oAction === MessageBox.Action.OK) {
                 that.byId("idCustNo").setValue("");
                 that.byId("idCustName").setValue("");
                 that.byId("idDate").setDateValue(new Date());
                 that.createModel();
             }
             sap.m.MessageToast.show("Screen Cleared Successfully");
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
