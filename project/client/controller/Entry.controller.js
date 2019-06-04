sap.ui.define(["victoria/controller/BaseController","sap/ui/model/json/JSONModel","victoria/models/formatter"],
function (BaseController,JSONModel,formatter) {
  "use strict";
  return BaseController.extend("victoria.controller.Entry",{
    formatter:formatter,
    onInit: function () {
      var that = this;
      debugger;
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Customers", "GET", null, null, this)
        .then(function(oData) {
          for (var i = 0; i < oData.results.length; i++) {
            that.allMasterData.customers[oData.results[i].id] = oData.results[i];
          }
        }).catch(function(oError) {
          var oPopover = that.getErrorMessage(oError);
        });

      var iOriginalBusyDelay,
        oViewModel = new JSONModel({
          busy : false,
          delay : 0,
          dateValue: new Date(),
          Customer:"",
          Cash:1400,
          Gold:0,
          Silver:0,
          Remarks:"",
          Weight:0,
          Tunch:0,
          DueDate:""
        });
        	this.setModel(oViewModel, "objectView");
          this.getView().byId("DateId").setDateValue( new Date());
      },

    CustomerPopup: function (Evt) {
      if(!this.searchPopup){
        this.searchPopup=new sap.ui.xmlfragment("victoria.fragments.popup",this);
        this.getView().addDependent(this.searchPopup);
        var title= this.getView().getModel("i18n").getProperty("customer");
        this.searchPopup.setTitle(title);
        this.searchPopup.bindAggregation("items",{
          path: '/Customers',
          template: new sap.m.DisplayListItem({
            id: "idCustPopup",
            label:"{CustomerCode}",
            value:"{Name}-{City}"
          })
        });
      }
      this.searchPopup.open();
    },

    onValueHelpRequest: function () {
      this.CustomerPopup();
    },

    onRadioButtonSelect: function (oEvent) {
      debugger;
    jQuery.sap.delayedCall(500, this, function() {
        this.getView().byId("idweight").focus();
    });
},

    onConfirm: function (oEvent) {
     var myData = this.getView().getModel("local").getProperty("/EntryData");
     var selCust = oEvent.getParameter("selectedItem").getLabel();
     var selCustName = oEvent.getParameter("selectedItem").getValue();
     this.getView().byId("idCust").setValue(selCust);
     this.getView().byId("idCustText").setValue(selCustName);
     myData.Customer=oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
     this.getView().getModel("local").getProperty("/EntryData",myData);
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
   },

   onDelete: function(){
     debugger;
     var aSelectedLines = this.byId("idTable").getSelectedItems();
     if (aSelectedLines.length) {
       for(var i=0; i < aSelectedLines.length; i++){
         var myUrl = aSelectedLines[i].getBindingContext().sPath;
         this.ODataHelper.callOData(this.getOwnerComponent().getModel(), myUrl,
                                   "DELETE", {}, {}, this);
       }
     }
   },

   onClear: function(){
       this.getView().byId("DateId").setDateValue( new Date());
     this.byId("idCust").setValue("");
     this.byId("idCustText").setValue("");
     this.byId("idweight").setValue("0");
     this.byId("idRemarks").setValue("");
     this.byId("idCash").setValue("0");
     this.byId("idGold").setValue("0");
     this.byId("idSilver").setValue("0");
     this.byId("idtunch").setValue("0");

   },

   allMasterData: {
     "customers":[]
   },

   onUpdateFinished: function (oEvent) {
     debugger;
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
   }
  });

});
