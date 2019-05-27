sap.ui.define(
  ["victoria/controller/BaseController"],
  function (BaseController) {
      "use strict";
  return BaseController.extend("victoria.controller.CustomerOrders", {

    onInit: function () {

    },
    onValueHelp: function(){
      this.getCustomerPopup();
    },

    onValueHelpMat: function(){
      this.getMaterialPopup();
    },

    onConfirm: function(oEvent){
      //whatever customer id selected push that in local model
      debugger;
        var myData = this.getView().getModel("local").getProperty("/customerOrder");
        myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
        this.getView().getModel("local").setProperty("/customerOrder", myData);
        // added by sweta to populate the selected cust to the input field
        var selCust = oEvent.getParameter("selectedItem").getLabel();
        var selCustName = oEvent.getParameter("selectedItem").getValue();
        this.getView().byId("idCoCustomer").setValue(selCust);
        this.getView().byId("idcoCustomerText").setValue(selCustName);
        // End of addition by Sweta
    },

    onSave: function(){
      var that = this;
      that.getView().setBusy(true);
      var myData = this.getView().getModel("local").getProperty("/customerOrder");
      myData.Date =  this.getView().byId("idCoDate").getDateValue();
      myData.DelDate = this.getView().byId("idCoDelDate").getDateValue();
      myData.Qty = this.getView().byId("idCoQty").getValue();
      myData.Weight = this.getView().byId("idCoWeight").getValue();
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/CustomerOrders",
                                "POST", {}, myData, this)
      .then(function(oData) {
        that.getView().setBusy(false);
        sap.m.MessageToast.show("Data Saved Successfully");

      }).catch(function(oError) {
        that.getView().setBusy(false);
        var oPopover = that.getErrorMessage(oError);
      });
      ;
    }
  });
});
