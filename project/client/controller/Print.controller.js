/*global location*/
sap.ui.define(
    ["victoria/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "victoria/models/formatter",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/m/MessageBox"],
  function (BaseController,JSONModel,History,formatter,MessageToast,Filter,MessageBox) {
        "use strict";
  var customerId;
  return BaseController.extend("victoria.controller.Print", {
  onInit: function(){
    BaseController.prototype.onInit.apply(this);
    var oRouter = this.getRouter();
    oRouter.getRoute("Print").attachMatched(this._onRouteMatched, this);
    // this.createModel();
  },
  createModel: function(){
   // var oPrintmodel = new JSONModel();
   // var oPrintItem = {
   //     compName = "",
   //     phone = "",
   //     address = "",
   //     rCompName="",
   //     rAddress="",
   //     rPhone="",
   //     rWeight="",
   //     rQuantity="",
   //     rLessQunatity="",
   //     rSubTotal="",
   //     rMakingCharge="",
   //     rBhav="",
   //     rMakingType="",
   //     rFooter="",
   //     rReturnBhav="",
   //     rReturnWeight="",
   //     rFineTotal="",
   //     rLessWeight=""
   // }
  },
  getRouter: function(){
      return this.getOwnerComponent().getRouter();
  },
  _onRouteMatched: function(oEvent){
    debugger;
      var that = this;
      that.clearScreen();
      var allItems = this.getView().getModel("local").getProperty("/printCustomizingData");
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/prints", "GET", {}, {}, this)
        .then(function(oData) {
          debugger;
          that.getView().setBusy(false);
          if(oData.results.length > 0){
            // this.getView().getModel("local").getProperty("/printCustomizingData");

          }
        }).catch(function(oError) {
      });
      this.getView().setBusy(false);

  },
  clearScreen: function(){
    var that = this;
    that.byId("idCompName").setValue("");
    that.byId("idAdd").setValue("");
    // that.byId("idContNo").setValue("");

  },
  updateData: function(oData){
    debugger;
    var that = this;
    var allItems = that.getView().getModel("local").getProperty("/printCustomizingData");
    var id = oData.results[0].id;
    this.getModel().update("/prints(" +id+ ")",allItems,{
      success: function(){
        // MessageToast.show("Updated successfully");
      }
    });
  },
  createData: function(oData){
    var that = this;
    var allItems = that.getView().getModel("local").getProperty("/printCustomizingData");
    this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/prints", "POST", {}, allItems,this)
      .then(function(oData) {
       debugger;
      }).catch(function(oError) {
       that.getView().setBusy(false);
       var oPopover = that.getErrorMessage(oError);
     });
  },
  onSubmit: function(oEvent){
    debugger;
    var that = this;
    this.getView().setBusy(true);
    var sId = oEvent.getSource().getId();
    var val = oEvent.getSource().mProperties.value;
    var allItems = this.getView().getModel("local").getProperty("/printCustomizingData");
    allItems.Name = sId;
    if (oEvent.getSource().mProperties.name == "switch") {
      var switchVal = oEvent.getSource().mProperties.state;
      allItems.Value = "" +switchVal+ "";
    }
    else{
      allItems.Value = oEvent.getSource().mProperties.value;
    }

    this.getView().getModel("local").setProperty("/printCustomizingData", allItems);
    var oFilter = new sap.ui.model.Filter("Name","EQ",sId);
    if(allItems.Value){
      debugger;
    }
    this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
        "/prints", "GET", {filters: [oFilter]}, {}, this)
      .then(function(oData) {
        debugger;
        that.getView().setBusy(false);
        if(oData.results.length > 0){
          that.updateData(oData);
        }else{
          that.createData(oData);
        }
      }).catch(function(oError) {
    });
    this.getView().setBusy(false);

  }

});
});
