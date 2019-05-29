
sap.ui.define(["victoria/controller/BaseController"],
function (BaseController) {
  "use strict";
  return BaseController.extend("victoria.controller.CollaborationCenter", {
     onInit: function () {},
     onValueHelpRequest: function () {
       this.getMaterialPopup();

     },
     onConfirm: function (oEvent) {
       var selMat = oEvent.getParameter("selectedItem").getLabel();
       var selMatText = oEvent.getParameter("selectedItem").getValue();
       this.getView().byId("idMat").setValue(selMat);
       this.getView().byId("idMatText").setValue(selMatText);
      var myData= this.getView().getModel("local").getProperty("/collaborationData");
      myData.Material=oEvent.getParameter("selectedItem").getKey();
      this.getView().getModel("local").getProperty("/collaborationData",myData);
    },
    onSave: function () {
      debugger;
      // this.getView().setBusy(true);
      // var myData = this.getView().getModel("local").getProperty("/collaborationData");
      // myData.Qty= this.getView().byId("idQty").get
    }
  });
});
