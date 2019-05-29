sap.ui.define(
  ["victoria/controller/BaseController"],
  function (BaseController) {
      "use strict";
  return BaseController.extend("victoria.controller.CustomerOrders", {

    onInit: function () {

    },
    onValueHelp: function(oEvent){
      this.getCustomerPopup(oEvent);
    },

    onValueHelpMat: function(){
      this.getMaterialPopup();
    },

    onConfirm: function(oEvent){
      //whatever customer id selected push that in local model
        debugger;
        var myData = this.getView().getModel("local").getProperty("/customerOrder");
        if(oEvent.getSource().getTitle() === "Material Search"){
          var selMat = oEvent.getParameter("selectedItem").getLabel();
          var selMatName = oEvent.getParameter("selectedItem").getValue();
          this.getView().byId("idCoMaterial").setValue(selMat);
          this.getView().byId("idCoMatName").setValue(selMatName);
          myData.Material = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
        }else if (oEvent.getSource().getTitle() === "Karigar Search") {

          var selKarigar = oEvent.getParameter("selectedItem").getLabel();
          var selKarigarName = oEvent.getParameter("selectedItem").getValue();
          this.getView().byId("idCoKarigar").setValue(selKarigar);
          this.getView().byId("idCoKarigarName").setValue(selKarigarName);
          myData.Karigar = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
        }
        else{
          var selCust = oEvent.getParameter("selectedItem").getLabel();
          var selCustName = oEvent.getParameter("selectedItem").getValue();
          this.getView().byId("idCoCustomer").setValue(selCust);
          this.getView().byId("idCoCustomerText").setValue(selCustName);
          myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
        }

        this.getView().getModel("local").setProperty("/customerOrder", myData);
    },

    onSave: function(){
      var that = this;
      that.getView().setBusy(true);
      var myData = this.getView().getModel("local").getProperty("/customerOrder");
      myData.Date =  this.getView().byId("idCoDate").getDateValue();
      myData.DelDate = this.getView().byId("idCoDelDate").getDateValue();
      myData.Qty = this.getView().byId("idCoQty").getValue();
      myData.Weight = this.getView().byId("idCoWeight").getValue();
      myData.Making = this.getView().byId("idCoMaking").getValue();
      myData.Remarks = this.getView().byId("idCoRemarks").getValue();
      myData.Cash = this.getView().byId("idCoCash").getValue();
      myData.Gold = this.getView().byId("idCoGold").getValue();
      myData.Silver = this.getView().byId("idCoSilver").getValue();
      myData.Picture = this.getView().byId("idCoPicture").getValue();
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
    },

    onDelete: function(){
      debugger;
      var aSelectedLines = this.byId("idCoTable").getSelectedItems();
      if (aSelectedLines.length) {
        for(var i=0; i < aSelectedLines.length; i++){
          var myUrl = aSelectedLines[i].getBindingContext().sPath;
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(), myUrl,
                                    "DELETE", {}, {}, this);
        }
      }
    },
    onClear: function(){
      this.byId("idCoDate").setValue("");
      this.byId("idCoDelDate").setValue("");
      this.byId("idCoCustomer").setValue("");
      this.byId("idCoCustomerText").setValue("");
      this.byId("idCoMaterial").setValue("");
      this.byId("idCoMatName").setValue("");
      this.byId("idCoQty").setValue("0");
      this.byId("idCoWeight").setValue("0");
      this.byId("idCoMaking").setValue("0");
      this.byId("idCoRemarks").setValue("");
      this.byId("idCoCash").setValue("0");
      this.byId("idCoGold").setValue("0");
      this.byId("idCoSilver").setValue("0");
      this.byId("idCoPicture").setValue("");
      this.byId("idCoKarigar").setValue("");
      this.byId("idCoKarigarName").setValue("");
    },

    onUpdateFinished: function(oEvent){
      debugger;
      var oTable = oEvent.getSource();
      var itemList = oTable.getItems();
      var noOfItems = itemList.length;
      var value1;
      var id;
      var cell;
      debugger;
      for (var i = 0; i < noOfItems; i++) {
        //Read the GUID from the Screen
        var customerId = oTable.getItems()[i].getCells()[2].getText();
        var customerData = this.allMasterData.customers[customerId];
        oTable.getItems()[i].getCells()[2].setText(customerData.CustomerCode + ' - ' + customerData.Name );

        var materialId = oTable.getItems()[i].getCells()[3].getText();
        var materialData = this.allMasterData.materials[materialId];
        oTable.getItems()[i].getCells()[3].setText(materialData.ProductCode + ' - ' + materialData.ProductName );

        //Find the customer data for that Guid in customer collection
        //Change the data on UI table with semantic information
      }
    }

  });
});
