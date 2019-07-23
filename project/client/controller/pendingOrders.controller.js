
sap.ui.define(["victoria/controller/BaseController",
"sap/m/MessageBox",
"sap/m/MessageToast",
"sap/ui/core/routing/History"],
function (BaseController,MessageBox,MessageToast,History) {
  "use strict";
  return BaseController.extend("victoria.controller.pendingOrders", {
    onInit: function () {
    BaseController.prototype.onInit.apply(this);
    var oRouter = this.getRouter();
    oRouter.getRoute("pendingOrders").attachMatched(this._onRouteMatched,this);
  },
  getRouter: function () {
    return sap.ui.core.UIComponent.getRouterFor(this);
  },
  _onRouteMatched: function () {
  },
  onMaterialSelect: function (oEvent) {
    debugger;
    var selMat = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
    selMat.ProductCode;
    selMat.ProductName;
    selMat.Type;
    this.getView().byId("idMat").setValue(selMat.ProductCode);
    this.getView().byId("idMatText").setText(selMat.ProductName + "-" + selMat.Type);
  },
  onSend: function (oEvent) {
    var that=this;
    that.getView().setBusy(true);
    var myData = this.getView().getModel("local").getProperty("/stockMaint");
    myData.Product=this.getView().byId("idMat").getValue();
    myData.Description=this.getView().byId("idMatText").getText();
    myData.Description=myData.Description.split("-")[0];
    myData.Quantity=this.getView().byId("idqty").getValue();
    myData.Weight=this.getView().byId("idweight").getValue();
    this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/stockMaints",
                            "POST", {}, myData, this)
    .then(function(oData){
      that.getView().setBusy(false);
      sap.m.MessageToast.show("Data Saved Successfully");
    }).catch(function(oError) {
    });
  }
  });
});
