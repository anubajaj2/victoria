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
  });
});
