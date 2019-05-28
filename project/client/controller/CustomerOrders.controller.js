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
        var myData = this.getView().getModel("local").getProperty("/customerOrder");
        if(oEvent.getSource().getTitle() === "Material Search"){
          var selMat = oEvent.getParameter("selectedItem").getLabel();
          var selMatName = oEvent.getParameter("selectedItem").getValue();
          this.getView().byId("idCoMaterial").setValue(selMat);
          this.getView().byId("idCoMatName").setValue(selMatName);
          myData.Material = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
        }else{
          // added by sweta to populate the selected cust to the input field
          debugger;
          var selCust = oEvent.getParameter("selectedItem").getLabel();
          var selCustName = oEvent.getParameter("selectedItem").getValue();
          this.getView().byId("idCoCustomer").setValue(selCust);
          this.getView().byId("idcoCustomerText").setValue(selCustName);
          myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
          // End of addition by Sweta
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
      myData.Karigar = this.getView().byId("idCoKarigar").getValue();
      myData.Remarks = this.getView().byId("idCoRemarks").getValue();
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
        debugger;
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
