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
  });
});
