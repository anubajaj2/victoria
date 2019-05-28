sap.ui.define(["victoria/controller/BaseController"],
function (BaseController) {
  "use strict";
  return BaseController.extend("victoria.controller.editEntry",{
    onInit: function () {

    },
    onValueHelpRequest: function () {
      this.getCustomerPopup();
    },
    onConfirm: function () {

    }

  });

});
