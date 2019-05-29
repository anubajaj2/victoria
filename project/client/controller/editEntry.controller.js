sap.ui.define(["victoria/controller/BaseController"],
function (BaseController) {
  "use strict";
  return BaseController.extend("victoria.controller.editEntry",{
    onInit: function () {

    },
    onValueHelpRequest: function () {
      this.getCustomerPopup();
    }
    // onConfirm: function(oEvent){
    //   //whatever customer id selected push that in local model
    //     var myData = this.getView().getModel("local").getProperty("/editEntryData");
    //     myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
    //     this.getView().getModel("local").setProperty("/editEntryData", myData);
    //     // added by sweta to populate the selected cust to the input field
    //     var selCust = oEvent.getParameter("selectedItem").getLabel();
    //     var selCustName = oEvent.getParameter("selectedItem").getValue();
    //     this.getView().byId("idCust").setValue(selCust);
    //     // this.getView().byId("idCustName").setText(selCustName);
    //     // End of addition by Sweta
  // }
  });

});
