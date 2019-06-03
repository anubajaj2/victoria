/*global location*/
sap.ui.define(
  ["victoria/controller/BaseController",
      "sap/ui/model/json/JSONModel",
      "sap/ui/core/routing/History",
      "victoria/models/formatter",
      "sap/m/MessageToast", "sap/ui/model/Filter"],
  function (BaseController, JSONModel, History, formatter,
            MessageToast, Filter) {
        "use strict";

        return BaseController.extend("victoria.controller.salesws", {
          onInit: function (oEvent){
            debugger;
          this.getView().byId("DateId").setDateValue( new Date());
            // this.orderHeader();
  // Item Table as input table
                  this.orderItem(oEvent);
  // Return Item Table as input table
                  this.orderReturn();
          },
          valueHelpCustomer: function (oEvent) {
            this.getCustomerPopup(oEvent);
          },
          onConfirm: function(oEvent){
            debugger;
            //whatever customer id selected push that in local model
              var myData = this.getView().getModel("local").getProperty("/orderHeader");
              myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
              this.getView().getModel("local").setProperty("/demoData", myData);
              var selCust = oEvent.getParameter("selectedItem").getLabel();
              var selCustName = oEvent.getParameter("selectedItem").getValue();
              this.getView().byId("customerId").setValue(selCust);
              this.getView().byId("custName").setText(selCustName);
              // End of addition by Sweta
          },
          onMaterialF4: function(oEvent) {
            this.getMaterialPopup(oEvent);
          },
        });

    });
