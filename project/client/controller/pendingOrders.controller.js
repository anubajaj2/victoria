
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
    var that=this;
    that.getView().getModel("local").setProperty("/stockMaint/Date", new Date());
    this.getView().byId("idDate").setDateValue(new Date());
  },
  onMaterialSelect: function (oEvent) {
    debugger;
    var selMat = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
    var myData = this.getView().getModel("local").getProperty("/stockMaint");
    selMat.ProductCode;
    selMat.ProductName;
    selMat.Type;
    this.getView().byId("idMat").setValue(selMat.ProductCode);
    this.getView().byId("idMatText").setText(selMat.ProductName + "-" + selMat.Type);
    this.getView().getModel("local").setProperty("/stockMaint/Product",
    oEvent.getParameter("selectedItem").getBindingContext().getPath().split("'")[1]);
     this.getView().getModel("local").getProperty("/stockMaint",myData);
    var oFilter = new sap.ui.model.Filter("Product","EQ", "'" + myData.Product + "'");
    this.getView().byId("idTable").getBinding("items").filter(oFilter);
  },
  onSend: function (oEvent) {
    var that=this;
    that.getView().setBusy(true);
    var myData = this.getView().getModel("local").getProperty("/stockMaint");
     myData.Date = this.getView().byId("idDate").getDateValue();
    // myData.Product=this.getView().byId("idMat").getValue();
    myData.Description=this.getView().byId("idMatText").getText();
    myData.Description=myData.Description.split("-")[0];
    myData.Quantity=this.getView().byId("idqty").getValue();
    myData.Weight=this.getView().byId("idweight").getValue();
    myData.Remarks = this.getView().byId("idRemarks").getValue();
    this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/stockMaints",
                            "POST", {}, myData, this)
    .then(function(oData){
      that.getView().setBusy(false);
      sap.m.MessageToast.show("Data Saved Successfully");
       that.onClear();
    }).catch(function(oError) {
      that.getView().setBusy(false);
      var oPopover = that.getErrorMessage(oError);
    });
    this.getView().byId("idDate").setDateValue( new Date());
    this.getView().byId("idMat").setValue("");
  },
  onClear: function (){
  this.getView().byId("idDate").setDateValue(new Date());
  // this.getView().byId("idMat").setValue("");
  this.getView().byId("idMatText").setText("");
  this.getView().byId("idqty").setValue("0");
  this.getView().byId("idRemarks").setValue("");
  this.getView().byId("idweight").setValue("0");
  },
  onUpdateFinished: function(oEvent) {
    debugger;
    var oTable = oEvent.getSource();
    var itemList = oTable.getItems();
    var noofItems = itemList.length;
    var title = this.getView().getModel("i18n").getProperty("product");
    this.getView().byId("idTitle").setText(title + "(" + noofItems + ")");
    for(var i=0; i<noofItems; i++){
      debugger;
        var productId = oTable.getItems()[i].getCells()[2].getText();
        var productData = this.allMasterData.materials[productId];
        oTable.getItems()[i].getCells()[1].setText(productData.ProductCode);
    }
  },
  onDelete: function(){
    var that=this;
    sap.m.MessageBox.confirm(
"Deleting Selected Records", {
        title: "Confirm",
        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        styleClass: "",
        onClose: function(sAction) {
          debugger;
          if(sAction==="OK"){
            debugger;
             var x = that.getView().byId("idTable").getSelectedItems();
             for(var i=0; i<x.length; i++){
               debugger;
               var myUrl = x[i].getBindingContext().sPath;
               that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,"DELETE",{},{},that);
                sap.ui.getCore().byId("__component0---idpendingOrders--idTable").getModel().refresh(true);

              }
            }
          }
        });
      }
  });
});
