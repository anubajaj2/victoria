sap.ui.define(["victoria/controller/BaseController","sap/ui/model/json/JSONModel"],
function (BaseController,JSONModel) {
  "use strict";
  return BaseController.extend("victoria.controller.Entry",{
    onInit: function () {
      var iOriginalBusyDelay,
        oViewModel = new JSONModel({
          busy : false,
          delay : 0,
          dateValue: new Date(),
          Customer:"",
          Cash:0,
          Gold:0,
          Silver:0,
          Remarks:"",
          Weight:"",
          Tunch:"",
          DueDate:""
        });
        	this.setModel(oViewModel, "objectView");



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
     this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/EntryData",
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
     this.byId("DateId").setValue("");
     this.byId("idCust").setValue("");
     this.byId("idCustText").setValue("");
     this.byId("idweight").setValue("0");
     this.byId("idRemarks").setValue("");
     this.byId("idCash").setValue("0");
     this.byId("idGold").setValue("0");
     this.byId("idSilver").setValue("0");

   }
   // onUpdateFinished: function(oEvent){
   //   debugger;
   //   var oTable = oEvent.getSource();
   //   var itemList = oTable.getItems();
   //   var noOfItems = itemList.length;
   //   var value1;
   //   var id;
   //   var cell;
   //   debugger;
   //   for (var i = 0; i < noOfItems; i++) {
   //     //Read the GUID from the Screen
   //     var customerId = oTable.getItems()[i].getCells()[2].getText();
   //     var customerData = this.allMasterData.customers[customerId];
   //     oTable.getItems()[i].getCells()[2].setText(customerData.CustomerCode + ' - ' + customerData.Name );
   //
   //     // var materialId = oTable.getItems()[i].getCells()[3].getText();
   //     // var materialData = this.allMasterData.materials[materialId];
   //     // oTable.getItems()[i].getCells()[3].setText(materialData.ProductCode + ' - ' + materialData.ProductName );
   //
   //     //Find the customer data for that Guid in customer collection
   //     //Change the data on UI table with semantic information
   //   }
   // }


  });

});
